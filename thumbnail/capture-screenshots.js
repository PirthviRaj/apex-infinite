const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

const OUT = path.resolve(__dirname, "screenshots");
const MOCKUPS = path.resolve(__dirname, "mockups");
const PORTFOLIO = path.resolve(__dirname, "..", "portfolio");
const BASE = process.env.THUMB_BASE || "http://localhost:3000";

const THUMB_CREDS = {
  email: process.env.THUMB_EMAIL || "thumb-capture@apex.app",
  password: process.env.THUMB_PASSWORD || "ThumbCapture!2026",
  name: "Voyager",
  username: "voyager",
};

function copyAssets() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(MOCKUPS, { recursive: true });
  for (const file of ["iphone-16-pro-max.png"]) {
    const src = path.join(PORTFOLIO, "mockups", file);
    const dest = path.join(MOCKUPS, file);
    if (fs.existsSync(src)) fs.copyFileSync(src, dest);
  }
}

async function fetchSession() {
  async function post(url, body) {
    const res = await fetch(BASE + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  let data = await post("/api/auth/login", {
    identifier: THUMB_CREDS.email,
    password: THUMB_CREDS.password,
  });

  if (!data.ok) {
    await post("/api/auth/register", {
      email: THUMB_CREDS.email,
      password: THUMB_CREDS.password,
      name: THUMB_CREDS.name,
      username: THUMB_CREDS.username,
    });
    data = await post("/api/auth/login", {
      identifier: THUMB_CREDS.email,
      password: THUMB_CREDS.password,
    });
  }

  if (!data.ok || !data.user || !data.token) {
    throw new Error(`Thumbnail auth failed: ${data.error || "unknown"}`);
  }

  return { user: data.user, token: data.token };
}

async function ensureLoggedIn(page, session) {
  page.on("pageerror", (err) => console.error("pageerror:", err.message));

  await page.setCookie({
    name: "apex_session",
    value: session.token,
    url: BASE,
    httpOnly: true,
    sameSite: "Lax",
  });

  await page.evaluateOnNewDocument((payload) => {
    localStorage.setItem(
      "apex-auth-v2",
      JSON.stringify({
        state: { user: payload.user, token: payload.token },
        version: 0,
      })
    );
    localStorage.removeItem("apex-auth");
  }, session);

  await page.goto(BASE + "/app", { waitUntil: "networkidle0", timeout: 90000 });
  await page
    .waitForFunction(
      () => document.body && document.body.innerText.includes("Welcome back"),
      { timeout: 90000 }
    )
    .catch(() => {});

  const ready = await page.evaluate(() =>
    document.body.innerText.includes("Welcome back")
  );
  if (!ready) {
    const hint = await page.evaluate(() => ({
      url: location.href,
      snippet: document.body.innerText.slice(0, 180),
      hasAuth: Boolean(localStorage.getItem("apex-auth-v2")),
      scripts: document.querySelectorAll("script").length,
      next: Boolean(window.__NEXT_DATA__),
    }));
    throw new Error(
      `App did not reach Command Center (${hint.url}, auth=${hint.hasAuth}, scripts=${hint.scripts}, next=${hint.next}): ${hint.snippet}`
    );
  }
}

async function captureRoute(page, url, waitText) {
  await page.goto(BASE + url, { waitUntil: "networkidle0", timeout: 90000 });
  if (waitText) {
    await page
      .waitForFunction(
        (t) => document.body && document.body.innerText.includes(t),
        { timeout: 45000 },
        waitText
      )
      .catch(() => {});
  }
  await new Promise((r) => setTimeout(r, 3500));
  await page
    .addStyleTag({
      content: `fixed.bottom-6, [class*="oracle" i] { opacity: 0 !important; pointer-events: none !important; }`,
    })
    .catch(() => {});
}

async function main() {
  copyAssets();

  const browser = await puppeteer.launch({
    headless: true,
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const scale = Number(process.env.THUMB_SCALE) || 3;
  const session = await fetchSession();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  await ensureLoggedIn(page, session);

  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: scale });
  await captureRoute(page, "/app", "Welcome back");
  await page.screenshot({ path: path.join(OUT, "desktop-command-center.png"), type: "png" });
  console.log(`desktop-command-center (${1440 * scale}×${900 * scale})`);

  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: scale });
  await captureRoute(page, "/modules/pay", "Available balance");
  await page.screenshot({ path: path.join(OUT, "mobile-pay.png"), type: "png" });
  console.log(`mobile-pay (${430 * scale}×${932 * scale})`);

  await browser.close();
  console.log("screenshots ready");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
