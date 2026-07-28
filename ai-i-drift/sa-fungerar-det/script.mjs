import {
  approvedMedia,
  pendingMilestones,
  qualificationHref,
  sanitizedCampaign
} from "./bridge-core.mjs";

const SURFACE = "lp_ai_i_drift";
const OFFER = "ai_i_drift";
const ROUTE_VARIANT = "video_bridge";
const campaign = sanitizedCampaign(window.location.search);
const cta = document.getElementById("bridge-cta");
cta.href = qualificationHref(campaign, window.location.origin);
window.history.replaceState({}, "", window.location.pathname);

function capture(eventName, properties = {}) {
  if (!window.posthog || typeof window.posthog.capture !== "function") return;
  window.posthog.capture(eventName, {
    surface: SURFACE,
    offer: OFFER,
    route_variant: ROUTE_VARIANT,
    ...campaign,
    ...properties
  });
}

function loadPostHog() {
  if (window.__nordsymPosthogLoaded) return;
  window.__nordsymPosthogLoaded = true;
  const posthog = window.posthog = window.posthog || [];
  posthog._i = posthog._i || [];
  posthog.init = function (token, config, name) {
    const target = name ? posthog[name] = [] : posthog;
    target.people = target.people || [];
    ["capture", "register", "set_config"].forEach(function (method) {
      target[method] = function () {
        target.push([method].concat(Array.prototype.slice.call(arguments)));
      };
    });
    posthog._i.push([token, config, name]);
  };
  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = "https://eu-assets.i.posthog.com/static/array.js";
  document.head.appendChild(script);
  posthog.init("phc_prXdjcKDtkz7BUsTooS42jKjZerJtL7GmtYSRCNGZpmR", {
    api_host: "https://eu.i.posthog.com",
    ui_host: "https://eu.posthog.com",
    defaults: "2026-05-30",
    cookieless_mode: "always",
    person_profiles: "identified_only",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    loaded: function () {
      capture("$pageview", {
        path: window.location.pathname,
        privacy_mode: "server_hash"
      });
    }
  });
}

function loadConsentGatedMeta() {
  const script = document.createElement("script");
  script.src = "/assets/meta-measurement.js";
  script.defer = true;
  document.head.appendChild(script);
}

function activateVideo(manifest) {
  const frame = document.getElementById("media-frame");
  const video = document.createElement("video");
  video.controls = true;
  video.preload = "none";
  video.playsInline = true;
  video.poster = manifest.poster;
  video.setAttribute("aria-label", "Barnvakten: varför en fungerande demo inte är stabil drift");

  const source = document.createElement("source");
  source.src = manifest.video;
  source.type = manifest.video.toLowerCase().endsWith(".mov") ? "video/quicktime" : "video/mp4";
  video.appendChild(source);

  const track = document.createElement("track");
  track.kind = "captions";
  track.label = "Svenska";
  track.srclang = "sv";
  track.src = manifest.captions;
  track.default = true;
  video.appendChild(track);

  const reached = new Set();
  let completed = false;
  video.addEventListener("play", function onFirstPlay() {
    capture("nordsym_paid_video_play");
    video.removeEventListener("play", onFirstPlay);
  });
  video.addEventListener("timeupdate", function () {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    const percent = video.currentTime / video.duration * 100;
    pendingMilestones(percent, reached).forEach(function (milestone) {
      reached.add(milestone);
      capture("nordsym_paid_video_progress", { progress_percent: milestone });
    });
  });
  video.addEventListener("ended", function () {
    if (completed) return;
    completed = true;
    capture("nordsym_paid_video_complete");
  });

  frame.replaceChildren(video);
  frame.dataset.mediaState = "approved";
  document.querySelector(".header-note").textContent = "AI i drift · Så fungerar det";
}

function verifyMediaAssets(manifest) {
  return Promise.all([
    ["video", manifest.video, "video/"],
    ["poster", manifest.poster, "image/"],
    ["captions", manifest.captions, "text/vtt"]
  ].map(function ([label, path, expectedType]) {
    return fetch(path, {
      method: "HEAD",
      credentials: "same-origin"
    }).then(function (response) {
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok || !contentType.toLowerCase().startsWith(expectedType)) {
        throw new Error(label + "_unavailable");
      }
    });
  })).then(function () {
    return manifest;
  });
}

cta.addEventListener("click", function () {
  capture("nordsym_paid_landing_cta_clicked", { placement: "video_bridge" });
});

fetch("./media-manifest.json", {
  credentials: "same-origin",
  headers: { Accept: "application/json" }
}).then(function (response) {
  if (!response.ok) throw new Error("manifest_unavailable");
  return response.json();
}).then(function (manifest) {
  const media = approvedMedia(manifest);
  if (!media) return;
  return verifyMediaAssets(media);
}).then(function (media) {
  if (!media) return;
  activateVideo(media);
  loadPostHog();
  loadConsentGatedMeta();
}).catch(function () {
  document.getElementById("media-status").textContent =
    "Förhandsvisningen kunde inte verifiera något godkänt mediapaket. Ingen video eller mätning har aktiverats.";
});
