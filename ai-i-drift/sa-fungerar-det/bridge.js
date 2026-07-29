(function () {
  "use strict";

  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_id"];
  var video = document.getElementById("bridge-video");
  var cta = document.getElementById("bridge-cta");
  var milestones = {};

  function capture(eventName, properties) {
    if (!window.posthog || typeof window.posthog.capture !== "function") return;
    window.posthog.capture(eventName, Object.assign({
      surface: "lp_ai_i_drift_bridge",
      offer: "ai_i_drift"
    }, window.__nordsymPaidContext || {}, properties || {}));
  }

  function campaignValue(value) {
    var raw = String(value || "").trim();
    if (!raw || raw.indexOf("@") !== -1 || raw.replace(/\D/g, "").length >= 7) return "";
    return raw
      .toLowerCase()
      .replace(/[^a-z0-9._~-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 120);
  }

  function preserveCampaign() {
    if (!cta) return;
    var destination = new URL(cta.getAttribute("href"), window.location.origin);
    var inbound = new URLSearchParams(window.location.search);

    UTM_KEYS.forEach(function (key) {
      var value = campaignValue(inbound.get(key));
      if (value) destination.searchParams.set(key, value);
    });

    cta.href = destination.pathname + destination.search + destination.hash;
  }

  function setupVideo() {
    if (!video) return;

    video.addEventListener("play", function () {
      if (milestones.started) return;
      milestones.started = true;
      capture("nordsym_paid_bridge_video_started");
    });

    video.addEventListener("timeupdate", function () {
      if (!video.duration || !Number.isFinite(video.duration)) return;
      var progress = video.currentTime / video.duration;
      [0.25, 0.5, 0.75].forEach(function (threshold) {
        var label = String(threshold * 100);
        if (progress >= threshold && !milestones[label]) {
          milestones[label] = true;
          capture("nordsym_paid_bridge_video_progress", { percent: threshold * 100 });
        }
      });
    });

    video.addEventListener("ended", function () {
      if (milestones.completed) return;
      milestones.completed = true;
      capture("nordsym_paid_bridge_video_completed");
    });
  }

  preserveCampaign();
  setupVideo();

  if (cta) {
    cta.addEventListener("click", function () {
      capture("nordsym_paid_bridge_cta_clicked", {
        placement: cta.dataset.placement || "video_bridge"
      });
    });
  }
}());
