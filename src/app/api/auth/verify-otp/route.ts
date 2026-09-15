import { NextResponse } from "next/server";
import { createPhoneSession, SESSION_COOKIE, verifyOtp } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = String(body.phone || "").trim();
    const code = String(body.code || "").trim();
    const name = body.name ? String(body.name).trim() : undefined;

    if (!phone || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { ok: false, error: "Phone and 6-digit OTP are required." },
        { status: 400 }
      );
    }

    const result = await verifyOtp(phone, code);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 401 });
    }

    const session = await createPhoneSession(phone, name);
    const response = NextResponse.json({
      ok: true,
      user: session.user,
      token: session.token,
    });

    response.cookies.set(SESSION_COOKIE, session.token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ ok: false, error: "Verification failed." }, { status: 500 });
  }
}
