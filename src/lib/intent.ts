import { MODULES, type ApexModule, type ModuleId } from "@/lib/modules";

export type IntentAction =
  | "navigate"
  | "book"
  | "order"
  | "pay"
  | "search"
  | "open";

export type DetectedIntent = {
  module: ApexModule;
  action: IntentAction;
  confidence: number;
  label: string;
  entities: Record<string, string>;
  query: string;
};

type IntentRule = {
  moduleId: ModuleId;
  keywords: string[];
  weight?: number;
  actionHints?: Partial<Record<IntentAction, string[]>>;
};

const RULES: IntentRule[] = [
  {
    moduleId: "travel",
    keywords: [
      "travel",
      "flight",
      "flights",
      "hotel",
      "hotels",
      "trip",
      "vacation",
      "airport",
      "booking",
      "tokyo",
      "dubai",
      "paris",
      "bali",
      "destination",
    ],
    weight: 1.2,
    actionHints: {
      book: ["book", "reserve", "fly"],
      search: ["find", "search", "cheap"],
    },
  },
  {
    moduleId: "food",
    keywords: [
      "food",
      "grocery",
      "groceries",
      "pizza",
      "burger",
      "sushi",
      "delivery",
      "hungry",
      "order food",
      "meal",
      "restaurant delivery",
    ],
    actionHints: {
      order: ["order", "deliver", "get me"],
    },
  },
  {
    moduleId: "workspace",
    keywords: [
      "workspace",
      "desk",
      "office",
      "cowork",
      "co-working",
      "meeting room",
      "floor plan",
      "hot desk",
    ],
    actionHints: {
      book: ["book", "reserve", "claim"],
    },
  },
  {
    moduleId: "restaurant",
    keywords: [
      "restaurant",
      "table",
      "dinner",
      "lunch reservation",
      "dine",
      "reservation",
      "availability",
    ],
    actionHints: {
      book: ["book", "reserve", "table for"],
    },
  },
  {
    moduleId: "glide",
    keywords: [
      "ride",
      "uber",
      "taxi",
      "cab",
      "car rental",
      "rent a car",
      "glide",
      "pickup",
      "dropoff",
      "drive",
    ],
    actionHints: {
      book: ["book", "call", "get a ride"],
    },
  },
  {
    moduleId: "events",
    keywords: [
      "event",
      "events",
      "movie",
      "concert",
      "tickets",
      "ticket",
      "seats",
      "show",
      "pulse",
      "stadium",
    ],
    actionHints: {
      book: ["book", "buy", "get tickets"],
    },
  },
  {
    moduleId: "wellness",
    keywords: [
      "wellness",
      "doctor",
      "spa",
      "massage",
      "therapy",
      "zenflow",
      "clinic",
      "appointment",
      "health",
    ],
    actionHints: {
      book: ["book", "schedule", "appoint"],
    },
  },
  {
    moduleId: "pay",
    keywords: [
      "pay",
      "payment",
      "wallet",
      "bill",
      "bills",
      "transfer",
      "p2p",
      "apexpay",
      "send money",
      "finance",
    ],
    weight: 1.15,
    actionHints: {
      pay: ["pay", "send", "transfer", "split"],
    },
  },
  {
    moduleId: "vogue",
    keywords: [
      "shop",
      "shopping",
      "fashion",
      "style",
      "stylist",
      "vogue",
      "outfit",
      "clothes",
      "sneakers",
      "wardrobe",
    ],
    actionHints: {
      search: ["find", "recommend", "style me"],
    },
  },
  {
    moduleId: "taskmaster",
    keywords: [
      "plumber",
      "cleaner",
      "cleaning",
      "repair",
      "home service",
      "taskmaster",
      "electrician",
      "handyman",
      "fix ac",
    ],
    actionHints: {
      book: ["book", "hire", "send"],
    },
  },
  {
    moduleId: "rizz",
    keywords: [
      "rizz",
      "seo",
      "caption",
      "content",
      "copywriting",
      "pickup line",
      "dm reply",
      "blog",
      "write for me",
    ],
    actionHints: {
      open: ["write", "generate", "help me"],
    },
  },
];

const ACTION_PRIORITY: IntentAction[] = ["book", "order", "pay", "search", "open", "navigate"];

const SUGGESTIONS = [
  "Book a flight to Tokyo",
  "Order sushi delivery",
  "Reserve a coworking desk",
  "Find dinner table for 4",
  "Get a ride to downtown",
  "Buy concert tickets",
  "Book a spa appointment",
  "Pay electricity bill",
  "Style me for a date night",
  "Hire a plumber today",
  "Write an SEO blog intro",
];

