const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

const OUT = path.resolve(__dirname, "screenshots");
const BASE = "http://localhost:3000";

const DEMO_USER = {
  id: "demo-user",
  email: "apex@demo.app",
  username: "apexuser",
  displayName: "Apex User",
  provider: "email",
};

async function authGoto(page, url, waitText) {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate((user) => {
    localStorage.setItem(
      "apex-auth-v2",
      JSON.stringify({
        state: { user, token: "demo-portfolio-token" },
        version: 0,
      })
    );
  }, DEMO_USER);
  await page.goto(BASE + url, { waitUntil: "networkidle0", timeout: 90000 });
  if (waitText) {
    await page.waitForFunction(
      (t) => document.body && document.body.innerText.includes(t),
      { timeout: 30000 },
      waitText
    );
  }
  await new Promise((r) => setTimeout(r, 2500));
  await page
    .addStyleTag({
      content: `
        [class*="oracle" i], [data-oracle], fixed.bottom-6 { opacity: 0 !important; pointer-events: none !important; }
      `,
    })
    .catch(() => {});
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const desk = await browser.newPage();
  await desk.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.25 });
  await authGoto(desk, "/app", "Welcome back");
  await desk.screenshot({
    path: path.join(OUT, "desktop-command-center.png"),
    type: "png",
  });
  console.log("desktop-command-center");

  await authGoto(desk, "/modules/food", "Food");
  await desk.screenshot({
    path: path.join(OUT, "desktop-food.png"),
    type: "png",
  });
  console.log("desktop-food");

  const phone = await browser.newPage();
  await phone.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });
  await authGoto(phone, "/app", "Welcome back");
  await phone.screenshot({
    path: path.join(OUT, "mobile-command-center.png"),
    type: "png",
  });
  console.log("mobile-command-center");

  await authGoto(phone, "/modules/glide", "Glide");
  await phone.screenshot({
    path: path.join(OUT, "mobile-glide.png"),
    type: "png",
  });
  console.log("mobile-glide");

  await authGoto(phone, "/modules/pay", "Pay");
  await phone.screenshot({
    path: path.join(OUT, "mobile-pay.png"),
    type: "png",
  });
  console.log("mobile-pay");

  await browser.close();
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
