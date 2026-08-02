import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const sharp = require("sharp");

const root = path.dirname(fileURLToPath(import.meta.url));
const exportDir = path.join(root, "exports");
await mkdir(exportDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
});
const indexPage = await browser.newPage({
  viewport: { width: 2400, height: 1600 },
  deviceScaleFactor: 1
});

const artboardUrl = pathToFileURL(path.join(root, "artboards.html")).href;
await indexPage.goto(artboardUrl);
await indexPage.evaluate(() => document.fonts.ready);

const names = await indexPage.locator("[data-export]").evaluateAll((nodes) =>
  nodes.map((node) => node.getAttribute("data-export")).filter(Boolean)
);
await indexPage.close();

for (const name of names) {
  const targetHeight = name.endsWith("1080x1080") ? 1080 : 1350;
  const artPage = await browser.newPage({
    viewport: { width: 1080, height: targetHeight },
    deviceScaleFactor: 1
  });
  await artPage.goto(artboardUrl);
  await artPage.evaluate(() => document.fonts.ready);
  await artPage.evaluate((exportName) => {
    const target = document.querySelector(`[data-export="${exportName}"]`);
    if (!target) throw new Error(`Missing artboard ${exportName}`);
    target.remove();
    document.body.className = "";
    document.body.replaceChildren(target);
  }, name);
  const buffer = await artPage.screenshot({
    animations: "disabled"
  });
  await sharp(buffer)
    .extract({ left: 0, top: 0, width: 1080, height: targetHeight })
    .png()
    .toFile(path.join(exportDir, `${name}.png`));
  await artPage.close();
}

const contactPage = await browser.newPage({
  viewport: { width: 1800, height: 880 },
  deviceScaleFactor: 1
});
await contactPage.goto(pathToFileURL(path.join(root, "contact-sheet.html")).href);
await contactPage.evaluate(() => document.fonts.ready);
await contactPage.screenshot({
  path: path.join(exportDir, "contact-sheet-1800x880.png"),
  fullPage: true,
  animations: "disabled"
});
await contactPage.close();

await browser.close();
console.log(`Rendered ${names.length} artboards and contact sheet to ${exportDir}`);