function extractEntities(query: string, moduleId: ModuleId): Record<string, string> {
  const entities: Record<string, string> = {};
  const q = query.toLowerCase();

  const cityMatch = q.match(
    /\b(?:to|in|for|from)\s+([a-z][a-z\s]{1,20}?)(?:\s|$|,|\.|!|\?)/i
  );
  if (cityMatch?.[1]) {
    const place = cityMatch[1].trim();
    if (!["a", "an", "the", "me", "my", "today", "tomorrow"].includes(place)) {
      entities.place = place.replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  const guests = q.match(/\b(?:for|table for|party of)\s+(\d+)\b/);
  if (guests?.[1]) entities.guests = guests[1];

  const amount = q.match(/\$\s?(\d+(?:\.\d{1,2})?)|\b(\d+)\s?(?:usd|dollars?)\b/i);
  if (amount) entities.amount = amount[1] || amount[2];

  if (moduleId === "travel" && /hotel/.test(q)) entities.focus = "hotels";
  if (moduleId === "travel" && /flight/.test(q)) entities.focus = "flights";
  if (/\btoday\b/.test(q)) entities.when = "today";
  if (/\btomorrow\b/.test(q)) entities.when = "tomorrow";

  return entities;
}

function resolveAction(query: string, rule: IntentRule): IntentAction {
  const q = query.toLowerCase();
  for (const action of ACTION_PRIORITY) {
    const hints = rule.actionHints?.[action];
    if (hints?.some((h) => q.includes(h))) return action;
  }
  if (/\b(book|reserve|schedule)\b/.test(q)) return "book";
  if (/\b(order|deliver)\b/.test(q)) return "order";
  if (/\b(pay|transfer|send money)\b/.test(q)) return "pay";
  if (/\b(find|search|look)\b/.test(q)) return "search";
  return "navigate";
}

function actionLabel(action: IntentAction, module: ApexModule, entities: Record<string, string>) {
  const place = entities.place ? ` · ${entities.place}` : "";
  switch (action) {
    case "book":
      return `Book via ${module.name}${place}`;
    case "order":
      return `Order in ${module.name}${place}`;
    case "pay":
      return `Pay with ${module.name}${entities.amount ? ` · $${entities.amount}` : ""}`;
    case "search":
      return `Search ${module.name}${place}`;
    case "open":
      return `Open ${module.name}`;
    default:
      return `Go to ${module.name}`;
  }
}

export function detectIntent(raw: string): DetectedIntent | null {
  const query = raw.trim();
  if (!query) return null;
  const q = query.toLowerCase();

  let best: { mod: ApexModule; score: number; rule: IntentRule } | null = null;

  for (const rule of RULES) {
    const mod = MODULES.find((m) => m.id === rule.moduleId);
    if (!mod) continue;

    let score = 0;
    for (const keyword of rule.keywords) {
      if (q.includes(keyword)) {
        score += keyword.includes(" ") ? 2.4 : 1.4;
        score += Math.min(keyword.length / 10, 1);
      }
    }

    if (q.includes(mod.id)) score += 3;
    if (q.includes(mod.name.toLowerCase())) score += 3.5;

    score *= rule.weight ?? 1;

    if (score > 0 && (!best || score > best.score)) {
      best = { mod, score, rule };
    }
  }

  if (!best) return null;

  const action = resolveAction(query, best.rule);
  const entities = extractEntities(query, best.mod.id);
  const confidence = Math.min(0.98, 0.42 + best.score / 10);

  return {
    module: best.mod,
    action,
    confidence,
    label: actionLabel(action, best.mod, entities),
    entities,
    query,
  };
}

export function rankIntents(raw: string, limit = 4): DetectedIntent[] {
  const query = raw.trim();
  if (!query) return [];
  const q = query.toLowerCase();

  const scored = RULES.map((rule) => {
    const mod = MODULES.find((m) => m.id === rule.moduleId)!;
    let score = 0;
    for (const keyword of rule.keywords) {
      if (q.includes(keyword) || keyword.includes(q) || q.split(/\s+/).some((w) => keyword.startsWith(w) && w.length > 2)) {
        score += 1.2;
      }
    }
    if (mod.name.toLowerCase().includes(q) || q.includes(mod.id)) score += 2.5;
    score *= rule.weight ?? 1;
    const action = resolveAction(query, rule);
    const entities = extractEntities(query, mod.id);
    return {
      module: mod,
      action,
      confidence: Math.min(0.97, 0.35 + score / 8),
      label: actionLabel(action, mod, entities),
      entities,
      query,
      score,
    };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ score, ...intent }) => {
    void score;
    return intent;
  });
}

export function getOmnibarSuggestions(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return SUGGESTIONS.slice(0, 6);
  return SUGGESTIONS.filter((s) => s.toLowerCase().includes(q) || q.split(/\s+/).some((w) => w.length > 2 && s.toLowerCase().includes(w))).slice(0, 6);
}

export { SUGGESTIONS };
