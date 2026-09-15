const path = require("path");
const puppeteer = require("puppeteer");

async function main() {
  const htmlPath = path.resolve(__dirname, "Apex-Infinite-Portfolio-Presentation.html");
  const outPath = path.resolve(__dirname, "Apex-Infinite-Portfolio-Presentation.pdf");
  const fileUrl = "file:///" + htmlPath.replace(/\\/g, "/");

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(fileUrl, { waitUntil: "networkidle0", timeout: 120000 });

  // Wait for device clones / fonts
  await new Promise((r) => setTimeout(r, 1500));

  // Print-friendly: each slide = one landscape page
  await page.addStyleTag({
    content: `
      @page { size: 297mm 210mm; margin: 0; }
      html, body {
        background: #05050a !important;
        overflow: visible !important;
        height: auto !important;
        scroll-snap-type: none !important;
      }
      .progress, .hint { display: none !important; }
      .slide {
        width: 297mm !important;
        height: 210mm !important;
        min-height: 210mm !important;
        max-height: 210mm !important;
        page-break-after: always !important;
        break-after: page !important;
        overflow: hidden !important;
        padding: 10mm 12mm 10mm !important;
        justify-content: flex-start !important;
        box-sizing: border-box !important;
      }
      .slide:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }
      .slide.with-devices {
        overflow: hidden !important;
      }
      #s1.slide {
        display: flex !important;
        flex-direction: column !important;
        justify-content: stretch !important;
        padding: 8mm 10mm 8mm !important;
      }
      #s1 .nav { margin-bottom: 4mm !important; }
      #s1 .wrap.hero-layout {
        flex: 1 !important;
        height: 100% !important;
        min-height: 0 !important;
        max-width: 100% !important;
        margin-top: 0 !important;
        grid-template-columns: 0.82fr 1.28fr !important;
        gap: 10px !important;
        align-items: center !important;
      }
      #s1 .devices {
        height: 100% !important;
        align-items: center !important;
      }
      #s1 .laptop {
        max-width: none !important;
        width: 100% !important;
      }
      #s1 .phone {
        width: 210px !important;
      }
      #s1 .phone-wrap {
        margin-left: -36px !important;
      }
      #s1 .hero-copy h1 { font-size: 30px !important; }
      #s1 .hero-copy .lead,
      #s1 .hero-copy .body-copy { font-size: 12px !important; }
      .wrap { max-width: 100% !important; }
      .hero-layout {
        grid-template-columns: 0.9fr 1.1fr !important;
        gap: 16px !important;
      }
      .devices.solo { margin-top: 8px !important; transform: scale(0.95); transform-origin: top center; }
      .devices.solo-phone .phone { width: 200px !important; }
      .body-copy, .lead { font-size: 12px !important; }
      h1 { font-size: 28px !important; }
      h2 { font-size: 24px !important; }
    `,
  });

  await page.pdf({
    path: outPath,
    printBackground: true,
    preferCSSPageSize: true,
    landscape: true,
    format: "A4",
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });

  await browser.close();
  console.log("PDF created:", outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
