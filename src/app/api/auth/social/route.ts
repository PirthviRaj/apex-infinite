import { NextResponse } from "next/server";
import { completeSocialChallenge, SESSION_COOKIE } from "@/lib/auth-server";

/**
 * Social login — real OAuth providers only.
 * Fake email+OTP demo flow is disabled.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = String(body.action || "start");

    if (action === "start") {
      const provider = body.provider as "google" | "apple" | "github";
      if (!["google", "apple", "github"].includes(provider)) {
        return NextResponse.json({ ok: false, error: "Invalid provider." }, { status: 400 });
      }

      const configured =
        (provider === "google" && process.env.GOOGLE_CLIENT_ID) ||
        (provider === "github" && process.env.GITHUB_CLIENT_ID) ||
        (provider === "apple" && process.env.APPLE_CLIENT_ID);

      if (!configured) {
        return NextResponse.json(
          {
            ok: false,
            error: `${provider} OAuth is not configured. Use Email signup/login for real authentication.`,
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error: "OAuth redirect flow is not wired yet. Use Email signup/login for now.",
        },
        { status: 501 }
      );
    }

    if (action === "verify") {
      const challengeId = String(body.challengeId || "").trim();
      const code = String(body.code || "").trim();
      const name = body.name ? String(body.name).trim() : undefined;

      if (!challengeId || !/^\d{6}$/.test(code)) {
        return NextResponse.json(
          { ok: false, error: "Challenge ID and 6-digit code required." },
          { status: 400 }
        );
      }

      const result = await completeSocialChallenge(challengeId, code, name);
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
    }

    return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "Social login failed." }, { status: 500 });
  }
}
