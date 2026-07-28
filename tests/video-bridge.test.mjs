import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  approvedMedia,
  campaignValue,
  pendingMilestones,
  qualificationHref,
  sanitizedCampaign
} from "../ai-i-drift/sa-fungerar-det/bridge-core.mjs";

test("campaign values are bounded and reject likely PII", () => {
  assert.equal(campaignValue("Meta Summer 2026"), "meta_summer_2026");
  assert.equal(campaignValue("person@example.com"), "");
  assert.equal(campaignValue("+46705292583"), "");
  assert.equal(campaignValue("x".repeat(200)).length, 120);
});

test("only approved UTM keys reach the qualification CTA", () => {
  const campaign = sanitizedCampaign(
    "?utm_source=meta&utm_medium=paid-social&utm_campaign=Barnvakten&utm_id=vid_01&email=a%40b.se&fbclid=secret"
  );
  assert.deepEqual(campaign, {
    utm_source: "meta",
    utm_medium: "paid-social",
    utm_campaign: "barnvakten",
    utm_id: "vid_01"
  });
  assert.equal(
    qualificationHref(campaign),
    "/ai-i-drift/?utm_source=meta&utm_medium=paid-social&utm_campaign=barnvakten&utm_id=vid_01#kvalificering"
  );
});

test("media activation fails closed until an exact approved manifest exists", () => {
  assert.equal(approvedMedia({ schema_version: 1, status: "awaiting_approved_media" }), null);
  assert.equal(approvedMedia({
    schema_version: 1,
    status: "approved",
    video: "https://example.com/external.mp4",
    poster: "/ai-i-drift/sa-fungerar-det/media/poster.webp",
    captions: "/ai-i-drift/sa-fungerar-det/media/captions.sv.vtt",
    language: "sv",
    approved_by: "Gustav Hemmingsson",
    approved_at: "2026-07-28T12:00:00Z"
  }), null);
  assert.equal(approvedMedia({
    schema_version: 1,
    status: "approved",
    video: "/ai-i-drift/sa-fungerar-det/media/barnvakten.mp4",
    poster: "/ai-i-drift/sa-fungerar-det/media/barnvakten-poster.webp",
    captions: "/ai-i-drift/sa-fungerar-det/media/barnvakten.sv.vtt",
    language: "sv",
    approved_by: "",
    approved_at: "not-a-date"
  }), null);
});

test("video progress milestones are bounded and emitted once", () => {
  const reached = new Set();
  assert.deepEqual(pendingMilestones(24.9, reached), []);
  assert.deepEqual(pendingMilestones(51, reached), [25, 50]);
  pendingMilestones(51, reached).forEach((milestone) => reached.add(milestone));
  assert.deepEqual(pendingMilestones(51, reached), []);
  assert.deepEqual(pendingMilestones(100, reached), [75]);
  reached.add(75);
  assert.deepEqual(pendingMilestones(100, reached), []);
  assert.deepEqual(pendingMilestones(Number.NaN, reached), []);
});

test("route has semantic media state, transcript and no dead video source", () => {
  const html = readFileSync(resolve("ai-i-drift/sa-fungerar-det/index.html"), "utf8");
  assert.match(html, /<main id="main"/);
  assert.match(html, /<details class="transcript">/);
  assert.match(html, /<button class="play-control" type="button" disabled/);
  assert.match(html, /href="\/assets\/meta-measurement\.css"/);
  assert.doesNotMatch(html, /<video|<source|autoplay/);
  assert.doesNotMatch(html, /href="\/ai-i-drift\/" aria-label="NordSym/);
  assert.doesNotMatch(html, /01:00/);
});

test("analytics source contains only bounded bridge event properties", () => {
  const script = readFileSync(resolve("ai-i-drift/sa-fungerar-det/script.mjs"), "utf8");
  for (const event of [
    "$pageview",
    "nordsym_paid_video_play",
    "nordsym_paid_video_progress",
    "nordsym_paid_video_complete",
    "nordsym_paid_landing_cta_clicked"
  ]) {
    assert.ok(script.includes(event));
  }
  assert.doesNotMatch(script, /\b(?:name|email|phone|company|notes)\s*:/);
  assert.doesNotMatch(script, /nordsymMeta\?\.track|fbq\('track',\s*'(?:Lead|Schedule)'/);
  assert.match(script, /video\.preload = "none"/);
  assert.match(script, /verifyMediaAssets\(media\)/);
});

test("production block covers canonical and direct asset paths", () => {
  const vercel = JSON.parse(readFileSync(resolve("vercel.json"), "utf8"));
  const sources = vercel.redirects
    .filter((redirect) => redirect.destination === "/ai-i-drift/")
    .map((redirect) => redirect.source);
  assert.ok(sources.includes("/ai-i-drift/sa-fungerar-det"));
  assert.ok(sources.includes("/ai-i-drift/sa-fungerar-det/"));
  assert.ok(sources.includes("/ai-i-drift/sa-fungerar-det/:path*"));
});

test("approved video keeps its 16:9 frame on mobile", () => {
  const css = readFileSync(resolve("ai-i-drift/sa-fungerar-det/bridge.css"), "utf8");
  assert.match(css, /\.media-frame\[data-media-state="preview"\]\s*\{\s*aspect-ratio:\s*4\s*\/\s*5/);
  assert.doesNotMatch(css, /@media \(max-width: 620px\)[\s\S]*?\.media-frame\s*\{\s*aspect-ratio:\s*4\s*\/\s*5/);
});
