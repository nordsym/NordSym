import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = path.dirname(fileURLToPath(import.meta.url));
const frameDir = path.join(root, "animatic-frames");
await mkdir(frameDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
});
const page = await browser.newPage({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1
});

await page.goto(pathToFileURL(path.join(root, "animatic.html")).href);
await page.evaluate(() => document.fonts.ready);

const frames = await page.locator("[data-frame]").evaluateAll((nodes) =>
  nodes.map((node) => node.getAttribute("data-frame")).filter(Boolean)
);

for (const frame of frames) {
  await page.evaluate((frameId) => {
    document.querySelectorAll("[data-frame]").forEach((node) => {
      node.classList.toggle("is-active", node.getAttribute("data-frame") === frameId);
    });
  }, frame);
  await page.screenshot({
    path: path.join(frameDir, `${frame}.png`),
    animations: "disabled"
  });
}

await browser.close();
console.log(`Rendered ${frames.length} animatic frames to ${frameDir}`);
