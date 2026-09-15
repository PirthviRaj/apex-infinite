import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession, SESSION_COOKIE } from "@/lib/auth-server";
import { createModuleBooking, type ModuleBookingInput } from "@/lib/booking-server";

export async function POST(request: Request) {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    const session = await getSession(token);
    if (!session) {
      return NextResponse.json({ ok: false, error: "Please log in to complete booking." }, { status: 401 });
    }

    const body = (await request.json()) as ModuleBookingInput;

    if (!body.moduleId || !body.resourceType || !body.resourceId || !body.title || !body.checkout) {
      return NextResponse.json({ ok: false, error: "Incomplete booking payload." }, { status: 400 });
    }

    const result = await createModuleBooking(session.user.id, {
      moduleId: String(body.moduleId),
      resourceType: String(body.resourceType),
      resourceId: String(body.resourceId),
      title: String(body.title),
      amountCents: Math.round(Number(body.amountCents) || 0),
      startsAt: body.startsAt ? String(body.startsAt) : null,
      endsAt: body.endsAt ? String(body.endsAt) : null,
      meta: body.meta && typeof body.meta === "object" ? body.meta : {},
      checkout: body.checkout,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, booking: result.booking });
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json({ ok: false, error: "Booking failed. Try again." }, { status: 500 });
  }
}
