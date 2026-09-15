import mysql, { type ExecuteValues } from "mysql2/promise";

export type DbUserRow = {
  id: string;
  email: string | null;
  username: string | null;
  phone: string | null;
  name: string;
  avatar: string | null;
  provider: string;
  phone_verified_at?: string | null;
  created_at: string;
  updated_at?: string;
};

const globalForDb = globalThis as typeof globalThis & {
  __apexMysqlPool?: mysql.Pool;
};

function dbConfig(): mysql.PoolOptions {
  const host = process.env.DB_HOST || "127.0.0.1";
  const sslEnabled =
    process.env.DB_SSL === "true" || host.includes("tidbcloud.com");

  return {
    host,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "apex",
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || (process.env.VERCEL ? 2 : 10)),
    namedPlaceholders: false,
    enableKeepAlive: true,
    ssl: sslEnabled ? { rejectUnauthorized: true } : undefined,
  };
}

export function getPool() {
  if (!globalForDb.__apexMysqlPool) {
    globalForDb.__apexMysqlPool = mysql.createPool(dbConfig());
  }
  return globalForDb.__apexMysqlPool;
}

export async function query<T = unknown>(sql: string, params: unknown[] = []) {
  const [rows] = await getPool().execute(sql, params as ExecuteValues);
  return rows as T;
}

export async function queryOne<T = unknown>(sql: string, params: unknown[] = []) {
  const rows = await query<T[]>(sql, params);
  return (rows?.[0] as T) || null;
}

export function dbNowIso() {
  return new Date().toISOString();
}
