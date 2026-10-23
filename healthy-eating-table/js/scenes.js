/* Scenes: drawings (SVG), the travelling plate and the interactions of every scene. */
(function () {
  "use strict";

  var C = window.CONTENT;
  var FOOD = "assets/food/";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var uid = 0;

  /* ------------------------------------------------------------------
   * Geometry helpers (plate drawings use a 0–100 viewBox, angles in
   * degrees clockwise from 12 o'clock)
   * ------------------------------------------------------------------ */
  function pt(r, a) {
    var rad = a * Math.PI / 180;
    return [50 + r * Math.sin(rad), 50 - r * Math.cos(rad)];
  }
  function f(n) { return Math.round(n * 100) / 100; }
  function wedge(r, a0, a1) {
    var p0 = pt(r, a0), p1 = pt(r, a1);
    return "M50 50L" + f(p0[0]) + " " + f(p0[1]) + "A" + r + " " + r + " 0 " + (a1 - a0 > 180 ? 1 : 0) + " 1 " + f(p1[0]) + " " + f(p1[1]) + "Z";
  }
  function line(a, r0, r1) {
    var p0 = pt(r0, a), p1 = pt(r1, a);
    return "M" + f(p0[0]) + " " + f(p0[1]) + "L" + f(p1[0]) + " " + f(p1[1]);
  }

  /* ------------------------------------------------------------------
   * SVG drawings
   * ------------------------------------------------------------------ */
  var SVG = {
    plate: function () {
      return '<svg class="plate-whole" viewBox="0 0 100 100" aria-hidden="true">' +
        '<circle cx="50" cy="50" r="49.6" fill="url(#pl-rim)"/>' +
        '<circle cx="50" cy="50" r="49.3" fill="none" stroke="rgba(70,70,50,.12)" stroke-width=".45"/>' +
        '<circle cx="50" cy="50" r="37.4" fill="url(#pl-wall)"/>' +
        '<circle cx="50" cy="50" r="35.2" fill="url(#pl-floor)"/>' +
        '<path d="M13 33A40 40 0 0 1 33 12.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".95" filter="url(#soft-blur)"/>' +
        '<path d="M67.5 86.5A40 40 0 0 0 86 68" fill="none" stroke="rgba(120,115,100,.10)" stroke-width="1.6" stroke-linecap="round" filter="url(#soft-blur)"/>' +
        "</svg>";
    },
    wedge: function (a0, a1) {
      return '<svg class="wedge" viewBox="0 0 100 100" aria-hidden="true">' +
        '<path d="' + wedge(49.6, a0, a1) + '" fill="url(#pl-rim)"/>' +
        '<path d="' + wedge(37.4, a0, a1) + '" fill="url(#pl-wall)"/>' +
        '<path d="' + wedge(35.2, a0, a1) + '" fill="url(#pl-floor)"/>' +
        '<path d="' + line(a0, 0, 49.6) + line(a1, 0, 49.6) + '" stroke="rgba(70,70,50,.16)" stroke-width=".45" fill="none"/>' +
        '<path class="hit" d="' + wedge(49.6, a0, a1) + '" fill="transparent"/>' +
        "</svg>";
    },
    fork: function () {
      return '<svg viewBox="0 0 64 440" aria-hidden="true">' +
        '<path d="M8 6c3 0 5 2 5 5v84c0 3 2 5 4 5s4-2 4-5V11c0-3 2-5 5-5s5 2 5 5v84c0 3 1 5 2 5s2-2 2-5V11c0-3 2-5 5-5s5 2 5 5v84c0 3 2 5 4 5s4-2 4-5V11c0-3 2-5 5-5s5 2 5 5v92c0 22-10 34-20 42-4 3-5 8-5 14v232c0 13-6 25-12 25s-12-12-12-25V164c0-6-1-11-5-14C13 142 3 130 3 108V11c0-3 2-5 5-5z" fill="url(#steel)"/>' +
        '<path d="M26 175c1 70 1 160 1 230" stroke="#fff" stroke-width="3" opacity=".7" stroke-linecap="round" fill="none"/>' +
        "</svg>";
    },
    knife: function () {
      return '<svg viewBox="0 0 64 440" aria-hidden="true">' +
        '<path d="M34 6c16 10 24 40 24 92 0 40-4 66-8 84H26V12c0-5 4-8 8-6z" fill="url(#steel)"/>' +
        '<path d="M22 182h30c2 0 4 2 4 5v228c0 13-7 21-17 21s-17-8-17-21V187c0-3 0-5 0-5z" fill="url(#steel)"/>' +
        '<path d="M38 20c8 18 11 46 11 80" stroke="#fff" stroke-width="3" opacity=".75" stroke-linecap="round" fill="none"/>' +
        '<path d="M33 200v200" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round" fill="none"/>' +
        "</svg>";
    },
    glassFull: function () {
      var id = "gc" + (++uid);
      return '<svg viewBox="0 0 120 160" aria-hidden="true">' +
        '<clipPath id="' + id + '"><path d="M12 8h96l-9 140c-.5 6-5 10-11 10H32c-6 0-10.5-4-11-10z"/></clipPath>' +
        '<path d="M12 8h96l-9 140c-.5 6-5 10-11 10H32c-6 0-10.5-4-11-10z" fill="rgba(255,255,255,.45)"/>' +
        '<g clip-path="url(#' + id + ')"><rect x="0" y="44" width="120" height="120" fill="url(#water-fill)"/>' +
        '<ellipse cx="60" cy="44" rx="52" ry="5" fill="#A9D0FA"/></g>' +
        '<path d="M12 8h96l-9 140c-.5 6-5 10-11 10H32c-6 0-10.5-4-11-10z" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="3"/>' +
        '<path d="M24 20l6 118" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".75"/>' +
        "</svg>";
    },
    glassEmpty: function (i) {
      var id = "ge" + (++uid);
      return '<svg class="glass8" viewBox="0 0 120 160" aria-hidden="true" style="--i:' + i + '">' +
        '<clipPath id="' + id + '"><path d="M12 8h96l-9 140c-.5 6-5 10-11 10H32c-6 0-10.5-4-11-10z"/></clipPath>' +
        '<path d="M12 8h96l-9 140c-.5 6-5 10-11 10H32c-6 0-10.5-4-11-10z" fill="rgba(255,255,255,.5)"/>' +
        '<g clip-path="url(#' + id + ')"><g class="water-rise"><rect x="0" y="40" width="120" height="124" fill="url(#water-fill)"/>' +
        '<ellipse cx="60" cy="40" rx="52" ry="5" fill="#A9D0FA"/></g></g>' +
        '<path d="M12 8h96l-9 140c-.5 6-5 10-11 10H32c-6 0-10.5-4-11-10z" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="3"/>' +
        '<path d="M24 20l6 118" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>' +
        "</svg>";
    },
    glasses8: function () {
      var s = "";
      for (var i = 0; i < 8; i++) s += SVG.glassEmpty(i);
      return s;
    },
    battery: function () {
      var bars = "";
      for (var i = 0; i < 4; i++) {
        bars += '<rect class="bar" style="--i:' + i + '" x="' + (44 + i * 58) + '" y="44" width="48" height="82" rx="10"/>';
      }
      return '<svg viewBox="0 0 340 170" aria-hidden="true">' +
        '<linearGradient id="bat-case" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D5DBD3"/></linearGradient>' +
        '<rect x="300" y="56" width="26" height="58" rx="9" fill="#AEB8AE"/>' +
        '<rect x="8" y="8" width="300" height="154" rx="36" fill="url(#bat-case)"/>' +
        '<rect x="30" y="30" width="256" height="110" rx="20" fill="#20372B"/>' +
        '<rect class="bar-low" x="44" y="44" width="48" height="82" rx="10"/>' + bars +
        '<path class="bolt" d="M170 34l-34 56h26l-10 46 36-60h-26z" fill="#FFFFFF"/>' +
        '<path d="M30 52c0-12 10-22 22-22h80" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".18" fill="none"/>' +
        "</svg>";
    },
    sprout: function () {
      return '<svg viewBox="0 0 320 300" aria-hidden="true">' +
        '<radialGradient id="soil" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#8A5A36"/><stop offset="1" stop-color="#4E2F1B"/></radialGradient>' +
        '<linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7BC96F"/><stop offset="1" stop-color="#3E9E4F"/></linearGradient>' +
        '<path class="stem" pathLength="1" d="M160 236C160 200 156 170 162 128" stroke="#4FA85B" stroke-width="12" stroke-linecap="round" fill="none"/>' +
        '<g class="leaf leaf-l"><path d="M160 150C130 152 100 136 92 104c34-4 62 12 68 46z" fill="url(#leaf)"/><path d="M158 148c-18-10-36-24-52-38" stroke="#2F7D3E" stroke-width="3" fill="none" opacity=".5"/></g>' +
        '<g class="leaf leaf-r"><path d="M163 130c22-30 56-42 90-30-10 34-50 46-90 30z" fill="url(#leaf)"/><path d="M166 128c26-12 50-20 76-24" stroke="#2F7D3E" stroke-width="3" fill="none" opacity=".5"/></g>' +
        '<g class="leaf leaf-t"><path d="M162 130c-8-22-2-44 16-58 10 22 4 44-16 58z" fill="#6CBF62"/></g>' +
        '<ellipse cx="160" cy="246" rx="128" ry="40" fill="url(#soil)"/>' +
        '<g fill="#3A2213" opacity=".55"><circle cx="110" cy="244" r="4"/><circle cx="200" cy="252" r="5"/><circle cx="236" cy="238" r="3"/><circle cx="84" cy="254" r="3"/><circle cx="150" cy="262" r="3.5"/></g>' +
        '<g fill="#B08560" opacity=".5"><circle cx="128" cy="232" r="3"/><circle cx="214" cy="232" r="2.5"/><circle cx="178" cy="256" r="2.5"/></g>' +
        '<ellipse class="seed" cx="160" cy="236" rx="13" ry="9" fill="#C9A26A"/>' +
        "</svg>";
    },
    heart: function () {
      return '<svg viewBox="0 0 320 290" aria-hidden="true">' +
        '<radialGradient id="heart-g" cx=".32" cy=".25" r=".85"><stop offset="0" stop-color="#F08A72"/><stop offset=".55" stop-color="#D9503F"/><stop offset="1" stop-color="#B53B2C"/></radialGradient>' +
        '<g class="heart-body"><path d="M160 278C110 236 14 178 14 98 14 50 50 14 96 14c28 0 50 14 64 36 14-22 36-36 64-36 46 0 82 36 82 84 0 80-96 138-146 180z" fill="url(#heart-g)"/>' +
        '<ellipse cx="88" cy="70" rx="34" ry="20" transform="rotate(-30 88 70)" fill="#fff" opacity=".28"/>' +
        '<path class="ecg" pathLength="1" d="M36 140h70l18-40 22 86 26-120 20 74h92" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>' +
        "</svg>";
    },
    notebook: function () {
      var lines = "", rings = "";
      for (var y = 92; y < 410; y += 30) {
        lines += '<path d="M44 ' + y + 'h262M334 ' + y + 'h262" stroke="#9DB8D6" stroke-width="2"/>';
      }
      for (var r = 52; r < 420; r += 30) {
        rings += '<rect x="304" y="' + r + '" width="32" height="12" rx="6" fill="#56605B"/><rect x="306" y="' + (r + 2) + '" width="28" height="4" rx="2" fill="#A7B0AB"/>';
      }
      return '<svg viewBox="0 0 640 460" aria-hidden="true">' +
        '<rect x="4" y="10" width="632" height="446" rx="18" fill="#2F5D47"/>' +
        '<rect x="20" y="20" width="294" height="420" rx="8" fill="#FBFAF5"/>' +
        '<rect x="326" y="20" width="294" height="420" rx="8" fill="#FFFFFF"/>' +
        lines +
        '<path d="M92 20v420M374 20v420" stroke="#E7A2A0" stroke-width="2"/>' +
        '<path d="M300 20v420" stroke="rgba(0,0,0,.06)" stroke-width="14"/>' +
        rings +
        "</svg>";
    },
    bowl: function () {
      return '<svg viewBox="0 0 200 200" aria-hidden="true">' +
        '<circle cx="100" cy="100" r="96" fill="url(#wood-bowl)"/>' +
        '<circle cx="100" cy="100" r="91" fill="none" stroke="rgba(255,226,186,.45)" stroke-width="3"/>' +
        '<circle cx="100" cy="100" r="80" fill="url(#wood-bowl-in)"/>' +
        '<path d="M34 92c30-12 92-14 132 4M30 116c40-10 100-8 140 8M44 70c26-8 80-10 112 2M48 140c30-6 76-4 104 6" stroke="rgba(120,70,25,.18)" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<circle cx="100" cy="100" r="80" fill="url(#bowl-shade)"/>' +
        '<path d="M28 76A78 78 0 0 1 76 26" stroke="#F8DDB4" stroke-width="5" stroke-linecap="round" fill="none" opacity=".75"/>' +
        "</svg>";
    },
    miniPlate: function () {
      return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
        '<circle cx="50" cy="50" r="48" fill="url(#pl-rim)"/><circle cx="50" cy="50" r="36" fill="url(#pl-floor)"/>' +
        '<path d="' + wedge(30, 180, 360) + '" fill="#3E9E4F"/>' +
        '<path d="' + wedge(30, 0, 90) + '" fill="#D69A2D"/>' +
        '<path d="' + wedge(30, 90, 180) + '" fill="#D9503F"/>' +
        '<path d="M50 20V80M50 50H80" stroke="#fff" stroke-width="3"/>' +
        "</svg>";
    },
    hand: function () {
      return '<svg viewBox="0 0 80 96" aria-hidden="true">' +
        '<path d="M30 8c5 0 9 4 9 9v28l3-1c2-6 11-6 13 0 3-5 11-4 13 2 4-3 11 0 11 6v18c0 16-10 26-26 26H45C35 96 28 90 22 81L8 59c-3-5 0-10 4-11 4-2 8 0 11 3l3 4V17c0-5 4-9 9-9z" fill="#FFFFFF" stroke="#163B2C" stroke-width="5" stroke-linejoin="round" transform="translate(-4 -4)"/>' +
        "</svg>";
    },
    close: function () {
      return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M11 11l18 18M29 11L11 29" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>';
    },
    notes: function () {
      return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 7h24a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H19l-8 6v-6H8a4 4 0 0 1-4-4V11a4 4 0 0 1 4-4z" fill="currentColor"/><path d="M11 15h18M11 21h12" stroke="#F4F1E8" stroke-width="3" stroke-linecap="round"/></svg>';
    },
    replay: function () {
      return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M30.5 13.5A12 12 0 1 0 32 22" stroke="currentColor" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M33.5 5.5v10h-10z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
    },
    chevLeft: function () {
      return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M24 9L13 20l11 11" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    },
    chevRight: function () {
      return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M16 9l11 11-11 11" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    },
    fullscreen: function () {
      return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 15V8a2 2 0 0 1 2-2h7M25 6h7a2 2 0 0 1 2 2v7M34 25v7a2 2 0 0 1-2 2h-7M15 34H8a2 2 0 0 1-2-2v-7" stroke="currentColor" stroke-width="5" stroke-linecap="round" fill="none"/></svg>';
    }
  };

  var SVG_BY_NAME = {
    "fork": SVG.fork, "knife": SVG.knife, "glass-full": SVG.glassFull, "glasses8": SVG.glasses8,
    "battery": SVG.battery, "sprout": SVG.sprout, "heart": SVG.heart, "notebook": SVG.notebook,
    "bowl": SVG.bowl, "mini-plate": SVG.miniPlate, "hand": SVG.hand, "close": SVG.close,
    "notes": SVG.notes, "fullscreen": SVG.fullscreen, "replay": SVG.replay,
    "chev-left": SVG.chevLeft, "chev-right": SVG.chevRight
  };

  function fillSvgs(root) {
    var nodes = (root || document).querySelectorAll("[data-svg]");
    for (var i = 0; i < nodes.length; i++) {
      var fn = SVG_BY_NAME[nodes[i].getAttribute("data-svg")];
      if (fn && !nodes[i].firstElementChild) nodes[i].innerHTML = fn();
    }
  }

  /* ------------------------------------------------------------------
   * The plate
   * ------------------------------------------------------------------ */
  var ITEMS = {
    leafy: { img: "leafy_green", g: "veg" },
    tomato: { img: "tomato", g: "veg" },
    broccoli: { img: "broccoli", g: "veg" },
    carrot: { img: "carrot", g: "veg" },
    apple: { img: "red_apple", g: "veg" },
    cucumber: { img: "cucumber", g: "veg" },
    pepper: { img: "bell_pepper", g: "veg" },
    bread: { img: "bread", g: "bread" },
    spaghetti: { img: "spaghetti", g: "bread" },
    milk: { img: "glass_of_milk", g: "milk" },
    cheese: { img: "cheese_wedge", g: "milk" },
    chicken: { img: "poultry_leg", g: "meat" },
    egg: { img: "egg", g: "meat" },
    nuts: { img: "peanuts", g: "oils" },
    olive: { img: "olive", g: "oils" },
    candy: { img: "candy", g: "sweets" }
  };

  // Portions of the divided plate (degrees, clockwise from the top)
  var SECTORS = {
    bread: [0, 75], milk: [75, 130], meat: [130, 190],
    oils: [190, 230], veg: [230, 330], sweets: [330, 360]
  };
  var SECTOR_ORDER = ["veg", "bread", "milk", "meat", "oils", "sweets"];

  function polar(a, r, w, rot) {
    var p = pt(r, a);
    return [p[0], p[1], w, rot || 0];
  }

  // Layouts: id -> [x %, y %, width %, rotation deg]
  var LAYOUTS = {
    empty: {},
    meal: {
      leafy: [31, 37, 29, -12],
      tomato: [46, 24, 18, 8],
      broccoli: [27, 61, 28, 10],
      carrot: [44, 74, 24, 32],
      bread: [68, 33, 27, 12],
      cheese: [53, 49, 17, -10],
      chicken: [70, 63, 26, -18],
      egg: [58, 76, 14, 6]
    },
    groups: {
      bread: polar(24, 25, 21, 8),
      spaghetti: polar(58, 28, 19, 0),
      milk: polar(92, 27, 15, 0),
      cheese: polar(116, 23, 15, -8),
      chicken: polar(148, 25, 19, -14),
      egg: polar(174, 25, 12, 6),
      nuts: polar(205, 29, 12, 20),
      olive: polar(214, 16, 11, 0),
      carrot: polar(250, 26, 17, -30),
      broccoli: polar(281, 27, 20, 0),
      apple: polar(311, 26, 16, 0),
      candy: polar(345, 26, 12, -18)
    },
    half: {
      leafy: [27, 35, 30, -12],
      pepper: [43, 22, 18, 10],
      tomato: [41, 38, 17, -6],
      broccoli: [23, 62, 29, 8],
      cucumber: [42, 56, 18, 24],
      carrot: [36, 79, 24, 36]
    }
  };

  function Plate(opts) {
    opts = opts || {};
    var el = document.createElement("div");
    el.className = "plate";
    el.innerHTML = '<div class="plate-shadow"></div>' + SVG.plate();
    this.el = el;
    this.sectors = {};
    this.items = {};
    this.layout = "empty";
    this.isOpen = false;
    this.focused = null;

    if (!opts.bare) {
      for (var i = 0; i < SECTOR_ORDER.length; i++) {
        var g = SECTOR_ORDER[i], a = SECTORS[g];
        var s = document.createElement("div");
        s.className = "sector";
        s.setAttribute("data-g", g);
        s.innerHTML = SVG.wedge(a[0], a[1]);
        var mid = (a[0] + a[1]) / 2;
        var c = pt(28, mid);
        s.style.transformOrigin = f(c[0]) + "% " + f(c[1]) + "%";
        s.style.setProperty("--ox", f(Math.sin(mid * Math.PI / 180) * 9) + "%");
        s.style.setProperty("--oy", f(-Math.cos(mid * Math.PI / 180) * 9) + "%");
        el.appendChild(s);
        this.sectors[g] = s;
      }
      for (var id in ITEMS) {
        var it = document.createElement("div");
        it.className = "food off";
        it.setAttribute("data-id", id);
        it.innerHTML = '<img src="' + FOOD + ITEMS[id].img + '.png" alt="" draggable="false">';
        this.sectors[ITEMS[id].g].appendChild(it);
        this.items[id] = it;
      }
      var hub = document.createElement("span");
      hub.className = "plate-hub";
      el.appendChild(hub);
      this.hub = hub;
    }
  }

  Plate.prototype.setLayout = function (name, mode) {
    var lay = LAYOUTS[name] || {};
    var n = 0;
    for (var id in this.items) {
      var it = this.items[id], p = lay[id];
      if (p) {
        var wasOff = it.classList.contains("off");
        it.style.left = p[0] + "%";
        it.style.top = p[1] + "%";
        it.style.width = p[2] + "%";
        it.style.setProperty("--r", p[3] + "deg");
        if (wasOff) {
          // Jump to the new spot while hidden, then appear there
          it.classList.add("no-move");
          forceReflow(it);
          it.classList.remove("no-move");
          if (mode === "drop" && !reduceMotion) dropIn(it.firstChild, n * 120);
          it.classList.remove("off");
          n++;
        }
      } else {
        it.classList.add("off");
      }
    }
    this.layout = name;
    this.el.setAttribute("data-layout", name);
  };

  Plate.prototype.setSectored = function (on) {
    this.el.classList.toggle("is-sectored", !!on);
    if (!on) this.setOpen(false);
  };

  Plate.prototype.setOpen = function (on) {
    this.isOpen = !!on;
    this.el.classList.toggle("is-open", this.isOpen);
    if (!on) this.setFocus(null);
  };

  Plate.prototype.setFocus = function (g) {
    this.focused = g;
    this.el.classList.toggle("has-focus", !!g);
    for (var k in this.sectors) this.sectors[k].classList.toggle("is-focus", k === g);
  };

  function forceReflow(node) { return node.offsetWidth; }

  // A food falls onto the table/plate: seen from above, it gets smaller as it drops
  function dropIn(img, delay) {
    if (!img.animate) return;
    img.animate([
      { transform: "translate(-14%, -30%) scale(1.75)", opacity: 0, filter: "drop-shadow(30px 46px 22px rgba(30,45,30,.12))" },
      { opacity: 1, offset: 0.35 },
      { transform: "translate(0,0) scale(.94)", offset: 0.72, filter: "drop-shadow(4px 7px 4px rgba(40,45,30,.32))" },
      { transform: "translate(0,0) scale(1.04)", offset: 0.86 },
      { transform: "translate(0,0) scale(1)", opacity: 1, filter: "drop-shadow(4px 7px 4px rgba(40,45,30,.32))" }
    ], { duration: 620, delay: delay, easing: "cubic-bezier(.45,0,.6,1)", fill: "backwards" });
  }

  function shake(node) {
    if (!node.animate || reduceMotion) return;
    node.animate([
      { transform: "rotate(0)" }, { transform: "rotate(-9deg)" }, { transform: "rotate(8deg)" },
      { transform: "rotate(-6deg)" }, { transform: "rotate(4deg)" }, { transform: "rotate(0)" }
    ], { duration: 520, easing: "ease-out" });
  }

  function bump(node) {
    if (!node.animate || reduceMotion) return;
    node.animate([{ transform: "scale(1)" }, { transform: "scale(.94)" }, { transform: "scale(1.03)" }, { transform: "scale(1)" }],
      { duration: 360, easing: "ease-out" });
  }

  /* ------------------------------------------------------------------
   * Text binding: every [data-t="path.to.text"] gets its text from CONTENT
   * ------------------------------------------------------------------ */
  function get(path) {
    var parts = path.split("."), v = C;
    for (var i = 0; i < parts.length; i++) { if (v == null) return ""; v = v[parts[i]]; }
    return v == null ? "" : v;
  }
  function bindTexts(root) {
    var nodes = (root || document).querySelectorAll("[data-t]");
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = get(nodes[i].getAttribute("data-t"));
    var labels = (root || document).querySelectorAll("[data-aria]");
    for (var j = 0; j < labels.length; j++) labels[j].setAttribute("aria-label", get(labels[j].getAttribute("data-aria")));
  }

  /* ------------------------------------------------------------------
   * Scenes
   * ------------------------------------------------------------------ */
  // Where the travelling plate sits in each scene (presentation mode, 1920×1080)
  var HERO = {
    1: { x: 680, y: 640, size: 470 },
    2: { x: 520, y: 620, size: 620, layout: "meal" },
    3: { x: 960, y: 575, size: 590, layout: "groups", sectored: true },
    4: { x: 215, y: 875, size: 290, layout: "meal" },
    5: { x: -420, y: 640, size: 520, layout: "meal" },
    6: { x: 1540, y: 445, size: 370 },
    7: { x: 1820, y: 10, size: 430, layout: "meal" },
    8: { x: 1540, y: 1640, size: 560, layout: "meal" },
    9: { x: 960, y: 560, size: 500, layout: "meal" }
  };
  var HERO_BASE = 700;

  var hero, slotPlates = {}, state = {};
  var current = 0;
  var listeners = { interact: [] };

  function allPlates(slot) {
    var arr = [];
    if (hero) arr.push(hero);
    if (slotPlates[slot]) arr.push(slotPlates[slot]);
    return arr;
  }
  function onPlates(slot, fn) { allPlates(slot).forEach(fn); }
  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function interacted(n) { listeners.interact.forEach(function (fn) { fn(n); }); }

  function placeHero(n, instant) {
    var h = HERO[n];
    var s = h.size / HERO_BASE;
    var box = q("#hero");
    box.classList.toggle("no-anim", !!instant);
    box.style.transform = "translate(" + (h.x - HERO_BASE / 2) + "px," + (h.y - HERO_BASE / 2) + "px) scale(" + f(s) + ")";
    box.classList.toggle("interactive", n === 3);
    box.setAttribute("data-scene", n);
    if (instant) { forceReflow(box); box.classList.remove("no-anim"); }
  }

  /* ---- Scene 1: the plate fills up ---- */
  function fillPlate() {
    if (state.s1filled) { onPlates(1, function (p) { bump(p.el); }); return; }
    state.s1filled = true;
    q("#s1").classList.add("is-done");
    onPlates(1, function (p) { p.setLayout("meal", "drop"); });
    interacted(1);
  }

  /* ---- Scene 2: one note per click ---- */
  function nextNote() {
    var notes = qa("#s2 .paper-note");
    if (state.s2notes >= notes.length) return;
    notes[state.s2notes].classList.add("is-in");
    state.s2notes++;
    q("#s2").setAttribute("data-count", state.s2notes);
    interacted(2);
  }

  /* ---- Scene 3: the plate opens ---- */
  function s3Render() {
    onPlates(3, function (p) { p.setOpen(state.s3open); if (state.s3open) p.setFocus(state.s3focus); });
    var sc = q("#s3");
    sc.classList.toggle("is-open", state.s3open);
    sc.classList.toggle("has-focus", !!state.s3focus);
    qa("#s3 .glabel").forEach(function (b) {
      b.classList.toggle("is-focus", b.getAttribute("data-g") === state.s3focus);
      b.tabIndex = state.s3open ? 0 : -1;
    });
  }
  function s3Click(target) {
    var sector = target.closest && target.closest(".sector");
    var isHub = target.closest && target.closest(".plate-hub");
    if (!state.s3open) {
      state.s3open = true; state.s3focus = null;
    } else if (isHub) {
      state.s3open = false; state.s3focus = null;
    } else if (sector) {
      var g = sector.getAttribute("data-g");
      state.s3focus = state.s3focus === g ? null : g;
    } else {
      return;
    }
    s3Render();
    interacted(3);
  }

  /* ---- Scene 4: battery, sprout, heart ---- */
  function playWhy(btn) {
    btn.classList.remove("is-on");
    forceReflow(btn);
    btn.classList.add("is-on");
    btn.classList.add("was-on");
    interacted(4);
  }

  /* ---- Scene 5: find the problems ---- */
  function find(spot) {
    var img = q(".find > *", spot);
    shake(img);
    spot.classList.add("is-found");
    interacted(5);
  }

  /* ---- Scene 6: did you know? ---- */
  function playFact(btn) {
    var k = btn.getAttribute("data-k");
    var replay = btn.classList.contains("is-on");
    if (k === "half") {
      if (replay) {
        onPlates(6, function (p) { p.setLayout("empty"); });
        setTimeout(function () { onPlates(6, function (p) { p.setLayout("half", "drop"); }); }, 380);
      } else {
        onPlates(6, function (p) { p.setLayout("half", "drop"); });
      }
    } else if (k === "fruit") {
      dropFruits(q(".bowl-fruits", btn));
    }
    btn.classList.remove("is-on");
    forceReflow(btn);
    btn.classList.add("is-on");
    interacted(6);
  }
  var FRUITS = [
    ["red_apple", 30, 38, -10], ["banana", 62, 34, 24], ["strawberry", 44, 64, 8],
    ["carrot", 70, 64, -36], ["tangerine", 38, 50, 0]
  ];
  function dropFruits(box) {
    box.innerHTML = "";
    FRUITS.forEach(function (fr, i) {
      var d = document.createElement("span");
      d.className = "bowl-fruit";
      d.style.left = fr[1] + "%";
      d.style.top = fr[2] + "%";
      d.style.setProperty("--r", fr[3] + "deg");
      d.innerHTML = '<img src="' + FOOD + fr[0] + '.png" alt="" draggable="false">';
      box.appendChild(d);
      if (!reduceMotion) dropIn(d.firstChild, i * 260);
    });
  }

  /* ---- Scene 7: flip cards ---- */
  function flip(card) {
    card.classList.toggle("is-flipped");
    card.classList.add("was-flipped");
    interacted(7);
  }

  /* ---- Scene 9: a short rain of tiny foods ---- */
  var RAIN = ["red_apple", "carrot", "broccoli", "banana", "bread", "cheese_wedge", "egg", "tomato", "strawberry", "glass_of_milk", "peanuts", "leafy_green", "tangerine", "poultry_leg"];
  function rain(box) {
    if (reduceMotion) return;
    box.innerHTML = "";
    var count = 34;
    for (var i = 0; i < count; i++) {
      var im = document.createElement("img");
      im.src = FOOD + RAIN[i % RAIN.length] + ".png";
      im.alt = "";
      im.className = "drop";
      var size = 46 + Math.random() * 46;
      im.style.width = size + "px";
      im.style.left = (Math.random() * 100) + "%";
      box.appendChild(im);
      var rot = (Math.random() * 300 - 150);
      im.animate([
        { transform: "translateY(-140px) rotate(0deg)", opacity: 1 },
        { transform: "translateY(1240px) rotate(" + rot + "deg)", opacity: 1 }
      ], { duration: 1500 + Math.random() * 1100, delay: Math.random() * 900, easing: "cubic-bezier(.35,0,.8,.9)", fill: "both" });
    }
    clearTimeout(rain.t);
    rain.t = setTimeout(function () { box.innerHTML = ""; }, 3400);
  }

  /* ---- Reset a scene when we arrive ---- */
  function resetScene(n) {
    if (n === 1) {
      state.s1filled = false;
      q("#s1").classList.remove("is-done");
      onPlates(1, function (p) { p.setLayout("empty"); });
    } else if (n === 2) {
      state.s2notes = 0;
      q("#s2").setAttribute("data-count", 0);
      qa("#s2 .paper-note").forEach(function (nn) { nn.classList.remove("is-in"); });
    } else if (n === 3) {
      state.s3open = false; state.s3focus = null;
      s3Render();
    } else if (n === 4) {
      qa("#s4 .why").forEach(function (b) { b.classList.remove("is-on", "was-on"); });
    } else if (n === 5) {
      qa("#s5 .find-spot").forEach(function (s) { s.classList.remove("is-found"); });
    } else if (n === 6) {
      qa("#s6 .fact").forEach(function (b) { b.classList.remove("is-on"); });
      q("#s6 .bowl-fruits").innerHTML = "";
      onPlates(6, function (p) { p.setLayout("empty"); });
    } else if (n === 7) {
      qa("#s7 .flip").forEach(function (c) { c.classList.remove("is-flipped", "was-flipped"); });
    }
  }

  /* ---- Called by app.js when a scene becomes active (presentation mode) ---- */
  function enter(n, prev, instant) {
    current = n;
    resetScene(n);
    var h = HERO[n];
    if (n !== 1 && n !== 6) {
      hero.setSectored(!!h.sectored);
      hero.setLayout(h.layout);
    } else if (n === 6) {
      hero.setSectored(false);
    } else {
      hero.setSectored(false);
    }
    placeHero(n, instant);
    if (n === 9) rain(q("#s9 .rain"));
  }

  /* ---- Mobile: every scene is visible in a column ---- */
  function initMobileStates() {
    if (slotPlates[1]) slotPlates[1].setLayout(state.s1filled ? "meal" : "empty");
  }

  /* ------------------------------------------------------------------
   * Hint (hand) target for each scene: the first thing still to touch
   * ------------------------------------------------------------------ */
  function hintTarget(n) {
    switch (n) {
      case 1: return state.s1filled ? null : q("#s1 .plate-hit");
      case 2: var notes = qa("#s2 .paper-note"); return state.s2notes < notes.length ? notes[state.s2notes] : null;
      case 3: return state.s3open ? null : q("#s3 .plate-hit-zone");
      case 4: return qa("#s4 .why").filter(function (b) { return !b.classList.contains("was-on"); }).map(function (b) { return q(".why-visual", b); })[0] || null;
      case 6: return qa("#s6 .fact").filter(function (b) { return !b.classList.contains("is-on"); }).map(function (b) { return q(".fact-visual", b); })[0] || null;
      case 7: return qa("#s7 .flip").filter(function (c) { return !c.classList.contains("was-flipped"); })[0] || null;
      case 8: return q("#s8 .btn-start");
      default: return null;
    }
  }

  /* ------------------------------------------------------------------
   * Init
   * ------------------------------------------------------------------ */
  function init() {
    bindTexts();
    fillSvgs();

    // Travelling plate
    hero = new Plate();
    q("#hero").appendChild(hero.el);
    hero.el.addEventListener("click", function (e) { if (current === 3) s3Click(e.target); });
    // Invisible zone used for the hand hint on scene 3
    var zone = document.createElement("span");
    zone.className = "plate-hit-zone";
    q("#s3").appendChild(zone);

    // One plate per scene for the phone layout
    qa(".plate-slot").forEach(function (slot) {
      var n = +slot.getAttribute("data-slot");
      if (n === 4) return;
      var p = new Plate();
      slot.appendChild(p.el);
      slotPlates[n] = p;
      var h = HERO[n];
      if (h.sectored) p.setSectored(true);
      if (h.layout) p.setLayout(h.layout);
    });
    if (slotPlates[1]) slotPlates[1].el.addEventListener("click", fillPlate);
    if (slotPlates[3]) slotPlates[3].el.addEventListener("click", function (e) { s3Click(e.target); });

    state = { s1filled: false, s2notes: 0, s3open: false, s3focus: null };

    // Scene 1
    q("#s1 .plate-hit").addEventListener("click", fillPlate);
    // Scene 2
    q("#s2 .notes-hit").addEventListener("click", nextNote);
    qa("#s2 .paper-note").forEach(function (nn) { nn.addEventListener("click", nextNote); });
    // Scene 3
    qa("#s3 .glabel").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!state.s3open) return;
        var g = b.getAttribute("data-g");
        state.s3focus = state.s3focus === g ? null : g;
        s3Render();
      });
    });
    q("#s3 .plate-hit-zone").addEventListener("click", function () { s3Click(hero.el); });
    // Scene 4
    qa("#s4 .why").forEach(function (b) { b.addEventListener("click", function () { playWhy(b); }); });
    // Scene 5
    qa("#s5 .find-spot").forEach(function (s) { q(".find", s).addEventListener("click", function () { find(s); }); });
    // Scene 6
    qa("#s6 .fact").forEach(function (b) { b.addEventListener("click", function () { playFact(b); }); });
    // Scene 7
    qa("#s7 .flip").forEach(function (c) { c.addEventListener("click", function () { flip(c); }); });

    s3Render();
  }

  window.Scenes = {
    init: init,
    enter: enter,
    placeHero: placeHero,
    hintTarget: hintTarget,
    rain: function () { rain(q("#s9 .rain")); },
    onInteract: function (fn) { listeners.interact.push(fn); },
    initMobileStates: initMobileStates,
    Plate: Plate,
    SVG: SVG,
    fillSvgs: fillSvgs,
    bindTexts: bindTexts,
    dropIn: dropIn,
    shake: shake,
    bump: bump,
    reduceMotion: reduceMotion,
    FOOD: FOOD,
    get current() { return current; }
  };
})();
