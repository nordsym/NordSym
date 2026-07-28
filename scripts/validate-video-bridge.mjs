import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { approvedMedia } from "../ai-i-drift/sa-fungerar-det/bridge-core.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const route = "ai-i-drift/sa-fungerar-det";
const manifest = JSON.parse(readFileSync(resolve(root, route, "media-manifest.json"), "utf8"));
const vercel = JSON.parse(readFileSync(resolve(root, "vercel.json"), "utf8"));
const failures = [];
const html = readFileSync(resolve(root, route, "index.html"), "utf8");
const script = readFileSync(resolve(root, route, "script.mjs"), "utf8");
const exactSources = new Set(
  vercel.redirects
    .filter((redirect) => redirect.destination === "/ai-i-drift/")
    .map((redirect) => redirect.source)
);
const blocked =
  exactSources.has(`/${route}`) &&
  exactSources.has(`/${route}/`) &&
  exactSources.has(`/${route}/:path*`);
const approved = approvedMedia(manifest);

function probeMedia(path) {
  try {
    return JSON.parse(execFileSync("ffprobe", [
      "-v", "error",
      "-show_entries", "stream=codec_name,codec_type,width,height",
      "-of", "json",
      path
    ], { encoding: "utf8" }));
  } catch {
    failures.push("approved media requires a working ffprobe validation");
    return { streams: [] };
  }
}

function topLevelMp4Boxes(path) {
  const data = readFileSync(path);
  const boxes = [];
  let offset = 0;

  while (offset + 8 <= data.length) {
    let size = data.readUInt32BE(offset);
    const type = data.toString("ascii", offset + 4, offset + 8);
    let headerSize = 8;

    if (size === 1) {
      if (offset + 16 > data.length) break;
      const largeSize = data.readBigUInt64BE(offset + 8);
      if (largeSize > BigInt(Number.MAX_SAFE_INTEGER)) break;
      size = Number(largeSize);
      headerSize = 16;
    } else if (size === 0) {
      size = data.length - offset;
    }

    if (size < headerSize || offset + size > data.length) break;
    boxes.push({ type, offset });
    offset += size;
  }

  return boxes;
}

function normalizedWords(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .match(/\p{L}{3,}/gu) || [];
}

function validateCaptions(path) {
  const vtt = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
  if (!/^WEBVTT(?:[ \t].*)?\r?\n/.test(vtt)) {
    failures.push("approved captions are not valid WebVTT");
    return;
  }

  const cuePattern = /(?:^|\r?\n)(?:\d+\r?\n)?(\d{2}:)?\d{2}:\d{2}\.\d{3}[ \t]+-->[ \t]+(?:\d{2}:)?\d{2}:\d{2}\.\d{3}[^\r\n]*(?:\r?\n)([\s\S]*?)(?=\r?\n\r?\n|$)/g;
  const cueText = [];
  let match;
  while ((match = cuePattern.exec(vtt))) {
    cueText.push(match[2].replace(/<[^>]+>/g, " "));
  }
  if (!cueText.length) {
    failures.push("approved captions contain no readable cues");
    return;
  }

  const transcriptMatch = html.match(/<details class="transcript">([\s\S]*?)<\/details>/);
  const transcriptText = transcriptMatch
    ? transcriptMatch[1].replace(/<summary>[\s\S]*?<\/summary>/, " ").replace(/<[^>]+>/g, " ")
    : "";
  const transcriptWords = new Set(normalizedWords(transcriptText));
  const captionWords = new Set(normalizedWords(cueText.join(" ")));
  const overlap = [...transcriptWords].filter((word) => captionWords.has(word)).length;
  if (!transcriptWords.size || overlap / transcriptWords.size < 0.75) {
    failures.push("approved captions do not sufficiently match the published transcript");
  }
}

