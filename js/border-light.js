/* v3 selector expansion of shared v2b border-light.js.
   Border-only cursor light: one pointermove + rAF writes --mx/--my.
   Each surface gets a .gl-clip (radial proximity mask) wrapping a .gl-light (gradient ring). */
(function () {
  "use strict";

  var SELECTORS = [
    ".btn",
    ".nav-toggle",
    "#site-nav a",
    "#site-nav .menu-btn",
    ".chip",
    ".tag",
    ".badge",
    ".role-pill",
    ".pdemo-flagbtn",
    ".pdemo-quota",
    ".builder-steps button",
    ".pdemo-flag",
    ".pdemo-cycler",
    ".edemo-iconbtn",
    ".edemo-linkbtn",
    ".edemo-badge",
    ".edemo-card",
    ".edemo-panel",
    ".edemo-bubble",
    ".edemo-composer",
    ".edemo-composer input",
    ".edemo-composer textarea",
    ".path-card",
    ".product-card",
    ".builder-demo",
    ".pdemo-stage",
    ".pdemo-gate",
    ".pdemo-bubble",
    ".pdemo-typing",
    ".pdemo-sys",
    ".pdemo-inrow input",
    ".lang-switch select",
    ".choice",
    ".prod-pick",
    ".review-note",
    ".tree",
    ".dropdown",
    ".site-header",
    ".dot",
    ".stage-body",
    ".footer-links a",
    ".btn-sm",
    ".btn-teal",
    ".btn-amber",
    ".btn-gl",
    ".btn-gl-chip",
    ".btn-ghost",
    ".nav-btn",
    ".back-link",
    ".go",
    ".icon-btn",
    ".ghost",
    ".ghost-mini",
    ".ghost-link",
    "button.primary",
    ".btn-discord",
    ".card",
    ".price-card",
    ".plan-card",
    ".char-card",
    ".feat",
    ".feature",
    ".usecase",
    ".flow-step",
    ".cmd-wrap",
    ".tbl-wrap",
    ".highlight-box",
    ".warning-box",
    ".callout",
    ".legal-section",
    ".doc",
    ".server-card",
    ".beta-hero",
    ".beta-banner",
    ".product-row",
    ".card2",
    ".sheet",
    ".rail",
    ".login-wrap",
    "header",
    "body > nav"
  ].join(",");

  var VOID = { INPUT: 1, SELECT: 1, TEXTAREA: 1 };
  var surfaces = [];
  var px = -9999;
  var py = -9999;
  var raf = 0;
  var tracking = false;

  function finePointer() {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }
  function reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function applyFlags() {
    document.documentElement.classList.toggle("no-cursor", !finePointer());
    document.documentElement.classList.toggle("reduce-motion", reduceMotion());
    tracking = finePointer() && !reduceMotion();
    if (!tracking) {
      for (var i = 0; i < surfaces.length; i++) {
        surfaces[i].style.setProperty("--mx", "-9999px");
        surfaces[i].style.setProperty("--my", "-9999px");
      }
    }
  }

  function decorate(el) {
    if (!el || el.nodeType !== 1) return;
    if (el.dataset.gl) return;
    if (el.classList && (el.classList.contains("gl-clip") || el.classList.contains("gl-light"))) return;
    el.dataset.gl = "1";
    var pos = window.getComputedStyle(el).position;
    if (pos === "static") el.classList.add("gl-surface");
    if (VOID[el.tagName]) {
      el.classList.add("gl-self");
      return;
    }
    var clip = document.createElement("span");
    clip.className = "gl-clip";
    clip.setAttribute("aria-hidden", "true");
    var light = document.createElement("span");
    light.className = "gl-light";
    clip.appendChild(light);
    el.appendChild(clip);
  }

  function collect() {
    var nodes = document.querySelectorAll(SELECTORS);
    var next = [];
    for (var i = 0; i < nodes.length; i++) {
      decorate(nodes[i]);
      next.push(nodes[i]);
    }
    surfaces = next;
  }

  function tick() {
    raf = 0;
    if (!tracking) return;
    var list = surfaces;
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (px - r.left) + "px");
      el.style.setProperty("--my", (py - r.top) + "px");
    }
  }

  function onMove(e) {
    if (!tracking) return;
    if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    px = e.clientX;
    py = e.clientY;
    if (!raf) raf = requestAnimationFrame(tick);
  }

  document.addEventListener("pointermove", onMove, { passive: true });

  applyFlags();
  collect();

  var fineMq = window.matchMedia("(hover: hover) and (pointer: fine)");
  var motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var onFlag = function () { applyFlags(); };
  if (fineMq.addEventListener) {
    fineMq.addEventListener("change", onFlag);
    motionMq.addEventListener("change", onFlag);
  } else {
    fineMq.addListener(onFlag);
    motionMq.addListener(onFlag);
  }

  var obs = new MutationObserver(function () {
    collect();
    if (tracking && !raf) raf = requestAnimationFrame(tick);
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("resize", function () {
    if (tracking && !raf) raf = requestAnimationFrame(tick);
  }, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", collect);
  }
  window.addEventListener("load", collect);
})();
