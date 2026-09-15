import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { detectIntent, rankIntents } from "@/lib/intent";
import { getSession, logIntent, SESSION_COOKIE } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = String(body.query || "").trim();
    if (!query) {
      return NextResponse.json({ ok: false, error: "Query required." }, { status: 400 });
    }

    const primary = detectIntent(query);
    const ranked = rankIntents(query, 5);

    const token = cookies().get(SESSION_COOKIE)?.value;
    const session = await getSession(token);

    await logIntent({
      userId: session?.user.id,
      query,
      moduleId: primary?.module.id,
      action: primary?.action,
      confidence: primary?.confidence,
      entities: primary?.entities,
    });

    return NextResponse.json({
      ok: true,
      intent: primary
        ? {
            moduleId: primary.module.id,
            moduleName: primary.module.name,
            href: primary.module.href,
            action: primary.action,
            confidence: primary.confidence,
            label: primary.label,
            entities: primary.entities,
          }
        : null,
      ranked: ranked.map((item) => ({
        moduleId: item.module.id,
        moduleName: item.module.name,
        href: item.module.href,
        action: item.action,
        confidence: item.confidence,
        label: item.label,
        entities: item.entities,
      })),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Intent detection failed." }, { status: 500 });
  }
}