function validateApprovedPackage(media) {
  const paths = Object.fromEntries(
    ["video", "poster", "captions"].map((key) => [
      key,
      resolve(root, media[key].replace(/^\//, ""))
    ])
  );

  for (const [key, path] of Object.entries(paths)) {
    if (!existsSync(path)) {
      failures.push(`approved ${key} file is missing`);
      continue;
    }
    if (!statSync(path).isFile() || statSync(path).size === 0) {
      failures.push(`approved ${key} file is empty or invalid`);
    }
  }
  if (failures.some((failure) => failure.includes("file is missing") || failure.includes("empty or invalid"))) {
    return;
  }

  const videoProbe = probeMedia(paths.video);
  const video = videoProbe.streams.find((stream) => stream.codec_type === "video");
  const audio = videoProbe.streams.find((stream) => stream.codec_type === "audio");
  if (
    !video ||
    video.codec_name !== "h264" ||
    video.width < 1920 ||
    video.height < 1080 ||
    Math.abs(video.width / video.height - 16 / 9) > 0.02
  ) {
    failures.push("approved video must be H.264, 16:9 and at least 1920 by 1080");
  }
  if (!audio || audio.codec_name !== "aac") {
    failures.push("approved video audio must use AAC");
  }

  const boxes = topLevelMp4Boxes(paths.video);
  const moov = boxes.find((box) => box.type === "moov");
  const mdat = boxes.find((box) => box.type === "mdat");
  if (extname(paths.video).toLowerCase() !== ".mp4" || !moov || !mdat || moov.offset > mdat.offset) {
    failures.push("approved video must be a fast-start MP4 with moov before mdat");
  }

  const posterProbe = probeMedia(paths.poster);
  const poster = posterProbe.streams.find((stream) => stream.codec_type === "video");
  if (
    !poster ||
    poster.width < 1920 ||
    poster.height < 1080 ||
    Math.abs(poster.width / poster.height - 16 / 9) > 0.02
  ) {
    failures.push("approved poster must be 16:9 and at least 1920 by 1080");
  }

  validateCaptions(paths.captions);
}

if (manifest.status === "approved") {
  if (!approved) failures.push("approved manifest does not satisfy the media contract");
  if (blocked) failures.push("approved route is still redirected away");
  if (approved) {
    for (const [key, allowed] of Object.entries({
      video: [".mp4", ".mov"],
      poster: [".webp", ".jpg", ".jpeg", ".png"],
      captions: [".vtt"]
    })) {
      const diskPath = resolve(root, approved[key].replace(/^\//, ""));
      if (!existsSync(diskPath)) failures.push(`approved ${key} file is missing`);
      if (!allowed.includes(extname(diskPath).toLowerCase())) failures.push(`approved ${key} extension is invalid`);
    }
    validateApprovedPackage(approved);
  }
} else {
  if (approved) failures.push("unapproved manifest unexpectedly validates as approved");
  if (!blocked) failures.push("unapproved video bridge is not blocked by canonical and subtree production redirects");
}

for (const [text, label] of [
  ['content="noindex,nofollow,noarchive"', "paid noindex boundary"],
  ['id="bridge-cta"', "primary CTA"],
  ['href="/ai-i-drift/#kvalificering"', "qualification fallback"],
  ["Öppna transkriptet", "accessible transcript"],
  ["Video inväntar godkänt material", "truthful preview state"]
]) {
  if (!html.includes(text)) failures.push(`missing ${label}`);
}
for (const [text, label] of [
  ['route_variant: ROUTE_VARIANT', "route variant analytics"],
  ['nordsym_paid_video_play', "play event"],
  ['nordsym_paid_video_progress', "progress event"],
  ['nordsym_paid_video_complete', "complete event"],
  ['placement: "video_bridge"', "CTA placement"],
  ['window.history.replaceState({}, "", window.location.pathname)', "query stripping"],
  ['if (!media) return;', "unapproved manifest fail closed"]
]) {
  if (!script.includes(text)) failures.push(`missing ${label}`);
}
for (const forbidden of ["autoplay", "posthog.identify(", "email:", "phone:", "company:"]) {
  if (html.includes(forbidden) || script.includes(forbidden)) failures.push(`contains forbidden ${forbidden}`);
}

if (failures.length) {
  console.error(`Video bridge validation failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(`video-bridge: ok (${manifest.status}, production route ${blocked ? "blocked" : "open"})`);
