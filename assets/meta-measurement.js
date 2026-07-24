(function () {
  'use strict';

  var CONSENT_COOKIE = 'nordsym_marketing_consent';
  var META_COOKIE_NAMES = ['_fbp', '_fbc'];
  var config = null;
  var pixelLoaded = false;
  var pageViewSent = false;

  function readCookie(name) {
    var prefix = name + '=';
    return document.cookie.split(';').map(function (value) {
      return value.trim();
    }).find(function (value) {
      return value.indexOf(prefix) === 0;
    })?.slice(prefix.length) || '';
  }

  function writeConsent(value) {
    document.cookie = CONSENT_COOKIE + '=' + value +
      '; Path=/; Max-Age=15552000; SameSite=Lax; Secure';
  }

  function deleteCookie(name) {
    document.cookie = name + '=; Path=/; Max-Age=0; SameSite=Lax; Secure';
  }

  function consentState() {
    var value = readCookie(CONSENT_COOKIE);
    return value === 'granted' || value === 'denied' ? value : 'unknown';
  }

  function language() {
    return document.documentElement.lang === 'sv' ||
      document.documentElement.dataset.bookingVariant === 'sv'
      ? 'sv'
      : 'en';
  }

  function strings() {
    if (language() === 'sv') {
      return {
        title: 'Valfri annonsmätning',
        text: 'Med ditt godkännande använder NordSym Meta Pixel och Conversions API för att mäta om annonser leder till kvalificering och bokning. Meta kan då ta emot sid- och konverteringsdata, IP- och webbläsarinformation samt Meta-cookie- och klickidentifierare. Namn, e-postadress, företag, anteckningar och formulärsvar skickas inte av denna integration.',
        reject: 'Avvisa',
        accept: 'Tillåt mätning',
        privacy: 'Läs om databehandlingen'
      };
    }
    return {
      title: 'Optional advertising measurement',
      text: 'With your permission, NordSym uses Meta Pixel and Conversions API to measure whether ads lead to qualification and bookings. Meta may then receive page and conversion data, IP and browser information, and Meta cookie or click identifiers. This integration does not send names, email addresses, companies, notes, or form answers.',
      reject: 'Reject',
      accept: 'Allow measurement',
      privacy: 'Read about data processing'
    };
  }

  function removeBanner() {
    document.getElementById('nordsym-meta-consent')?.remove();
  }

  function showBanner() {
    if (document.getElementById('nordsym-meta-consent')) return;
    var copy = strings();
    var banner = document.createElement('section');
    banner.id = 'nordsym-meta-consent';
    banner.className = 'nordsym-meta-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-labelledby', 'nordsym-meta-consent-title');
    banner.innerHTML =
      '<div class="nordsym-meta-consent__copy">' +
        '<strong id="nordsym-meta-consent-title">' + copy.title + '</strong>' +
        '<p>' + copy.text + ' <a href="/privacy.html#meta-measurement">' + copy.privacy + '</a>.</p>' +
      '</div>' +
      '<div class="nordsym-meta-consent__actions">' +
        '<button type="button" data-meta-consent="denied">' + copy.reject + '</button>' +
        '<button type="button" class="is-primary" data-meta-consent="granted">' + copy.accept + '</button>' +
      '</div>';
    banner.addEventListener('click', function (event) {
      var button = event.target.closest('[data-meta-consent]');
      if (!button) return;
      var choice = button.getAttribute('data-meta-consent');
      writeConsent(choice);
      removeBanner();
      if (choice === 'granted') {
        loadPixel();
      } else {
        META_COOKIE_NAMES.forEach(deleteCookie);
      }
    });
    document.body.appendChild(banner);
  }

  function installPixelQueue() {
    if (window.fbq) return;
    var fbq = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    window.fbq = fbq;
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
  }

  function loadPixel() {
    if (!config?.enabled || pixelLoaded || consentState() !== 'granted') return;
    pixelLoaded = true;
    installPixelQueue();
    window.fbq('set', 'autoConfig', false, config.pixelId);
    window.fbq('init', config.pixelId);

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    if (!pageViewSent) {
      pageViewSent = true;
      window.fbq('track', 'PageView');
    }
  }

  function eventId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return 'evt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 18);
  }

  function customData() {
    return {
      content_name: 'ai_i_drift_qualification',
      content_category: 'lead_generation'
    };
  }

  function sendConversion(eventName) {
    if (
      !config?.enabled ||
      consentState() !== 'granted' ||
      eventName !== 'Lead'
    ) {
      return false;
    }

    loadPixel();
    var id = eventId();
    var data = customData();
    window.fbq('track', eventName, data, { eventID: id });
    return true;
  }

  function withdraw() {
    deleteCookie(CONSENT_COOKIE);
    META_COOKIE_NAMES.forEach(deleteCookie);
    document.cookie = '_fbp=; Path=/; Domain=nordsym.com; Max-Age=0; SameSite=Lax; Secure';
    document.cookie = '_fbc=; Path=/; Domain=nordsym.com; Max-Age=0; SameSite=Lax; Secure';
    if (window.fbq) window.fbq('consent', 'revoke');
    window.location.reload();
  }

  window.nordsymMeta = {
    track: sendConversion,
    withdraw: withdraw,
    consent: consentState
  };

  fetch('/api/meta-config', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' }
  }).then(function (response) {
    if (!response.ok) throw new Error('config_unavailable');
    return response.json();
  }).then(function (nextConfig) {
    config = nextConfig;
    if (!config?.enabled) return;
    if (consentState() === 'granted') loadPixel();
    if (consentState() === 'unknown') showBanner();
  }).catch(function () {});
}());
