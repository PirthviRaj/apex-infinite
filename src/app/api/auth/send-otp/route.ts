import { NextResponse } from "next/server";
import { isValidPhoneNumber } from "libphonenumber-js";
import { createOtp } from "@/lib/auth-server";

function twilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
  );
}

function allowDevOtp() {
  return process.env.APEX_ALLOW_DEV_OTP === "true" || process.env.NODE_ENV !== "production";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = String(body.phone || "").trim();

    if (!phone || !isValidPhoneNumber(phone)) {
      return NextResponse.json(
        { ok: false, error: "Enter a valid international phone number." },
        { status: 400 }
      );
    }

    const code = await createOtp(phone, { channel: "sms", purpose: "phone_auth" });

    if (twilioConfigured()) {
      const sid = process.env.TWILIO_ACCOUNT_SID!;
      const token = process.env.TWILIO_AUTH_TOKEN!;
      const from = process.env.TWILIO_PHONE_NUMBER!;

      const twilioRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: phone,
            From: from,
            Body: `Your Apex Infinite verification code is ${code}. Valid for 5 minutes.`,
          }),
        }
      );

      if (!twilioRes.ok) {
        const errText = await twilioRes.text();
        console.error("Twilio SMS failed:", errText);
        return NextResponse.json(
          { ok: false, error: "Failed to send SMS. Check Twilio configuration." },
          { status: 502 }
        );
      }

      return NextResponse.json({
        ok: true,
        message: "OTP sent via SMS.",
        delivery: "sms",
        expiresIn: 300,
      });
    }

    if (!allowDevOtp()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Phone OTP requires Twilio. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.",
        },
        { status: 503 }
      );
    }

    // Local / no-Twilio: OTP is stored in MySQL (otp_challenges) and returned once.
    console.info(`[Apex OTP] ${phone} → ${code} (saved in MySQL)`);

    return NextResponse.json({
      ok: true,
      message: "OTP saved in MySQL. Enter the code below (local delivery).",
      delivery: "dev",
      devOtp: code,
      expiresIn: 300,
    });
  } catch (err) {
    console.error("Send OTP error:", err);
    return NextResponse.json({ ok: false, error: "Failed to send OTP." }, { status: 500 });
  }
}
