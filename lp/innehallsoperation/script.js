(function () {
  "use strict";

  var SURFACE = "lp_innehallsoperation";
  var OFFER = "innehallsoperation";
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id"];
  var ALLOWED = {
    company_size: ["1-4", "5-14", "15-49", "50+"],
    cadence: ["sporadic", "monthly", "weekly", "daily"],
    bottleneck: ["ideas", "production", "approval", "publishing", "distribution", "measurement"],
    systems_count: ["1", "2", "3+"],
    timing: ["now", "quarter", "exploring"]
  };

  function capture(eventName, properties) {
    if (!window.posthog || typeof window.posthog.capture !== "function") return;
    window.posthog.capture(eventName, Object.assign({
      surface: SURFACE,
      offer: OFFER
    }, window.__nordsymPaidContext || {}, properties || {}));
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
    var topics = ["Bolagsstorlek", "Publiceringstakt", "Flaskhals", "System", "Tidpunkt"];
    var currentStep = 0;
    var hasStarted = false;

    function selectedInput(step) {
      return step.querySelector("input[type=radio]:checked");
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

    function renderStep() {
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

      var checked = selectedInput(steps[currentStep]);
      var focusTarget = checked || steps[currentStep].querySelector("input[type=radio]");
      if (focusTarget && currentStep > 0) focusTarget.focus();
    }

    form.addEventListener("change", function (event) {
      if (event.target.matches("input[type=radio]")) {
        markStarted();
        clearError();
      }
    });

    nextButton.addEventListener("click", function () {
      markStarted();
      if (!selectedInput(steps[currentStep])) {
        showError("Välj ett alternativ för att fortsätta.");
        return;
      }
      currentStep += 1;
      renderStep();
    });

    backButton.addEventListener("click", function () {
      currentStep = Math.max(0, currentStep - 1);
      renderStep();
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      markStarted();

      if (!selectedInput(steps[currentStep])) {
        showError("Välj ett alternativ för att fortsätta.");
        return;
      }

      var formData = new FormData(form);
      var answers = {};
      var valid = Object.keys(ALLOWED).every(function (key) {
        var value = formData.get(key);
        if (typeof value !== "string" || ALLOWED[key].indexOf(value) === -1) return false;
        answers[key] = value;
        return true;
      });

      if (!valid) {
        showError("Något svar saknas. Gå tillbaka och kontrollera dina val.");
        return;
      }

      capture("nordsym_paid_qualification_completed", answers);

      var destination = new URL("/book/", window.location.origin);
      destination.searchParams.set("lang", "sv");
      destination.searchParams.set("offer", OFFER);
      destination.searchParams.set("source", "meta_paid");

      Object.keys(ALLOWED).forEach(function (key) {
        destination.searchParams.set(key, answers[key]);
      });

      var inbound = new URLSearchParams(window.location.search);
      UTM_KEYS.forEach(function (key) {
        var value = inbound.get(key);
        if (value) destination.searchParams.set(key, value.slice(0, 200));
      });

      window.location.assign(destination.pathname + destination.search);
    });

    renderStep();
  }

  setupCtas();
  setupQualification();
}());
