import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getPool, query, queryOne, dbNowIso, type DbUserRow } from "@/lib/db";

export type ApexUser = {
  id: string;
  phone?: string;
  email?: string;
  username?: string;
  name: string;
  avatar?: string;
  provider?: "phone" | "email" | "google" | "apple" | "github";
  createdAt: string;
};

const OTP_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_COOKIE = "apex_session";

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function mapUser(row: DbUserRow): ApexUser {
  return {
    id: row.id,
    email: row.email || undefined,
    username: row.username || undefined,
    phone: row.phone || undefined,
    name: row.name,
    avatar: row.avatar || undefined,
    provider: row.provider as ApexUser["provider"],
    createdAt: row.created_at,
  };
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidUsername(username: string) {
  return /^[a-zA-Z0-9_]{3,24}$/.test(username.trim());
}

export async function createOtp(
  key: string,
  options?: { channel?: "sms" | "email" | "social"; purpose?: string; meta?: Record<string, string> }
) {
  const code = generateOtp();
  const id = generateId("otp");
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();
  const now = dbNowIso();
  const channel = options?.channel || "sms";
  const purpose = options?.purpose || "login";
  const meta = options?.meta;

  await query("DELETE FROM otp_challenges WHERE challenge_key = ?", [key]);
  await query(
    `INSERT INTO otp_challenges (id, challenge_key, code, channel, purpose, attempts, meta_json, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    [id, key, code, channel, purpose, meta ? JSON.stringify(meta) : null, expiresAt, now]
  );

  return code;
}

export async function verifyOtp(key: string, code: string) {
  const record = await queryOne<{
    id: string;
    code: string;
    attempts: number;
    meta_json: string | null;
    expires_at: string;
  }>("SELECT * FROM otp_challenges WHERE challenge_key = ?", [key]);

  if (!record) return { ok: false as const, error: "No verification code requested." };

  if (Date.now() > new Date(record.expires_at).getTime()) {
    await query("DELETE FROM otp_challenges WHERE id = ?", [record.id]);
    return { ok: false as const, error: "Code expired. Request a new one." };
  }

  if (record.attempts >= 5) {
    await query("DELETE FROM otp_challenges WHERE id = ?", [record.id]);
    return { ok: false as const, error: "Too many attempts. Request a new code." };
  }

  await query("UPDATE otp_challenges SET attempts = attempts + 1 WHERE id = ?", [record.id]);

  if (record.code !== code) {
    return { ok: false as const, error: "Invalid code. Try again." };
  }

  const meta = record.meta_json ? (JSON.parse(record.meta_json) as Record<string, string>) : undefined;
  await query("DELETE FROM otp_challenges WHERE id = ?", [record.id]);
  return { ok: true as const, meta };
}

export async function createSession(user: ApexUser) {
  const token = generateId("tok");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const now = dbNowIso();
  await query(`INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`, [
    token,
    user.id,
    expiresAt,
    now,
  ]);
  return { user, token };
}

async function ensureWallet(userId: string) {
  await query(
    `INSERT IGNORE INTO wallets (user_id, balance_cents, currency, updated_at) VALUES (?, 284055, 'USD', ?)`,
    [userId, dbNowIso()]
  );
}

export async function createPhoneSession(phone: string, name?: string) {
  const existing = await queryOne<DbUserRow>("SELECT * FROM users WHERE phone = ?", [phone]);
  if (existing) {
    const now = dbNowIso();
    await query(
      `UPDATE users SET phone_verified_at = COALESCE(phone_verified_at, ?), updated_at = ? WHERE id = ?`,
      [now, now, existing.id]
    );
    return createSession(mapUser(existing));
  }

  const now = dbNowIso();
  const user: ApexUser = {
    id: generateId("usr"),
    phone,
    name: name || `Apex User ${phone.slice(-4)}`,
    provider: "phone",
    createdAt: now,
  };

  await query(
    `INSERT INTO users (id, phone, name, provider, phone_verified_at, created_at, updated_at)
     VALUES (?, ?, ?, 'phone', ?, ?, ?)`,
    [user.id, user.phone, user.name, now, now, now]
  );

  await ensureWallet(user.id);
  return createSession(user);
}

export async function getSession(token?: string | null) {
  if (!token) return null;

  const row = await queryOne<DbUserRow & { token: string; expires_at: string }>(
    `SELECT s.token, s.expires_at, u.*
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = ?`,
    [token]
  );

  if (!row) return null;

  if (Date.now() > new Date(row.expires_at).getTime()) {
    await query("DELETE FROM sessions WHERE token = ?", [token]);
    return null;
  }

  return {
    token: row.token,
    user: mapUser(row),
    expiresAt: new Date(row.expires_at).getTime(),
  };
}

export async function destroySession(token?: string | null) {
  if (!token) return;
  await query("DELETE FROM sessions WHERE token = ?", [token]);
}

export async function registerWithEmail(input: {
  name: string;
  email: string;
  username: string;
  password: string;
}) {
  const email = normalizeEmail(input.email);
  const username = normalizeUsername(input.username);

  if (!input.name.trim() || input.name.trim().length < 2) {
    return { ok: false as const, error: "Enter your full name." };
  }
  if (!isValidEmail(email)) {
    return { ok: false as const, error: "Enter a valid email address." };
  }
  if (!isValidUsername(username)) {
    return { ok: false as const, error: "Username must be 3–24 letters, numbers, or _." };
  }
  if (input.password.length < 8) {
    return { ok: false as const, error: "Password must be at least 8 characters." };
  }

  if (await queryOne("SELECT id FROM users WHERE email = ?", [email])) {
    return { ok: false as const, error: "Email already registered. Please login." };
  }
  if (await queryOne("SELECT id FROM users WHERE username = ?", [username])) {
    return { ok: false as const, error: "Username already taken." };
  }

  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(input.password, salt);
  const now = dbNowIso();
  const user: ApexUser = {
    id: generateId("usr"),
    email,
    username,
    name: input.name.trim(),
    provider: "email",
    createdAt: now,
  };

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `INSERT INTO users (id, email, username, name, provider, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'email', ?, ?)`,
      [user.id, email, username, user.name, now, now]
    );
    await conn.execute(`INSERT INTO credentials (user_id, password_hash, salt, created_at) VALUES (?, ?, ?, ?)`, [
      user.id,
      passwordHash,
      salt,
      now,
    ]);
    await conn.execute(
      `INSERT IGNORE INTO wallets (user_id, balance_cents, currency, updated_at) VALUES (?, 284055, 'USD', ?)`,
      [user.id, now]
    );
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return { ok: true as const, ...(await createSession(user)) };
}

export async function loginWithEmail(input: { identifier: string; password: string }) {
  const identifier = input.identifier.trim().toLowerCase();
  if (!identifier || input.password.length < 1) {
    return { ok: false as const, error: "Enter email/username and password." };
  }

  const row = await queryOne<DbUserRow & { password_hash: string; salt: string }>(
    `SELECT u.*, c.password_hash, c.salt
     FROM users u
     JOIN credentials c ON c.user_id = u.id
     WHERE u.email = ? OR u.username = ?`,
    [identifier, identifier]
  );

  if (!row) {
    return { ok: false as const, error: "Account not found. Sign up first." };
  }

  const candidate = hashPassword(input.password, row.salt);
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(row.password_hash, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false as const, error: "Incorrect password." };
  }

  return { ok: true as const, ...(await createSession(mapUser(row))) };
}

export async function startSocialChallenge(
  provider: "google" | "apple" | "github",
  email: string
) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false as const, error: "Enter the email linked to your social account." };
  }
  const challengeId = generateId("soc");
  const key = `social:${challengeId}`;
  await createOtp(key, {
    channel: "social",
    purpose: "social_auth",
    meta: { provider, email: normalized },
  });
  return { ok: true as const, challengeId, email: normalized, provider };
}

export async function completeSocialChallenge(challengeId: string, code: string, name?: string) {
  const key = `social:${challengeId}`;
  const result = await verifyOtp(key, code);
  if (!result.ok) return result;

  const provider = (result.meta?.provider || "google") as "google" | "apple" | "github";
  const email = result.meta?.email || "";

  const existing = await queryOne<DbUserRow>("SELECT * FROM users WHERE email = ?", [email]);
  if (existing) return { ok: true as const, ...(await createSession(mapUser(existing))) };

  const now = dbNowIso();
  const user: ApexUser = {
    id: generateId("usr"),
    email,
    username: `${provider}_${createHash("sha256").update(email).digest("hex").slice(0, 6)}`,
    name: name?.trim() || `${provider[0].toUpperCase()}${provider.slice(1)} Voyager`,
    provider,
    createdAt: now,
  };

  await query(
    `INSERT INTO users (id, email, username, name, provider, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user.id, email, user.username, user.name, provider, now, now]
  );

  await ensureWallet(user.id);
  return { ok: true as const, ...(await createSession(user)) };
}

export async function logIntent(input: {
  userId?: string | null;
  query: string;
  moduleId?: string | null;
  action?: string | null;
  confidence?: number | null;
  entities?: unknown;
}) {
  await query(
    `INSERT INTO intent_logs (id, user_id, query, module_id, action, confidence, entities_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      generateId("int"),
      input.userId || null,
      input.query,
      input.moduleId || null,
      input.action || null,
      input.confidence ?? null,
      input.entities ? JSON.stringify(input.entities) : null,
      dbNowIso(),
    ]
  );
}

export { SESSION_COOKIE };
