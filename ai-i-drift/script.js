(function () {
  "use strict";

  var SURFACE = document.body.dataset.analyticsSurface || "lp_ai_i_drift";
  var OFFER = "ai_i_drift";
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_content"];
  var ALLOWED = {
    consequences: ["time", "delay", "errors_rework", "lost_revenue", "weak_follow_up", "other"],
    information_locations: ["one_system", "several_systems", "documents_messages_email", "individual_people", "no_complete_overview"],
    systems_count: ["1", "2", "3-5", "6+"],
    mandate: ["sponsor_now", "owner_in_place", "hiring_owner", "exploring"]
  };
  var PRIVATE_CONTEXT_KEY = "nordsym_ai_i_drift_pre_call_v1";

  function capture(eventName, properties) {
    if (!window.posthog || typeof window.posthog.capture !== "function") return;
    window.posthog.capture(eventName, Object.assign({
      surface: SURFACE,
      offer: OFFER
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

  function setupCtas() {
    document.querySelectorAll(".tracked-cta").forEach(function (link) {
      link.addEventListener("click", function () {
        capture("nordsym_paid_landing_cta_clicked", {
          placement: link.dataset.placement || "unknown"
        });
      });
    });
  }

  function setupQualification() {
    var form = document.getElementById("qualification-form");
    if (!form) return;

    var steps = Array.prototype.slice.call(form.querySelectorAll(".form-step"));
    var backButton = document.getElementById("back-button");
    var nextButton = document.getElementById("next-button");
    var submitButton = document.getElementById("submit-button");
    var stepLabel = document.getElementById("step-label");
    var stepTopic = document.getElementById("step-topic");
    var progressBar = document.getElementById("progress-bar");
    var error = document.getElementById("form-error");
    var topics = ["Arbetet", "Konsekvens", "Information", "System", "Beslut"];
    var currentStep = 0;
    var hasStarted = false;

    function checkedValues(step, name) {
      return Array.prototype.slice.call(step.querySelectorAll('input[name="' + name + '"]:checked'))
        .map(function (input) { return input.value; });
    }

    function selectedInput(step) {
      return step.querySelector("input[type=radio]:checked, input[type=checkbox]:checked");
    }

    function workDescription() {
      var field = form.elements.work_description;
      return field ? String(field.value || "").trim().slice(0, 280) : "";
    }

    function otherDetail() {
      var field = form.elements.consequence_other_detail;
      return field ? String(field.value || "").trim().slice(0, 160) : "";
    }

    function syncOtherField() {
      var other = form.querySelector('input[name="consequences"][value="other"]');
      var wrap = document.getElementById("consequence-other-wrap");
      var field = form.elements.consequence_other_detail;
      if (!other || !wrap || !field) return;
      wrap.hidden = !other.checked;
      field.disabled = !other.checked;
      field.required = other.checked;
      other.setAttribute("aria-expanded", other.checked ? "true" : "false");
      if (!other.checked) field.value = "";
    }

    function validateStep(step) {
      var index = steps.indexOf(step);
      if (index === 0) {
        if (!workDescription()) return "Beskriv arbetet kort för att fortsätta.";
        return "";
      }
      if (index === 1) {
        var consequences = checkedValues(step, "consequences");
        if (!consequences.length) return "Välj minst en konsekvens för att fortsätta.";
        if (consequences.indexOf("other") !== -1 && !otherDetail()) return "Beskriv vad den andra konsekvensen är.";
        return "";
      }
      if (index === 2 && !checkedValues(step, "information_locations").length) {
        return "Välj minst ett alternativ för att fortsätta.";
      }
      return selectedInput(step) ? "" : "Välj ett alternativ för att fortsätta.";
    }

    function showError(message) {
      error.textContent = message;
      error.hidden = false;
    }

    function clearError() {
      error.hidden = true;
    }

    function markStarted() {
      if (hasStarted) return;
      hasStarted = true;
      capture("nordsym_paid_qualification_started");
    }

    function renderStep(shouldFocus) {
      steps.forEach(function (step, index) {
        var active = index === currentStep;
        step.hidden = !active;
        step.classList.toggle("is-active", active);
      });
      stepLabel.textContent = "Steg " + (currentStep + 1) + " av " + steps.length;
      stepTopic.textContent = topics[currentStep];
      progressBar.style.width = ((currentStep + 1) / steps.length * 100) + "%";
      backButton.hidden = currentStep === 0;
      nextButton.hidden = currentStep === steps.length - 1;
      submitButton.hidden = currentStep !== steps.length - 1;
      clearError();

      if (shouldFocus) {
        var checked = selectedInput(steps[currentStep]);
        var focusTarget = checked || steps[currentStep].querySelector("textarea, input:not([type=hidden])");
        if (focusTarget) focusTarget.focus();
      }
    }

    form.addEventListener("change", function (event) {
      if (event.target.matches("input[type=radio], input[type=checkbox]")) {
        if (event.target.name === "consequences") syncOtherField();
        markStarted();
        clearError();
      }
    });

    form.addEventListener("input", function (event) {
      if (event.target.matches("textarea, input[type=text]")) {
        markStarted();
        clearError();
      }
    });

    nextButton.addEventListener("click", function () {
      markStarted();
      var message = validateStep(steps[currentStep]);
      if (message) {
        showError(message);
        return;
      }
      currentStep = Math.min(steps.length - 1, currentStep + 1);
      renderStep(true);
    });

    backButton.addEventListener("click", function () {
      currentStep = Math.max(0, currentStep - 1);
      renderStep(true);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      markStarted();

      var currentMessage = validateStep(steps[currentStep]);
      if (currentMessage) {
        showError(currentMessage);
        return;
      }

      var formData = new FormData(form);
      var answers = {
        work_description: workDescription(),
        consequence_other_detail: otherDetail(),
        consequences: formData.getAll("consequences"),
        information_locations: formData.getAll("information_locations"),
        systems_count: formData.get("systems_count"),
        mandate: formData.get("mandate")
      };
      var valid = answers.work_description.length > 0 &&
        answers.consequences.length > 0 &&
        answers.consequences.every(function (value) { return ALLOWED.consequences.indexOf(value) !== -1; }) &&
        answers.information_locations.length > 0 &&
        answers.information_locations.every(function (value) { return ALLOWED.information_locations.indexOf(value) !== -1; }) &&
        ALLOWED.systems_count.indexOf(answers.systems_count) !== -1 &&
        ALLOWED.mandate.indexOf(answers.mandate) !== -1 &&
        (answers.consequences.indexOf("other") === -1 || answers.consequence_other_detail.length > 0);

      if (!valid) {
        showError("Något svar saknas. Gå tillbaka och kontrollera dina val.");
        return;
      }

      var prequalified =
        answers.systems_count !== "1" &&
        answers.mandate !== "exploring";
      var categoricalAnswers = {
        consequences: answers.consequences.join(","),
        information_locations: answers.information_locations.join(","),
        systems_count: answers.systems_count,
        mandate: answers.mandate,
        qualification_signal: prequalified ? "prequalified" : "form_complete"
      };
      capture("nordsym_paid_qualification_completed", categoricalAnswers);
      window.nordsymMeta?.track("Lead");

      try {
        window.sessionStorage.setItem(PRIVATE_CONTEXT_KEY, JSON.stringify({
          work_description: answers.work_description,
          consequence_other_detail: answers.consequence_other_detail
        }));
      } catch (storageError) {
        // The booking path remains available if private session storage is unavailable.
      }

      var destination = new URL("/book/", window.location.origin);
      destination.searchParams.set("lang", "sv");
      destination.searchParams.set("offer", OFFER);
      destination.searchParams.set("source", "meta_paid");

      Object.keys(categoricalAnswers).forEach(function (key) {
        destination.searchParams.set(key, categoricalAnswers[key]);
      });

      var inbound = new URLSearchParams(window.location.search);
      UTM_KEYS.forEach(function (key) {
        var value = campaignValue(inbound.get(key));
        if (value) destination.searchParams.set(key, value);
      });

      window.location.assign(destination.pathname + destination.search);
    });

    syncOtherField();
    renderStep(false);
  }

  setupCtas();
  setupQualification();
}());
