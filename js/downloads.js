(function () {
  "use strict";

  var RELEASE_REPOS = ["CarterCanDo/GLP-Server-Panel-Releases", "GettinLowProductions/GLP-Panel"];
  var INSTALLER = "GLP-Server-Panel-Setup.exe";
  var CACHE_KEY = "glpPanelDownloadCache";
  var CACHE_MS = 10 * 60 * 1000;
  var FALLBACK_LATEST = "https://github.com/CarterCanDo/GLP-Server-Panel-Releases/releases/latest";
  var ALL_RELEASES = "https://github.com/CarterCanDo/GLP-Server-Panel-Releases/releases";
  var PAGE_CAP = 10;

  function saneCount(n) {
    return typeof n === "number" && isFinite(n) && n >= 0 && Math.floor(n) === n;
  }

  function formatCount(n) {
    if (!saneCount(n)) return "";
    return n.toLocaleString("en-US");
  }

  function stripV(tag) {
    return String(tag || "").replace(/^v/i, "").trim();
  }

  function readCache() {
    try {
      var data = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (!data || !saneCount(data.total) || typeof data.at !== "number") return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function writeCache(total, version, url) {
    if (!saneCount(total)) return;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        total: total,
        version: version || "",
        url: url || "",
        at: Date.now()
      }));
    } catch (e) {}
  }

  function cacheFresh(data) {
    return !!(data && (Date.now() - data.at) < CACHE_MS);
  }

  function countEl() {
    return document.getElementById("download-count");
  }

  function showFallback() {
    var el = countEl();
    if (!el) return;
    el.textContent = "";
    var link = document.createElement("a");
    link.href = ALL_RELEASES;
    link.textContent = "See downloads on GitHub";
    el.appendChild(link);
  }

  function ensureNumberShell() {
    var el = countEl();
    if (!el) return null;
    var num = el.querySelector(".dl-count-num");
    if (num) return num;
    el.textContent = "";
    num = document.createElement("span");
    num.className = "dl-count-num";
    var unit = document.createElement("span");
    unit.className = "dl-count-unit";
    unit.textContent = " downloads";
    el.appendChild(num);
    el.appendChild(unit);
    return num;
  }

  function paintCount(n, immediate) {
    if (!saneCount(n)) {
      showFallback();
      return;
    }
    var num = ensureNumberShell();
    if (!num) return;
    var text = formatCount(n);
    if (!text || text === "NaN") {
      showFallback();
      return;
    }
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (immediate || reduce) {
      num.textContent = text;
      return;
    }
    var start = performance.now();
    var dur = 800;
    function step(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      var val = Math.round(n * eased);
      if (n >= 1 && val < 1) val = 1;
      num.textContent = formatCount(val);
      if (t < 1) requestAnimationFrame(step);
      else num.textContent = text;
    }
    requestAnimationFrame(step);
  }

  function setVersion(version) {
    var el = document.getElementById("download-version");
    if (!el) return;
    el.textContent = stripV(version);
  }

  function setHref(url) {
    if (!url) return;
    var nodes = document.querySelectorAll("#download-btn, #download-btn-cta");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].href = url;
    }
  }

  function setAllReleases(repo) {
    var link = document.getElementById("all-releases");
    if (!link || !repo) return;
    link.href = "https://github.com/" + repo + "/releases";
  }

  function applyCached(data, immediate) {
    if (!data || !saneCount(data.total)) return;
    paintCount(data.total, immediate);
    if (data.version) setVersion(data.version);
    if (data.url) setHref(data.url);
  }

  function parseNext(linkHeader) {
    if (!linkHeader) return "";
    var parts = String(linkHeader).split(",");
    for (var i = 0; i < parts.length; i++) {
      var match = parts[i].match(/<([^>]+)>;\s*rel="next"/);
      if (match) return match[1];
    }
    return "";
  }

  function fetchResponse(url) {
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (ctrl) ctrl.abort();
    }, 8000);
    return fetch(url, {
      method: "GET",
      credentials: "omit",
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      clearTimeout(timer);
      return res;
    }, function (err) {
      clearTimeout(timer);
      throw err;
    });
  }

  function fetchReleases(repo) {
    var url = "https://api.github.com/repos/" + repo + "/releases?per_page=100";
    var all = [];
    var pages = 0;
    function page(nextUrl) {
      pages += 1;
      if (pages > PAGE_CAP) return Promise.reject(new Error("page cap"));
      return fetchResponse(nextUrl).then(function (res) {
        if (res.status === 404) return all;
        if (res.status === 403 || res.status === 429 || !res.ok) {
          var err = new Error("releases " + res.status);
          err.status = res.status;
          throw err;
        }
        var next = parseNext(res.headers.get("Link"));
        return res.json().then(function (data) {
          if (!Array.isArray(data)) throw new Error("releases shape");
          all = all.concat(data);
          if (next) return page(next);
          return all;
        });
      });
    }
    return page(url);
  }

  function installerTotal(lists) {
    var total = 0;
    for (var i = 0; i < lists.length; i++) {
      var releases = lists[i] || [];
      for (var r = 0; r < releases.length; r++) {
        var assets = releases[r].assets || [];
        for (var a = 0; a < assets.length; a++) {
          if (assets[a].name === INSTALLER && saneCount(assets[a].download_count)) {
            total += assets[a].download_count;
          }
        }
      }
    }
    return total;
  }

  function findLatest() {
    var index = 0;
    function next() {
      if (index >= RELEASE_REPOS.length) return Promise.resolve(null);
      var repo = RELEASE_REPOS[index];
      index += 1;
      var url = "https://api.github.com/repos/" + repo + "/releases/latest";
      return fetchResponse(url).then(function (res) {
        if (!res.ok) return next();
        return res.json().then(function (data) {
          var assets = (data && data.assets) || [];
          for (var i = 0; i < assets.length; i++) {
            if (assets[i].name === INSTALLER && assets[i].browser_download_url) {
              return {
                repo: repo,
                url: assets[i].browser_download_url,
                version: stripV(data.tag_name)
              };
            }
          }
          return next();
        });
      }).catch(function () {
        return next();
      });
    }
    return next();
  }

  function loadCounts() {
    var cached = readCache();
    if (cacheFresh(cached)) {
      applyCached(cached, false);
      return;
    }
    Promise.all([
      Promise.all(RELEASE_REPOS.map(fetchReleases)).then(installerTotal),
      findLatest()
    ]).then(function (parts) {
      var total = parts[0];
      var latest = parts[1];
      if (!saneCount(total)) throw new Error("bad total");
      writeCache(total, latest && latest.version, latest && latest.url);
      paintCount(total, false);
      if (latest) {
        setVersion(latest.version);
        setHref(latest.url);
        setAllReleases(latest.repo);
      }
    }).catch(function () {
      var any = readCache();
      if (any && saneCount(any.total)) {
        applyCached(any, true);
        return;
      }
      showFallback();
      setHref(FALLBACK_LATEST);
    });
  }

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
    });
  }

  if (document.getElementById("download-count") || document.getElementById("download-btn")) {
    loadCounts();
  }
})();
