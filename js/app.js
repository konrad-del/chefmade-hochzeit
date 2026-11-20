/**
 * Chefmade wedding inquiry one-pager.
 *
 * HANDOFF
 * Submit builds a URL to https://chefmade.de/dinings/create and appends:
 *   - gclid, gbraid, wbraid, and utm_* captured from the landing URL
 *   - address (venue) and message — the only form fields /dinings/create
 *     currently prefills from the query string (verified 20 Nov 2026)
 *   - occasion=WD, plus name, email, phone, date_time and adults so they
 *     are ready if Nuventure adds prefill later (they are ignored today)
 *
 * Date, guest count, style, tasting, wishes, extras, and contact details
 * are also folded into `message`, which is the only free-text field that
 * is actually prefilled today.
 *
 * gclid (and the other tracking keys) are written to localStorage on landing
 * under "chefmade_wedding_tracking" so they survive a later navigation or
 * a refresh without the original query string. That storage is origin-bound
 * and does not carry over to chefmade.de; the query string is the handoff.
 *
 * This page never navigates to /dinings/create. Submit opens a dialog
 * with the constructed URL instead, so testing cannot accidentally post.
 */
(function () {
  "use strict";

  var CREATE_URL = "https://chefmade.de/dinings/create";
  var STORAGE_KEY = "chefmade_wedding_tracking";
  var TRACKING_KEYS = [
    "gclid",
    "gbraid",
    "wbraid",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content"
  ];
  var MIN_GUESTS = 20;
  var MAX_GUESTS = 150;

  /* Optional blocks are gated by window.FEATURES (defined in the inline
     head script so they can be hidden before first paint). Flip a flag
     to true once real copy exists. This object is the same reference. */
  var FEATURES = window.FEATURES || {
    reviews: false,
    pricing: false,
    casestudy: false,
    faq: false,
    addons: false,
    email: false,
    langtoggle: false
  };
  window.FEATURES = FEATURES;

  /* Page is English-first. German strings are kept here so DE can be
     restored later. The language toggle is a placeholder only - do not
     wire a real switch until the DE/DA copy is signed off. Hidden via
     FEATURES.langtoggle until then. */
  var I18N = {
    en: {
      locale: "en-GB",
      next: "Continue",
      submit: "Enquire about your wedding",
      guestsSuffix: " guests",
      tastingYes: "Yes, please",
      tastingNo: "No, thank you",
      playReviews: "Play reviews",
      pauseReviews: "Pause reviews",
      extraOne: "1 extra",
      extraMany: "{n} extras",
      handoffDate: "Date",
      handoffVenue: "Venue",
      handoffGuests: "Guests",
      handoffStyle: "Style",
      handoffTasting: "Tasting",
      handoffName: "Name",
      handoffEmail: "Email",
      handoffPhone: "Phone"
    },
    de: {
      locale: "de-DE",
      next: "Weiter",
      submit: "Hochzeit anfragen",
      guestsSuffix: " Gäste",
      tastingYes: "Ja, bitte",
      tastingNo: "Nein, danke",
      playReviews: "Bewertungen abspielen",
      pauseReviews: "Bewertungen pausieren",
      extraOne: "1 Extra",
      extraMany: "{n} Extras",
      handoffDate: "Datum",
      handoffVenue: "Ort",
      handoffGuests: "Gäste",
      handoffStyle: "Stil",
      handoffTasting: "Tasting",
      handoffName: "Name",
      handoffEmail: "E-Mail",
      handoffPhone: "Telefon"
    }
  };
  var copy = I18N.en;

  var DEFAULT_GUESTS = 80;

  var state = {
    step: 1,
    date: "",
    location: "",
    guests: DEFAULT_GUESTS,
    style: "",
    wishes: "",
    tasting: "",
    name: "",
    email: "",
    phone: "",
    message: "",
    extras: []
  };

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function captureTracking() {
    var params = new URLSearchParams(window.location.search);
    var stored = {};
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
    } catch (e) {
      stored = {};
    }
    var changed = false;
    TRACKING_KEYS.forEach(function (key) {
      var val = params.get(key);
      if (val) {
        stored[key] = val;
        changed = true;
      }
    });
    if (changed) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      } catch (e) {}
    }
    return stored;
  }

  function trackingFromStorage() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  /**
   * Build the /dinings/create handoff URL.
   * Server-side prefill today: address, message only. Other names are
   * included for a future Nuventure change and are ignored until then.
   */
  function buildHandoffUrl() {
    var url = new URL(CREATE_URL);
    var tracking = Object.assign({}, trackingFromStorage(), captureTracking());
    TRACKING_KEYS.forEach(function (key) {
      if (tracking[key]) url.searchParams.set(key, tracking[key]);
    });
    if (state.location) url.searchParams.set("address", state.location);
    url.searchParams.set("occasion", "WD");
    if (state.name) url.searchParams.set("name", state.name);
    if (state.email) url.searchParams.set("email", state.email);
    if (state.phone) url.searchParams.set("phone", state.phone);
    if (state.date) url.searchParams.set("date_time", state.date);
    if (state.guests) url.searchParams.set("adults", String(state.guests));

    var lines = [];
    lines.push("Wedding enquiry from hochzeit.chefmade.de");
    if (state.date) lines.push("Date: " + state.date);
    if (state.guests) lines.push("Guests: " + state.guests);
    if (state.style) lines.push("Style: " + state.style);
    if (state.tasting) {
      var tastingLabel = state.tasting;
      if (state.tasting === "ja") tastingLabel = "Yes";
      else if (state.tasting === "nein") tastingLabel = "No";
      lines.push("Tasting: " + tastingLabel);
    }
    if (state.wishes) lines.push("Wishes: " + state.wishes);
    if (state.extras.length) lines.push("Extras: " + state.extras.join(", "));
    if (state.name) lines.push("Name: " + state.name);
    if (state.email) lines.push("Email: " + state.email);
    if (state.phone) lines.push("Phone: " + state.phone);
    if (state.message) {
      lines.push("");
      lines.push(state.message);
    }
    url.searchParams.set("message", lines.join("\n"));
    return url.toString();
  }

  function applyGclidToCreateLinks() {
    var tracking = captureTracking();
    qsa("a.js-create-link, a[href*='/dinings/create']").forEach(function (a) {
      try {
        var url = new URL(a.getAttribute("href"), "https://chefmade.de");
        TRACKING_KEYS.forEach(function (key) {
          if (tracking[key]) url.searchParams.set(key, tracking[key]);
        });
        url.searchParams.set("occasion", "WD");
        // Keep path + query; if the href was relative, rebuild against chefmade.de
        if (/^https?:/i.test(a.getAttribute("href")) || a.classList.contains("js-create-link")) {
          a.setAttribute("href", url.toString());
        } else {
          a.setAttribute("href", url.pathname + url.search);
        }
      } catch (e) {}
    });
  }

  function toIsoDate(val) {
    if (!val) return "";
    val = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    var m = val.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (m) {
      var dd = m[1].padStart(2, "0");
      var mm = m[2].padStart(2, "0");
      return m[3] + "-" + mm + "-" + dd;
    }
    return val;
  }

  function formatDate(val) {
    var iso = toIsoDate(val);
    if (!iso) return "";
    var parts = iso.split("-");
    if (parts.length !== 3 || !/^\d{4}$/.test(parts[0])) return val;
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    try {
      return new Intl.DateTimeFormat(copy.locale, {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(d);
    } catch (e) {
      return iso;
    }
  }

  function tastingLabel(val) {
    if (val === "ja") return copy.tastingYes;
    if (val === "nein") return copy.tastingNo;
    return "";
  }

  function setGuests(n, source) {
    n = Math.max(MIN_GUESTS, Math.min(MAX_GUESTS, n));
    state.guests = n;
    qsa("#guests-value, #hero-guests-value").forEach(function (el) {
      el.textContent = String(n);
    });
    var hidden = qs("#guests");
    if (hidden) hidden.value = String(n);
    qsa("#guests-dec, #hero-guests-dec").forEach(function (btn) {
      btn.disabled = n <= MIN_GUESTS;
    });
    qsa("#guests-inc, #hero-guests-inc").forEach(function (btn) {
      btn.disabled = n >= MAX_GUESTS;
    });
    if (source !== "silent") renderPreview();
  }

  function renderPreview() {
    var hasAny = !!(state.date || state.location || state.style || state.tasting || state.guests);
    var empty = qs("#preview-empty");
    var rows = qs("#preview-rows");
    if (!empty || !rows) return;
    // Always show rows once the user has started; guests have a default so
    // we show the card content after any real field is touched, or always
    // show guests. Cleaner: show rows if date, location, style or tasting
    // is set; otherwise the empty prompt, but still list guests if default
    // feels odd. We'll show rows whenever anything beyond the default guests
    // is set.
    var filled = !!(state.date || state.location || state.style || state.tasting);
    empty.hidden = filled;
    rows.hidden = !filled;
    var dateEl = qs("#pv-date");
    var locEl = qs("#pv-location");
    var guestsEl = qs("#pv-guests");
    var styleEl = qs("#pv-style");
    var tastingEl = qs("#pv-tasting");
    if (dateEl) {
      dateEl.textContent = formatDate(state.date) || "—";
      dateEl.classList.toggle("is-empty", !state.date);
      dateEl.classList.toggle("gold", !!state.date);
    }
    if (locEl) {
      locEl.textContent = state.location || "—";
      locEl.classList.toggle("is-empty", !state.location);
    }
    if (guestsEl) {
      guestsEl.textContent = state.guests + copy.guestsSuffix;
    }
    if (styleEl) {
      styleEl.textContent = state.style || "—";
      styleEl.classList.toggle("is-empty", !state.style);
    }
    if (tastingEl) {
      tastingEl.textContent = tastingLabel(state.tasting) || "—";
      tastingEl.classList.toggle("is-empty", !state.tasting);
    }
    var extrasRow = qs("#pv-extras-row");
    var extrasEl = qs("#pv-extras");
    if (extrasRow && extrasEl) {
      if (FEATURES.addons && state.extras.length) {
        extrasRow.hidden = false;
        extrasEl.textContent = state.extras.join(", ");
        extrasEl.classList.remove("is-empty");
      } else {
        extrasRow.hidden = true;
        extrasEl.textContent = "";
      }
    }
    var filledNow = !!(state.date || state.location || state.style || state.tasting || state.extras.length);
    if (empty && rows) {
      empty.hidden = filledNow;
      rows.hidden = !filledNow;
    }
    syncExtrasUi();
  }

  function setStep(n) {
    state.step = n;
    qsa(".step-panel").forEach(function (panel) {
      var step = Number(panel.getAttribute("data-step"));
      panel.hidden = step !== n;
    });
    qsa(".progress-step").forEach(function (el) {
      var step = Number(el.getAttribute("data-progress"));
      el.classList.toggle("is-active", step === n);
      el.classList.toggle("is-done", step < n);
    });
    var back = qs("#btn-back");
    var next = qs("#btn-next");
    if (back) back.hidden = n === 1;
    if (next) next.textContent = n === 3 ? copy.submit : copy.next;
  }

  function clearErrors(root) {
    qsa(".field.is-invalid", root || document).forEach(function (f) {
      f.classList.remove("is-invalid");
    });
  }

  function markInvalid(name) {
    var field = qs('[data-field="' + name + '"]');
    if (field) field.classList.add("is-invalid");
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function validateStep(n) {
    clearErrors();
    var ok = true;
    if (n === 1) {
      // Prefer the form fields; fall back to hero-b fields.
      var date = (qs("#date") && qs("#date").value.trim()) || (qs("#hero-date") && qs("#hero-date").value.trim()) || state.date;
      var location = (qs("#location") && qs("#location").value.trim()) || (qs("#hero-location") && qs("#hero-location").value.trim()) || state.location;
      state.date = date;
      state.location = location;
      if (!state.date) {
        markInvalid("date");
        ok = false;
      }
      if (!state.location) {
        markInvalid("location");
        ok = false;
      }
      // Hero-b has no data-field wrappers with those names on the hero card.
      if (!ok && qs("#hero-form") && !qs("#date")) {
        /* fields live only in the form below */
      }
      if (!state.date && qs("#hero-date")) qs("#hero-date").style.borderColor = "#b42318";
      if (!state.location && qs("#hero-location")) qs("#hero-location").style.borderColor = "#b42318";
    }
    if (n === 2) {
      if (!state.style) {
        markInvalid("style");
        ok = false;
      }
      if (!state.tasting) {
        markInvalid("tasting");
        ok = false;
      }
    }
    if (n === 3) {
      if (!state.name) {
        markInvalid("name");
        ok = false;
      }
      if (!state.email || !validEmail(state.email)) {
        markInvalid("email");
        ok = false;
      }
      if (!state.phone) {
        markInvalid("phone");
        ok = false;
      }
    }
    return ok;
  }

  function readInputs() {
    var date = qs("#date");
    var location = qs("#location");
    var wishes = qs("#wishes");
    var name = qs("#name");
    var email = qs("#email");
    var phone = qs("#phone");
    var message = qs("#message");
    if (date) state.date = date.value.trim();
    if (location) state.location = location.value.trim();
    if (wishes) state.wishes = wishes.value.trim();
    if (name) state.name = name.value.trim();
    if (email) state.email = email.value.trim();
    if (phone) state.phone = phone.value.trim();
    if (message) state.message = message.value.trim();
    // Hero-b mirrors
    var hd = qs("#hero-date");
    var hl = qs("#hero-location");
    if (hd && hd.value.trim()) state.date = hd.value.trim();
    if (hl && hl.value.trim()) state.location = hl.value.trim();
    renderPreview();
  }

  function syncHeroToForm() {
    var date = qs("#date");
    var location = qs("#location");
    var hd = qs("#hero-date");
    var hl = qs("#hero-location");
    if (hd && date && hd.value) date.value = hd.value;
    if (hl && location && hl.value) location.value = hl.value;
    if (date && hd && date.value && !hd.value) hd.value = date.value;
    if (location && hl && location.value && !hl.value) hl.value = location.value;
  }

  function showHandoffDialog() {
    var url = buildHandoffUrl();
    var summary = qs("#handoff-summary");
    var urlEl = qs("#handoff-url");
    var dialog = qs("#handoff-dialog");
    if (summary) {
      summary.innerHTML =
        "<dt>" + copy.handoffDate + "</dt><dd>" + (formatDate(state.date) || "—") + "</dd>" +
        "<dt>" + copy.handoffVenue + "</dt><dd>" + (state.location || "—") + "</dd>" +
        "<dt>" + copy.handoffGuests + "</dt><dd>" + state.guests + "</dd>" +
        "<dt>" + copy.handoffStyle + "</dt><dd>" + (state.style || "—") + "</dd>" +
        "<dt>" + copy.handoffTasting + "</dt><dd>" + (tastingLabel(state.tasting) || "—") + "</dd>" +
        "<dt>" + copy.handoffName + "</dt><dd>" + (state.name || "—") + "</dd>" +
        "<dt>" + copy.handoffEmail + "</dt><dd>" + (state.email || "—") + "</dd>" +
        "<dt>" + copy.handoffPhone + "</dt><dd>" + (state.phone || "—") + "</dd>";
    }
    if (urlEl) urlEl.textContent = url;
    if (dialog && dialog.showModal) dialog.showModal();
    if (typeof console !== "undefined") {
      console.info("[MOCKUP] Handoff URL (not submitted):", url);
    }
  }

  function bindFaq() {
    qsa(".faq-item button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.parentElement;
        var open = item.classList.contains("is-open");
        qsa(".faq-item").forEach(function (el) {
          el.classList.remove("is-open");
        });
        if (!open) item.classList.add("is-open");
      });
    });
  }

  function applyDemo() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("inkl") === "1") {
      var openFirst = qs(".orbit-core .orbit-item") || qs(".orbit-item");
      if (openFirst) {
        openFirst.setAttribute("aria-expanded", "true");
        openFirst.classList.add("is-open");
      }
    }
    if (params.get("extras") === "1" && FEATURES.addons) {
      state.extras = ["[Service staff]", "[Wine pairing]"];
      syncExtrasUi();
    }
    if (params.get("demo") !== "1") return;
    state.date = "19.06.2027";
    state.location = "Hamburg";
    state.guests = 80;
    state.style = "Seated dinner";
    state.tasting = "ja";
    state.wishes = "";
    state.name = "Anna & Jonas";
    state.email = "anna@example.com";
    state.phone = "+49 151 0000000";
    var date = qs("#date");
    var locationInput = qs("#location");
    var name = qs("#name");
    var email = qs("#email");
    var phone = qs("#phone");
    if (date) date.value = state.date;
    if (locationInput) locationInput.value = state.location;
    if (name) name.value = state.name;
    if (email) email.value = state.email;
    if (phone) phone.value = state.phone;
    var hd = qs("#hero-date");
    var hl = qs("#hero-location");
    if (hd) hd.value = state.date;
    if (hl) hl.value = state.location;
    setGuests(80, "silent");
    qsa(".chip").forEach(function (chip) {
      chip.classList.toggle("is-selected", chip.getAttribute("data-style") === state.style);
    });
    qsa(".toggle-card").forEach(function (card) {
      var on = card.getAttribute("data-tasting") === state.tasting;
      card.classList.toggle("is-selected", on);
      var input = qs("input", card);
      if (input) input.checked = on;
    });
    if (params.get("extras") === "1" && FEATURES.addons) {
      state.extras = ["[Service staff]", "[Wine pairing]"];
    }
    if (params.get("inkl") === "1") {
      var first = qs(".orbit-core .orbit-item, .inkl-card-include, .orbit-item");
      if (first) {
        first.setAttribute("aria-expanded", "true");
        first.classList.add("is-open");
      }
    }
    var jump = Number(params.get("step") || "2");
    if (jump < 1 || jump > 3) jump = 2;
    setStep(jump);
    renderPreview();
    syncExtrasUi();
    if (params.get("shot") === "form") {
      document.body.classList.add("shot-form");
    }
    if (params.get("shot") !== "form") {
      var form = qs("#anfrage");
      if (form) form.scrollIntoView({ block: "start" });
    }
  }

  function extraLabel(btn) {
    return (btn && (btn.getAttribute("data-extra") || "")).trim();
  }

  function setExtra(label, on) {
    if (!label) return;
    var i = state.extras.indexOf(label);
    if (on && i === -1) state.extras.push(label);
    if (!on && i !== -1) state.extras.splice(i, 1);
    syncExtrasUi();
    renderPreview();
  }

  function toggleExtra(label) {
    setExtra(label, state.extras.indexOf(label) === -1);
  }

  function syncExtrasUi() {
    qsa("[data-extra]").forEach(function (btn) {
      var on = state.extras.indexOf(extraLabel(btn)) !== -1;
      btn.classList.toggle("is-selected", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      var mark = btn.querySelector(".extra-toggle, .inkl-plus");
      if (mark) {
        mark.setAttribute("aria-hidden", "true");
        if (mark.classList.contains("inkl-plus")) {
          if (!mark.getAttribute("data-idle")) mark.setAttribute("data-idle", mark.textContent || "+");
          mark.textContent = on ? "✓" : (mark.getAttribute("data-idle") || "+");
        }
      }
    });
    var list = qs("#extras-list");
    var field = qs("#extras-field");
    if (field) field.hidden = !FEATURES.addons;
    if (list && !list.querySelector("[data-extra]")) {
      // Legacy path: only selected extras are listed, with a remove control.
      if (!state.extras.length) {
        list.innerHTML = "";
      } else {
        list.innerHTML = state.extras.map(function (label) {
          return '<button type="button" class="chip is-selected extras-chip" data-remove-extra="' +
            label.replace(/"/g, "&quot;") + '">' + label + " ×</button>";
        }).join("");
        list.querySelectorAll("[data-remove-extra]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            setExtra(btn.getAttribute("data-remove-extra"), false);
          });
        });
      }
      if (field) field.hidden = !FEATURES.addons || !state.extras.length;
    }
    qsa(".inkl-summary").forEach(function (bar) {
      var n = state.extras.length;
      bar.hidden = n === 0;
      var text = bar.querySelector(".inkl-summary-count");
      if (text) text.textContent = n === 1 ? copy.extraOne : copy.extraMany.replace("{n}", String(n));
    });
  }

  function initReviewsStrip() {
    var root = qs(".reviews-strip");
    if (!root) return;
    var btn = qs(".reviews-toggle", root);
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    function applyReduce() {
      var on = reduce.matches;
      root.classList.toggle("is-reduced", on);
      if (btn) btn.hidden = on;
    }
    applyReduce();
    if (reduce.addEventListener) reduce.addEventListener("change", applyReduce);
    if (new URLSearchParams(window.location.search).get("shot") === "reviews") {
      root.classList.add("is-paused");
      if (btn) {
        btn.setAttribute("aria-pressed", "true");
        btn.setAttribute("aria-label", copy.playReviews);
      }
    }
    if (btn) {
      btn.addEventListener("click", function () {
        var paused = root.classList.toggle("is-paused");
        btn.setAttribute("aria-pressed", paused ? "true" : "false");
        btn.setAttribute("aria-label", paused ? copy.playReviews : copy.pauseReviews);
      });
    }
    var viewport = qs(".reviews-viewport", root);
    if (viewport) {
      viewport.addEventListener("touchstart", function () {
        root.classList.add("is-touching");
      }, { passive: true });
      viewport.addEventListener("touchend", function () {
        window.setTimeout(function () { root.classList.remove("is-touching"); }, 800);
      }, { passive: true });
    }
  }


  function initEditorialRows() {
    var rows = qsa(".ed-row");
    if (!rows.length) return;
    var html = document.documentElement;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var force = html.classList.contains("shot-inkl") || html.classList.contains("shot-full") || html.classList.contains("shot-anim") || reduce;
    if (force || !("IntersectionObserver" in window)) {
      rows.forEach(function (row) { row.classList.add("is-inview"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-inview");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.22, rootMargin: "0px 0px -10% 0px" });
    rows.forEach(function (row) { io.observe(row); });
  }

  function initInklusive() {
    qsa(".orbit-item, .inkl-expand").forEach(function (btn) {
      var group = btn.closest("[data-inkl-group]") || btn.parentElement;
      function open(pin) {
        var already = btn.getAttribute("aria-expanded") === "true";
        qsa(".orbit-item, .inkl-expand", group).forEach(function (other) {
          other.setAttribute("aria-expanded", "false");
          other.classList.remove("is-open");
        });
        if (!already || pin === "hover") {
          btn.setAttribute("aria-expanded", "true");
          btn.classList.add("is-open");
        }
      }
      btn.addEventListener("click", function (e) {
        if (e.target.closest("[data-extra], .extra-add")) return;
        open("click");
      });
      btn.addEventListener("mouseenter", function () {
        if (window.matchMedia("(hover: hover)").matches) open("hover");
      });
    });
    qsa("[data-extra]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleExtra(extraLabel(btn));
      });
    });
  }

  function init() {
    captureTracking();
    applyGclidToCreateLinks();
    bindFaq();
    setGuests(state.guests, "silent");
    setStep(1);
    renderPreview();

    ["#date", "#location", "#wishes", "#name", "#email", "#phone", "#message", "#hero-date", "#hero-location"].forEach(function (sel) {
      var el = qs(sel);
      if (!el) return;
      el.addEventListener("input", function () {
        if (sel === "#hero-date" || sel === "#hero-location") {
          el.style.borderColor = "";
        }
        if (sel === "#hero-date" && qs("#date")) qs("#date").value = el.value;
        if (sel === "#hero-location" && qs("#location")) qs("#location").value = el.value;
        if (sel === "#date" && qs("#hero-date") && !qs("#hero-date").matches(":focus")) {
          qs("#hero-date").value = el.value;
        }
        if (sel === "#location" && qs("#hero-location") && !qs("#hero-location").matches(":focus")) {
          qs("#hero-location").value = el.value;
        }
        var field = el.closest(".field");
        if (field) field.classList.remove("is-invalid");
        readInputs();
      });
    });

    function incDec(sel, delta) {
      var btn = qs(sel);
      if (!btn) return;
      btn.addEventListener("click", function () {
        setGuests(state.guests + delta);
      });
    }
    incDec("#guests-dec", -1);
    incDec("#guests-inc", 1);
    incDec("#hero-guests-dec", -1);
    incDec("#hero-guests-inc", 1);

    qsa(".chip[data-style]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        state.style = chip.getAttribute("data-style") || "";
        qsa(".chip[data-style]").forEach(function (c) {
          c.classList.toggle("is-selected", c === chip);
        });
        var field = chip.closest(".field");
        if (field) field.classList.remove("is-invalid");
        renderPreview();
      });
    });

    qsa(".toggle-card[data-tasting]").forEach(function (card) {
      card.addEventListener("click", function () {
        state.tasting = card.getAttribute("data-tasting") || "";
        qsa(".toggle-card[data-tasting]").forEach(function (c) {
          var on = c === card;
          c.classList.toggle("is-selected", on);
          var input = qs("input", c);
          if (input) input.checked = on;
        });
        var field = card.closest(".field");
        if (field) field.classList.remove("is-invalid");
        renderPreview();
      });
    });

    var next = qs("#btn-next");
    if (next) {
      next.addEventListener("click", function () {
        readInputs();
        if (!validateStep(state.step)) return;
        if (state.step < 3) {
          setStep(state.step + 1);
        } else {
          // MOCKUP: do not navigate. Show the constructed handoff URL.
          showHandoffDialog();
        }
      });
    }

    var back = qs("#btn-back");
    if (back) {
      back.addEventListener("click", function () {
        if (state.step > 1) setStep(state.step - 1);
      });
    }

    var form = qs("#wedding-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        readInputs();
        if (!validateStep(3)) {
          setStep(3);
          return;
        }
        showHandoffDialog();
      });
    }

    var close = qs("#handoff-close");
    if (close) {
      close.addEventListener("click", function () {
        var dialog = qs("#handoff-dialog");
        if (dialog && dialog.close) dialog.close();
      });
    }

    var heroNext = qs("#hero-next");
    if (heroNext) {
      heroNext.addEventListener("click", function () {
        syncHeroToForm();
        readInputs();
        if (!validateStep(1)) return;
        setStep(2);
        var target = qs("#anfrage");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    initReviewsStrip();
    initInklusive();
    initEditorialRows();
    applyDemo();
    document.documentElement.setAttribute("data-app-ready", "1");
  }

  function safeInit() {
    try { init(); }
    catch (err) {
      try { document.documentElement.setAttribute("data-app-error", String(err && err.message ? err.message : err)); } catch (e) {}
      if (typeof console !== "undefined") console.error(err);
    }
    if (!document.documentElement.getAttribute("data-app-ready")) {
      document.documentElement.setAttribute("data-app-ready", "0");
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeInit);
  } else {
    safeInit();
  }
})();
