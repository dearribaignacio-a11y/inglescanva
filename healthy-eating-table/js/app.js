/* App: stage scaling, navigation, hash, notes, fullscreen, progress, QR, sources window. */
(function () {
  "use strict";

  var C = window.CONTENT;
  var TOTAL = 9;
  var W = 1920, H = 1080;
  var COLORS = ["#3E9E4F", "#D69A2D", "#7A6FBE", "#D9503F", "#9C6B3C", "#D9609B", "#2F80ED", "#3E9E4F", "#D69A2D"];

  var body = document.body;
  var stage = document.getElementById("stage");
  var hint = document.getElementById("hint");
  var notesPanel = document.getElementById("notes-panel");
  var sourcesEl = document.getElementById("sources");
  var scenes = Array.prototype.slice.call(document.querySelectorAll(".scene"));

  var current = 0;
  var mobile = null;
  var scale = 1;
  var hintTimer = null;
  var lastFocus = null;
  var s8demo = null, s8visible = false;

  function q(sel) { return document.querySelector(sel); }

  /* ---------------- Layout mode & scaling ---------------- */
  function isMobile() {
    var w = window.innerWidth, h = window.innerHeight;
    return w <= 760 || h > w;
  }

  function fit() {
    var m = isMobile();
    if (m !== mobile) {
      mobile = m;
      body.classList.toggle("is-mobile", m);
      body.classList.toggle("is-stage", !m);
      document.documentElement.classList.toggle("mode-mobile", m);
      document.documentElement.classList.toggle("mode-stage", !m);
      if (m) {
        hideHint();
        setupObserver();
        scenes.forEach(function (s) { if ("inert" in s) s.inert = false; s.removeAttribute("aria-hidden"); });
        updateSceneDemo();
      } else if (current) {
        go(current, true);
      }
    }
    if (!m) {
      scale = Math.min(window.innerWidth / W, window.innerHeight / H);
      var x = (window.innerWidth - W * scale) / 2;
      var y = (window.innerHeight - H * scale) / 2;
      stage.style.transform = "translate(" + x + "px," + y + "px) scale(" + scale + ")";
    } else {
      stage.style.transform = "";
    }
  }

  /* ---------------- Navigation ---------------- */
  function go(n, instant) {
    n = Math.max(1, Math.min(TOTAL, n | 0));
    if (n === current && !instant) return;
    var prev = current;
    current = n;
    body.setAttribute("data-scene", n);
    scenes.forEach(function (s, i) {
      s.classList.toggle("is-active", i + 1 === n);
      s.classList.toggle("is-past", i + 1 < n);
      s.setAttribute("aria-hidden", i + 1 === n ? "false" : "true");
      if ("inert" in s) s.inert = !mobile && i + 1 !== n;
    });
    if (!mobile) Scenes.enter(n, prev, instant || !prev);
    updateProgress(n);
    renderNotes();
    updateSceneDemo();
    setHash(String(n));
    hideHint();
    scheduleHint(instant || !prev ? 500 : 1150);
  }

  function setHash(h) {
    var url = location.href.split("#")[0] + "#" + h;
    try { history.replaceState(null, "", url); } catch (e) { location.hash = h; }
  }

  function readHash() {
    var h = (location.hash || "").replace("#", "");
    if (h === "game") return "game";
    var n = parseInt(h, 10);
    return n >= 1 && n <= TOTAL ? n : null;
  }

  /* ---------------- Progress (mini plate with 9 portions) ---------------- */
  function buildProgress() {
    var el = document.getElementById("progress");
    var paths = "";
    for (var i = 0; i < TOTAL; i++) {
      var a0 = i * 40, a1 = a0 + 40;
      paths += '<path class="pp" data-i="' + i + '" d="' + wedge(36, a0 + 0.6, a1 - 0.6) + '"/>';
    }
    el.innerHTML = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="url(#pl-rim)"/>' +
      '<circle cx="50" cy="50" r="40" fill="url(#pl-wall)"/>' + paths + "</svg>";
  }
  function wedge(r, a0, a1) {
    function p(a) { var rad = a * Math.PI / 180; return (50 + r * Math.sin(rad)).toFixed(2) + " " + (50 - r * Math.cos(rad)).toFixed(2); }
    return "M50 50L" + p(a0) + "A" + r + " " + r + " 0 0 1 " + p(a1) + "Z";
  }
  function updateProgress(n) {
    var ps = document.querySelectorAll("#progress .pp");
    for (var i = 0; i < ps.length; i++) {
      ps[i].style.fill = i < n ? COLORS[i] : "";
      ps[i].classList.toggle("on", i < n);
    }
  }

  /* ---------------- Speaker notes ---------------- */
  function renderNotes() {
    var lines = (C["s" + current] && C["s" + current].notes) || [];
    notesPanel.innerHTML = "";
    lines.forEach(function (l) {
      var p = document.createElement("p");
      var b = document.createElement("strong");
      b.textContent = l.who + ":";
      p.appendChild(b);
      p.appendChild(document.createTextNode(" " + l.text));
      notesPanel.appendChild(p);
    });
  }
  function toggleNotes(force) {
    var show = typeof force === "boolean" ? force : notesPanel.hidden;
    notesPanel.hidden = !show;
    body.classList.toggle("notes-open", show);
    var b = q('[data-action="notes"]');
    if (b) b.setAttribute("aria-pressed", show ? "true" : "false");
  }

  /* ---------------- Fullscreen ---------------- */
  function toggleFullscreen() {
    var d = document;
    if (!d.fullscreenElement && !d.webkitFullscreenElement) {
      var el = d.documentElement;
      (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el);
    } else {
      (d.exitFullscreen || d.webkitExitFullscreen || function () {}).call(d);
    }
  }

  /* ---------------- Controls hide after 3 s without mouse ---------------- */
  var idleTimer = null;
  function wake() {
    body.classList.remove("is-idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { body.classList.add("is-idle"); }, 3000);
  }

  /* ---------------- Hint (hand) ---------------- */
  function hideHint() {
    clearTimeout(hintTimer);
    hint.classList.remove("is-on");
  }
  function scheduleHint(ms) {
    clearTimeout(hintTimer);
    hintTimer = setTimeout(showHint, ms);
  }
  function showHint() {
    if (mobile || Game.isOpen() || !sourcesEl.hidden) return;
    var t = Scenes.hintTarget(current);
    if (!t) { hint.classList.remove("is-on"); return; }
    var sr = stage.getBoundingClientRect();
    var r = t.getBoundingClientRect();
    var x = (r.left + r.width * 0.5 - sr.left) / scale;
    var y = (r.top + r.height * 0.5 - sr.top) / scale;
    hint.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px)";
    hint.classList.add("is-on");
  }

  /* ---------------- QR ---------------- */
  function buildQR() {
    var box = document.getElementById("qr");
    if (!box || typeof qrcode !== "function") return;
    var url = location.href.split("#")[0] + "#game";
    var qr = qrcode(0, "M");
    qr.addData(url);
    qr.make();
    var n = qr.getModuleCount(), d = "";
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (qr.isDark(r, c)) d += "M" + c + " " + r + "h1v1h-1z";
      }
    }
    box.innerHTML = '<svg viewBox="-4 -4 ' + (n + 8) + " " + (n + 8) + '" shape-rendering="crispEdges"><rect x="-4" y="-4" width="' + (n + 8) + '" height="' + (n + 8) + '" fill="#fff"/><path d="' + d + '" fill="#163B2C"/></svg>';
  }

  /* ---------------- Sources window ---------------- */
  function buildSources() {
    var ul = document.getElementById("sources-list");
    C.sourcesWindow.list.forEach(function (s) {
      var li = document.createElement("li");
      var t = document.createElement("span");
      t.className = "sources-text";
      t.textContent = s.text;
      li.appendChild(t);
      if (s.url) {
        var a = document.createElement("a");
        a.href = s.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = s.url;
        li.appendChild(document.createTextNode(" "));
        li.appendChild(a);
      }
      ul.appendChild(li);
    });
  }
  function openSources() {
    lastFocus = document.activeElement;
    sourcesEl.hidden = false;
    body.classList.add("sources-open");
    hideHint();
    var b = sourcesEl.querySelector("button");
    if (b) b.focus({ preventScroll: true });
  }
  function closeSources() {
    sourcesEl.hidden = true;
    body.classList.remove("sources-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  /* ---------------- Game hooks ---------------- */
  // Scene 8 plays the "how to play" demo in a loop while it can be seen
  function updateSceneDemo() {
    if (!s8demo) return;
    var on = !Game.isOpen() && (mobile ? s8visible : current === 8);
    if (on) s8demo.play(); else s8demo.stop();
  }
  function startGame() {
    hideHint();
    Game.open();
    updateSceneDemo();
    setHash("game");
  }
  function onGameClosed(finished) {
    updateSceneDemo();
    if (finished) {
      if (mobile) {
        var s9 = document.getElementById("s9");
        s9.scrollIntoView({ behavior: Scenes.reduceMotion ? "auto" : "smooth" });
        Scenes.rain();
        setHash("9");
      } else {
        go(9);
      }
    } else {
      setHash(mobile ? "1" : String(current));
      scheduleHint(400);
    }
  }

  /* ---------------- Keyboard ---------------- */
  function onKey(e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var k = e.key;

    if (!sourcesEl.hidden) {
      if (k === "Escape") { e.preventDefault(); closeSources(); }
      return;
    }
    if (Game.isOpen()) {
      if (k === "Escape" && !mobile) { e.preventDefault(); Game.close(false); }
      // Arrows never change scene while the game is open
      if (k === "ArrowLeft" || k === "ArrowRight" || k === "PageUp" || k === "PageDown") e.preventDefault();
      return;
    }

    if (k === "ArrowRight" || k === "PageDown" || (k === " " && !e.shiftKey) || k === "Spacebar") {
      e.preventDefault();
      if (!mobile) go(current + 1);
    } else if (k === "ArrowLeft" || k === "PageUp" || (k === " " && e.shiftKey)) {
      e.preventDefault();
      if (!mobile) go(current - 1);
    } else if (k === "f" || k === "F") {
      e.preventDefault();
      toggleFullscreen();
    } else if (k === "n" || k === "N") {
      e.preventDefault();
      toggleNotes();
    } else if (k === "Home" && !mobile) {
      e.preventDefault(); go(1);
    } else if (k === "End" && !mobile) {
      e.preventDefault(); go(TOTAL);
    }
  }
  // Space must not "press" a focused button: only navigation
  function onKeyUp(e) {
    if (e.key === " " && !Game.isOpen() && sourcesEl.hidden) e.preventDefault();
  }

  /* ---------------- Swipe ---------------- */
  var touch = null;
  function onTouchStart(e) {
    if (mobile || Game.isOpen() || !sourcesEl.hidden || e.touches.length !== 1) { touch = null; return; }
    touch = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
  }
  function onTouchEnd(e) {
    if (!touch) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - touch.x, dy = t.clientY - touch.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4 && Date.now() - touch.t < 900) {
      go(current + (dx < 0 ? 1 : -1));
    }
    touch = null;
  }

  /* ---------------- Phone layout: follow the scroll ---------------- */
  var observer = null, rained = false;
  function setupObserver() {
    if (observer || !("IntersectionObserver" in window)) return;
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (mobile && !en.isIntersecting && en.target.id === "s8") { s8visible = false; updateSceneDemo(); }
        if (!mobile || !en.isIntersecting) return;
        var n = +en.target.getAttribute("data-scene");
        updateProgress(n);
        if (n === 8) { s8visible = true; updateSceneDemo(); }
        if (n === 9 && !rained && !Game.isOpen()) { rained = true; Scenes.rain(); }
      });
    }, { threshold: 0.45 });
    scenes.forEach(function (s) { observer.observe(s); });
  }

  /* ---------------- Clicks on [data-action] ---------------- */
  function onAction(e) {
    var b = e.target.closest("[data-action]");
    if (!b) return;
    var a = b.getAttribute("data-action");
    if (a === "notes") toggleNotes();
    else if (a === "fullscreen") toggleFullscreen();
    else if (a === "start-game") startGame();
    else if (a === "sources") openSources();
    else if (a === "close-sources") closeSources();
    else if (a === "close-game") Game.close(false);
  }

  /* ---------------- Start ---------------- */
  function init() {
    Scenes.init();
    Game.init({ onClose: onGameClosed });
    s8demo = Game.sceneDemo(document.getElementById("s8-demo"), document.getElementById("s8-steps"));
    buildProgress();
    buildQR();
    buildSources();

    fit();
    var h = readHash();
    go(typeof h === "number" ? h : (h === "game" ? 8 : 1), true);
    if (mobile && typeof h === "number" && h > 1) {
      document.getElementById("s" + h).scrollIntoView();
    }
    if (h === "game") startGame();

    Scenes.onInteract(function () { hideHint(); scheduleHint(1300); });

    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("hashchange", function () {
      var hh = readHash();
      if (hh === "game") { if (!Game.isOpen()) startGame(); }
      else if (hh) {
        if (Game.isOpen()) Game.close(false, true);
        if (mobile) document.getElementById("s" + hh).scrollIntoView();
        else go(hh);
      }
    });
    document.addEventListener("click", onAction);
    document.addEventListener("mousemove", wake, { passive: true });
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    sourcesEl.addEventListener("click", function (e) { if (e.target === sourcesEl) closeSources(); });
    wake();

    // Fonts may change measurements: refresh the hint position once they are ready
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { body.classList.add("fonts-ready"); scheduleHint(600); });
    requestAnimationFrame(function () { body.classList.add("is-ready"); });
  }

  init();
})();
