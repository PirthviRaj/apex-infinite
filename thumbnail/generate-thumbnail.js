const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

const DIR = __dirname;

/** CSS viewport scale → physical pixels (2 = 4K, 3 = ~6K, crisp when zoomed) */
const SCALE = Number(process.env.THUMB_SCALE) || 3;

const EXPORTS = [
  { html: "Apex-Infinite-Thumbnail.html", out: "apex-infinite-thumbnail.png", w: 1920, h: 1080 },
  { html: "Apex-Infinite-Thumbnail.html", out: "apex-infinite-thumbnail-4k.png", w: 1920, h: 1080, scale: 2 },
  { html: "Apex-Infinite-Thumbnail.html", out: "apex-infinite-thumbnail-1280.png", w: 1280, h: 720 },
  { html: "Apex-Infinite-Thumbnail-Upwork.html", out: "apex-infinite-thumbnail-upwork.png", w: 2000, h: 1500, scale: 2 },
  { html: "Apex-Infinite-Thumbnail-iMac.html", out: "apex-infinite-thumbnail-imac.png", w: 1920, h: 1080 },
  { html: "Apex-Infinite-Thumbnail-iMac.html", out: "apex-infinite-thumbnail-imac-1280.png", w: 1280, h: 720 },
  { html: "Apex-Infinite-Thumbnail-iPhone.html", out: "apex-infinite-thumbnail-iphone.png", w: 1920, h: 1080 },
  { html: "Apex-Infinite-Thumbnail-iPhone.html", out: "apex-infinite-thumbnail-iphone-1280.png", w: 1280, h: 720 },
];

async function render(browser, file, output, width, height, scale = SCALE) {
  const html = path.join(DIR, file);
  if (!fs.existsSync(html)) {
    console.warn("skip missing", file);
    return;
  }

  const page = await browser.newPage();
  await page.setViewport({
    width,
    height,
    deviceScaleFactor: scale,
  });
  await page.goto("file://" + html.replace(/\\/g, "/"), {
    waitUntil: "networkidle0",
    timeout: 90000,
  });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1500));

  const outPath = path.join(DIR, output);
  const tmpPath = outPath + ".tmp.png";
  await page.screenshot({
    path: tmpPath,
    type: "png",
    captureBeyondViewport: false,
  });
  await page.close();

  try {
    fs.renameSync(tmpPath, outPath);
  } catch {
    fs.copyFileSync(tmpPath, outPath);
    fs.unlinkSync(tmpPath);
  }

  const pxW = width * scale;
  const pxH = height * scale;
  const mb = (fs.statSync(outPath).size / 1024 / 1024).toFixed(2);
  console.log(`wrote ${output} (${pxW}×${pxH}px @${scale}x, ${mb} MB)`);
}

async function main() {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  console.log(`Export scale: ${SCALE}x (override with THUMB_SCALE=2|3|4)`);

  for (const job of EXPORTS) {
    await render(browser, job.html, job.out, job.w, job.h, job.scale ?? SCALE);
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
