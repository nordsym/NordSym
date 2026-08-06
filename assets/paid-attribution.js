(function () {
  "use strict";

  var keys = ["utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_content"];
  var storageKey = "nordsym_paid_entry_v1";
  var params = new URLSearchParams(window.location.search);

  function value(raw) {
    raw = String(raw || "").trim();
    if (!raw || raw.indexOf("@") !== -1 || raw.replace(/\D/g, "").length >= 7) return "";
    return raw.toLowerCase().replace(/[^a-z0-9._~-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 120);
  }

  function read() {
    try { return JSON.parse(sessionStorage.getItem(storageKey) || "null"); } catch (_) { return null; }
  }

  var current = {};
  keys.forEach(function (key) {
    var item = value(params.get(key));
    if (item) current[key] = item;
  });
  var isTest = current.utm_campaign === "e2e_booking_test" || current.utm_content === "controlled_booking";
  var isPaid = current.utm_source === "meta" || current.utm_source === "meta_ads";
  var isPaidRoute = isPaid || isTest || window.location.pathname.indexOf("/ai-i-drift/") === 0 ||
    (params.get("lang") === "sv" && params.get("offer") === "ai_i_drift");
  var existing = isPaidRoute ? read() : null;
  var entry = existing || {
    entry_type: isTest ? "internal_test" : (isPaid ? "paid" : "direct"),
    entry_path: window.location.pathname,
    entry_timestamp: new Date().toISOString(),
    entry_id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now())
  };
  if (!existing) {
    keys.forEach(function (key) { if (current[key]) entry[key] = current[key]; });
    try { sessionStorage.setItem(storageKey, JSON.stringify(entry)); } catch (_) {}
  }

  window.__nordsymPaidAttribution = entry;
  window.__nordsymPaidContext = Object.assign({}, entry);
  window.__nordsymAttributionStep = function (properties) {
    return Object.assign({}, entry, properties || {});
  };
}());
