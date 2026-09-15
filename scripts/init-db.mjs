import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const mysql = require("mysql2/promise");

// Load .env.local manually for the init script
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const envPath = path.join(root, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i < 1) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const host = process.env.DB_HOST || "127.0.0.1";
const port = Number(process.env.DB_PORT || 3306);
const user = process.env.DB_USER || "root";
const password = process.env.DB_PASSWORD || "";
const database = process.env.DB_NAME || "apex";
const sqlPath = path.join(root, "sql", "apex.sql");

async function main() {
  console.log(`Connecting to MySQL ${user}@${host}:${port} ...`);

  const sslEnabled = process.env.DB_SSL === "true";
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
    ssl: sslEnabled
      ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" }
      : undefined,
  });

  let sql = fs.readFileSync(sqlPath, "utf8");
  if (sql.charCodeAt(0) === 0xfeff) sql = sql.slice(1);
  await conn.query(sql);

  const [tables] = await conn.query(
    `SELECT TABLE_NAME AS name FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME`,
    [database]
  );

  console.log(`Database ready: ${database}`);
  console.log(`SQL source: ${sqlPath}`);
  console.log(`Tables (${tables.length}): ${tables.map((t) => t.name).join(", ")}`);
  console.log("No demo users. Register via Gateway for real authentication.");

  await conn.end();
}

main().catch((err) => {
  console.error("DB init failed:", err.message);
  process.exit(1);
});
