import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const row = await queryOne<{ ok: number }>("SELECT 1 AS ok");
    return NextResponse.json({
      ok: true,
      db: row?.ok === 1,
      env: process.env.VERCEL ? "vercel" : "local",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database unavailable";
    return NextResponse.json({ ok: false, db: false, error: message }, { status: 503 });
  }
}
