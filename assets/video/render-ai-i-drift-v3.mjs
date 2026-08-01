import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const audioPath = process.argv[2];
const outputPath = path.join(import.meta.dirname, "ai-i-drift-sa-fungerar-det-v3.mp4");

if (!audioPath) {
  throw new Error("Usage: node assets/video/render-ai-i-drift-v3.mjs /absolute/path/to/narration.mp3");
}

const logoData = readFileSync(path.join(projectRoot, "assets/brand/nordsym-signature-dark.png")).toString("base64");
const workDir = mkdtempSync(path.join(tmpdir(), "nordsym-ai-i-drift-v3-"));

const frames = [
  {
    duration: 4.4,
    kicker: "ÅTERKOMMANDE ARBETE",
    title: ["Vad betalar ni människor", "för att göra varje vecka?"],
    support: "Börja med arbetet som redan kostar tydlig tid eller pengar.",
    chips: ["Tid", "Kostnad", "Kapacitet"]
  },
  {
    duration: 8.08,
    kicker: "VAR FÖRSVINNER TIDEN?",
    title: ["Samma steg.", "Vecka efter vecka."],
    support: "Samla in underlag · Uppdatera flera system · Kontrollera · Följa upp",
    chips: ["Underlag", "System", "Kontroll", "Uppföljning"]
  },
  {
    duration: 5.28,
    kicker: "NORDSYM BYGGER I ER TECH STACK",
    title: ["Agenten tar över", "det återkommande."],
    support: "Vi kopplar den till systemen där jobbet redan händer.",
    chips: ["Era system", "AI-agent", "Arbete klart"]
  },
  {
    duration: 10.34,
    kicker: "BÖRJA MED ETT TYDLIGT UTFALL",
    title: ["Flytta tid och kostnad", "från teamet först."],
    support: "Agenten drivs vidare när verksamheten och systemen förändras.",
    chips: ["En uppgift", "Tydligt värde", "Löpande drift"]
  },
  {
    duration: 5.49,
    kicker: "RÄTT ARBETSFÖRDELNING",
    title: ["Agenten gör jobbet.", "Människan tar beslutet."],
    support: "Teamet kommer in när omdöme faktiskt behövs.",
    chips: ["Återkommande", "Beslutspunkt", "Människa"]
  },
  {
    duration: 5.93,
    kicker: "FÖRSTA STEGET",
    title: ["Svara på fem frågor."],
    support: "Hitta arbetet som är värt att flytta från teamet först.",
    chips: ["5 frågor", "Rätt arbetsflöde", "Nästa steg"]
  }
];

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&apos;"
  })[character]);
}

function frameSvg(frame, index) {
  const title = frame.title.map((line, lineIndex) =>
    `<text x="120" y="${310 + lineIndex * 108}" class="title">${escapeXml(line)}</text>`
  ).join("\n");
  const chipWidth = Math.min(350, Math.floor(1330 / frame.chips.length));
  const chips = frame.chips.map((chip, chipIndex) => {
    const x = 120 + chipIndex * (chipWidth + 24);
    return `<g transform="translate(${x} 650)"><rect width="${chipWidth}" height="92" rx="2" class="chip"/><text x="24" y="55" class="chip-text">${escapeXml(chip)}</text></g>`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="#f3eee4" stroke-opacity=".05"/></pattern>
    <style>
      .kicker{fill:#df7a5d;font-family:Arial,sans-serif;font-size:22px;font-weight:600;letter-spacing:4px}.title{fill:#f3eee4;font-family:Georgia,serif;font-size:88px;font-weight:400}.support{fill:#cfc5b5;font-family:Arial,sans-serif;font-size:28px;font-weight:400}.chip{fill:#211d17;stroke:#f3eee4;stroke-opacity:.22}.chip-text{fill:#f3eee4;font-family:Arial,sans-serif;font-size:22px;font-weight:500}.meta{fill:#9e9587;font-family:Arial,sans-serif;font-size:15px;font-weight:500;letter-spacing:2px}
    </style>
  </defs>
  <rect width="1600" height="900" fill="#17140f"/><rect width="1600" height="900" fill="url(#grid)"/>
  <rect x="30" y="30" width="1540" height="840" fill="none" stroke="#f3eee4" stroke-opacity=".13"/>
  <image x="120" y="70" width="230" height="68" href="data:image/png;base64,${logoData}" preserveAspectRatio="xMinYMid meet"/>
  <text x="1480" y="111" text-anchor="end" class="meta">${String(index + 1).padStart(2, "0")} / 06</text>
  <line x1="120" y1="158" x2="1480" y2="158" stroke="#f3eee4" stroke-opacity=".16"/>
  <text x="120" y="225" class="kicker">${escapeXml(frame.kicker)}</text>
  ${title}
  <text x="120" y="570" class="support">${escapeXml(frame.support)}</text>
  ${chips}
  <polygon points="1452,792 1460,824 1492,832 1460,840 1452,872 1444,840 1412,832 1444,824" fill="#a8432b"/>
  </svg>`;
}

frames.forEach((frame, index) => {
  const stem = String(index + 1).padStart(2, "0");
  const svgPath = path.join(workDir, `${stem}.svg`);
  const pngPath = path.join(workDir, `${stem}.png`);
  writeFileSync(svgPath, frameSvg(frame, index));
  execFileSync("sips", ["-s", "format", "png", svgPath, "--out", pngPath], { stdio: "ignore" });
});

const concatPath = path.join(workDir, "sequence.txt");
const concat = frames.flatMap((frame, index) => {
  const pngPath = path.join(workDir, `${String(index + 1).padStart(2, "0")}.png`);
  return [`file '${pngPath}'`, `duration ${frame.duration}`];
});
concat.push(`file '${path.join(workDir, "06.png")}'`);
writeFileSync(concatPath, `${concat.join("\n")}\n`);

execFileSync("ffmpeg", [
  "-y", "-hide_banner", "-loglevel", "error",
  "-f", "concat", "-safe", "0", "-i", concatPath,
  "-i", audioPath,
  "-map", "0:v:0", "-map", "1:a:0",
  "-r", "30", "-c:v", "libx264", "-profile:v", "high", "-level", "4.0",
  "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium",
  "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "1",
  "-movflags", "+faststart", "-shortest", outputPath
]);

console.log(outputPath);
