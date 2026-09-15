import { NextResponse } from "next/server";
import { loginWithEmail, SESSION_COOKIE } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await loginWithEmail({
      identifier: String(body.identifier || ""),
      password: String(body.password || ""),
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 401 });
    }

    const response = NextResponse.json({
      ok: true,
      user: result.user,
      token: result.token,
    });
    response.cookies.set(SESSION_COOKIE, result.token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ ok: false, error: "Login failed." }, { status: 500 });
  }
}
