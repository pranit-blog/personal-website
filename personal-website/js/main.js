// Saindani — shared site behavior. No framework, no build step.
(function () {
  "use strict";

  /* Mobile nav toggle */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });
  }

  /* Category filter pills (Home + Essays hub) */
  var pillGroups = document.querySelectorAll("[data-filter-pills]");
  pillGroups.forEach(function (group) {
    var gridSelector = group.getAttribute("data-filter-pills");
    var grid = document.querySelector(gridSelector);
    if (!grid) return;
    var cards = grid.querySelectorAll(".card");
    var searchInput = document.querySelector("[data-search-for='" + gridSelector.replace("#", "") + "']");
    var emptyState = document.querySelector(gridSelector + "-empty");

    function applyFilters() {
      var activePill = group.querySelector(".pill.is-active");
      var filter = activePill ? activePill.getAttribute("data-filter") : "all";
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var visibleCount = 0;

      cards.forEach(function (card) {
        var category = card.getAttribute("data-category");
        var isContrarian = card.getAttribute("data-contrarian") === "true";
        var matchesFilter =
          filter === "all" ||
          filter === category ||
          (filter === "contrarian" && isContrarian);

        var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        var matchesSearch = query === "" || haystack.indexOf(query) !== -1;

        var visible = matchesFilter && matchesSearch;
        card.classList.toggle("is-hidden", !visible);
        if (visible) visibleCount++;
      });

      if (emptyState) emptyState.classList.toggle("is-visible", visibleCount === 0);
    }

    group.querySelectorAll(".pill").forEach(function (pill) {
      pill.addEventListener("click", function () {
        group.querySelectorAll(".pill").forEach(function (p) { p.classList.remove("is-active"); });
        pill.classList.add("is-active");
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    applyFilters();
  });

  /* Share buttons: X / LinkedIn intents + copy link */
  document.querySelectorAll("[data-share]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var type = btn.getAttribute("data-share");
      var url = window.location.href;
      var title = document.title;

      if (type === "x") {
        window.open(
          "https://twitter.com/intent/tweet?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(title),
          "_blank",
          "noopener,width=600,height=460"
        );
      } else if (type === "linkedin") {
        window.open(
          "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(url),
          "_blank",
          "noopener,width=600,height=520"
        );
      } else if (type === "copy") {
        navigator.clipboard.writeText(url).then(function () {
          btn.classList.add("is-copied");
          setTimeout(function () { btn.classList.remove("is-copied"); }, 1600);
        });
      }
    });
  });

  /* Footer year */
  var yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Newsletter forms -> Google Sheets, via a Google Apps Script Web App.
     Setup + the script to paste into Apps Script: google-apps-script/Code.gs
     Paste your deployed Web App URL (ends in /exec) below once it's live. */
  var SUBSCRIBE_ENDPOINT = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";

  document.querySelectorAll("[data-newsletter-form]").forEach(function (form) {
    var input = form.querySelector('input[type="email"]');
    var button = form.querySelector('button[type="submit"]');
    var buttonDefaultText = button ? button.textContent : "";

    var status = document.createElement("p");
    status.className = "form-status";
    form.appendChild(status);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = input ? input.value.trim() : "";
      if (!email) return;

      if (SUBSCRIBE_ENDPOINT.indexOf("PASTE_YOUR") === 0) {
        status.textContent = "Subscribe form isn't connected yet — see google-apps-script/Code.gs.";
        status.classList.add("is-error");
        return;
      }

      status.classList.remove("is-error");
      status.textContent = "";
      if (button) { button.disabled = true; button.textContent = "Subscribing…"; }

      var body = new FormData();
      body.append("email", email);
      body.append("source", window.location.pathname);

      fetch(SUBSCRIBE_ENDPOINT, { method: "POST", mode: "no-cors", body: body })
        .then(function () {
          input.value = "";
          status.textContent = "You're subscribed — thanks!";
          if (button) button.textContent = "Subscribed ✓";
          setTimeout(function () {
            if (button) { button.disabled = false; button.textContent = buttonDefaultText; }
          }, 2500);
        })
        .catch(function () {
          status.textContent = "Something went wrong — please try again.";
          status.classList.add("is-error");
          if (button) { button.disabled = false; button.textContent = buttonDefaultText; }
        });
    });
  });
})();
