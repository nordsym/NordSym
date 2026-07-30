import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const root = path.dirname(fileURLToPath(import.meta.url));
const evidence = path.join(root, "evidence");

const panels = [
  ["01-meta-feed-mobile.png", "01 · META FEED"],
  ["03-video-playing-mobile.png", "02 · VIDEOBRYGGA"],
  ["04-qualification-mobile.png", "03 · KVALIFICERING"],
  ["07-booking-details-mobile.png", "04 · BOKNING"]
];

const panelWidth = 420;
const panelHeight = 1080;
const imageWidth = 360;
const imageHeight = 940;
const background = "#f3eee4";

const composites = [];
for (let index = 0; index < panels.length; index += 1) {
  const [file, label] = panels[index];
  const image = await sharp(path.join(evidence, file))
    .resize(imageWidth, imageHeight, {
      fit: "contain",
      background
    })
    .png()
    .toBuffer();
  const title = await sharp({
    text: {
      text: label,
      font: "IBM Plex Mono",
      width: imageWidth,
      height: 56,
      rgba: true
    }
  }).png().toBuffer();

  composites.push({
    input: title,
    left: index * panelWidth + 30,
    top: 28
  });
  composites.push({
    input: image,
    left: index * panelWidth + 30,
    top: 92
  });
}

await sharp({
  create: {
    width: panelWidth * panels.length,
    height: panelHeight,
    channels: 4,
    background
  }
})
  .composite(composites)
  .png()
  .toFile(path.join(evidence, "contact-sheet.png"));

console.log(`Rendered contact sheet to ${path.join(evidence, "contact-sheet.png")}`);
