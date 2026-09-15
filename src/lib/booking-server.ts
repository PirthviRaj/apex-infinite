import { randomBytes } from "crypto";
import { query, queryOne, dbNowIso } from "@/lib/db";
import type { CheckoutResult } from "@/lib/checkout-types";

export type ModuleBookingInput = {
  moduleId: string;
  resourceType: string;
  resourceId: string;
  title: string;
  amountCents: number;
  startsAt?: string | null;
  endsAt?: string | null;
  meta?: Record<string, unknown>;
  checkout: CheckoutResult;
};

export type ModuleBookingResult = {
  bookingId: string;
  orderId: string;
  paymentId: string;
  reference: string;
  status: "confirmed";
  amountCents: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  paymentMethod: string;
};

function generateId(prefix: string) {
  return `${prefix}_${randomBytes(6).toString("hex")}${Date.now().toString(36).slice(-4)}`;
}

function referenceCode() {
  return `APX-${randomBytes(3).toString("hex").toUpperCase()}`;
}

async function getWalletBalance(userId: string) {
  const row = await queryOne<{ balance_cents: number }>(
    "SELECT balance_cents FROM wallets WHERE user_id = ?",
    [userId]
  );
  return row?.balance_cents ?? 0;
}

export async function createModuleBooking(userId: string, input: ModuleBookingInput) {
  const moduleRow = await queryOne<{ id: string }>("SELECT id FROM modules WHERE id = ?", [
    input.moduleId,
  ]);
  if (!moduleRow) {
    return { ok: false as const, error: "Unknown module." };
  }

  if (input.amountCents < 0) {
    return { ok: false as const, error: "Invalid amount." };
  }

  const { checkout } = input;
  const name = checkout.personal.fullName.trim();
  const phone = checkout.personal.phone.trim();
  const email = checkout.personal.email.trim();

  if (name.length < 2) return { ok: false as const, error: "Enter your full name." };
  if (phone.replace(/\D/g, "").length < 8) return { ok: false as const, error: "Enter a valid phone." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, error: "Enter a valid email." };
  }

  if (checkout.payment.method === "apexpay" && input.amountCents > 0) {
    const balance = await getWalletBalance(userId);
    if (balance < input.amountCents) {
      return { ok: false as const, error: "Insufficient ApexPay wallet balance." };
    }
  }

  const now = dbNowIso();
  const bookingId = generateId("bkg");
  const orderId = generateId("ord");
  const paymentId = generateId("pay");
  const itemId = generateId("itm");
  const ref = referenceCode();

  const meta = {
    ...(input.meta || {}),
    reference: ref,
    guest: { name, phone, email },
    bookedByUserId: userId,
  };

  const orderStatus =
    checkout.payment.method === "cash" && input.amountCents > 0 ? "pending" : "paid";

  await query(
    `INSERT INTO orders (id, user_id, module_id, status, total_cents, currency, payment_method, personal_json, address_json, tracking_code, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'USD', ?, ?, NULL, ?, ?, ?)`,
    [
      orderId,
      userId,
      input.moduleId,
      orderStatus,
      input.amountCents,
      checkout.payment.method,
      JSON.stringify(checkout.personal),
      ref,
      now,
      now,
    ]
  );

  await query(
    `INSERT INTO order_items (id, order_id, product_id, name, qty, unit_price_cents, meta_json)
     VALUES (?, ?, NULL, ?, 1, ?, ?)`,
    [itemId, orderId, input.title, input.amountCents, JSON.stringify(meta)]
  );

  const paymentStatus =
    checkout.payment.method === "cash" && input.amountCents > 0 ? "pending" : "succeeded";

  await query(
    `INSERT INTO payments (id, order_id, method, amount_cents, status, card_last4, provider_ref, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      paymentId,
      orderId,
      checkout.payment.method,
      input.amountCents,
      paymentStatus,
      checkout.payment.cardLast4 || null,
      ref,
      now,
    ]
  );

  if (checkout.payment.method === "apexpay" && input.amountCents > 0) {
    await query("UPDATE wallets SET balance_cents = balance_cents - ?, updated_at = ? WHERE user_id = ?", [
      input.amountCents,
      now,
      userId,
    ]);
    await query(
      `INSERT INTO wallet_transactions (id, user_id, type, amount_cents, label, counterparty, meta_json, created_at)
       VALUES (?, ?, 'debit', ?, ?, ?, ?, ?)`,
      [
        generateId("wtx"),
        userId,
        input.amountCents,
        input.title,
        input.moduleId,
        JSON.stringify({ orderId, bookingId, reference: ref }),
        now,
      ]
    );
  }

  const bookingStatus = orderStatus === "pending" ? "pending" : "confirmed";

  await query(
    `INSERT INTO bookings (id, order_id, user_id, module_id, resource_type, resource_id, title, reference, guest_name, guest_phone, guest_email, status, starts_at, ends_at, amount_cents, meta_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      bookingId,
      orderId,
      userId,
      input.moduleId,
      input.resourceType,
      input.resourceId,
      input.title,
      ref,
      name,
      phone,
      email,
      bookingStatus,
      input.startsAt || null,
      input.endsAt || null,
      input.amountCents,
      JSON.stringify(meta),
      now,
    ]
  );

  return {
    ok: true as const,
    booking: {
      bookingId,
      orderId,
      paymentId,
      reference: ref,
      status: "confirmed" as const,
      amountCents: input.amountCents,
      guestName: name,
      guestPhone: phone,
      guestEmail: email,
      paymentMethod: checkout.payment.method,
    },
  };
}
