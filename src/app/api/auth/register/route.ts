import { NextResponse } from "next/server";
import { registerWithEmail, SESSION_COOKIE } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await registerWithEmail({
      name: String(body.name || ""),
      email: String(body.email || ""),
      username: String(body.username || ""),
      password: String(body.password || ""),
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
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
    console.error("Register error:", err);
    return NextResponse.json({ ok: false, error: "Registration failed." }, { status: 500 });
  }
}
