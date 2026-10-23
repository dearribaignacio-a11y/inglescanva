/* Games: 1) Build your healthy plate  2) True or False? */
(function () {
  "use strict";

  var C = window.CONTENT;
  var G = C.plateGame;
  var QZ = C.quiz;
  var FOOD = "assets/food/";

  // Pictures for each food and drink of the game
  var PICS = {
    apple: "red_apple", banana: "banana", carrot: "carrot", broccoli: "broccoli",
    bread: "bread", pasta: "spaghetti", cheese: "cheese_wedge", milk: "glass_of_milk",
    chicken: "poultry_leg", egg: "egg", chocolate: "chocolate_bar", chips: "french_fries",
    fizzy: "cup_with_straw", juice: "beverage_box"
  };
  // Mixed order on the tray (groups are never shown)
  var TRAY_ORDER = ["apple", "chocolate", "bread", "egg", "broccoli", "milk", "chips", "chicken", "carrot", "pasta", "cheese", "banana"];
  // Where the 5 foods sit on the plate (% of the plate)
  var SLOTS = [[50, 27, 25, -6], [72, 44, 24, 10], [64, 71, 24, -12], [36, 71, 24, 8], [28, 44, 24, -10]];
  var MAX = 5;

  var root, pg, qz, plateHost, coaster, tray, drinksBox, result, checkBtn, againBtn, nextBtn;
  var plate, foodById = {}, drinkById = {};
  var chosen = [null, null, null, null, null];
  var drink = null;
  var open = false;
  var onCloseCb = function () {};
  var qi = 0, score = 0;

  function q(sel, r) { return (r || document).querySelector(sel); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function picHTML(id) {
    if (id === "water") return '<span class="pic-svg">' + Scenes.SVG.glassFull() + "</span>";
    return '<img src="' + FOOD + PICS[id] + '.png" alt="" draggable="false">';
  }

  /* ------------------------------------------------------------
   * Game 1 – Build your healthy plate
   * ------------------------------------------------------------ */
  function buildTray() {
    G.foods.forEach(function (fd) { foodById[fd.id] = fd; });
    G.drinks.forEach(function (dr) { drinkById[dr.id] = dr; });

    TRAY_ORDER.forEach(function (id) {
      var b = el("button", "pg-item", picHTML(id) + '<span class="pg-name"></span>');
      b.setAttribute("data-id", id);
      b.setAttribute("data-kind", "food");
      q(".pg-name", b).textContent = foodById[id].name;
      tray.appendChild(b);
      enableDrag(b);
    });
    G.drinks.forEach(function (dr) {
      var b = el("button", "pg-item pg-drink", picHTML(dr.id) + '<span class="pg-name"></span>');
      b.setAttribute("data-id", dr.id);
      b.setAttribute("data-kind", "drink");
      q(".pg-name", b).textContent = dr.name;
      drinksBox.appendChild(b);
      enableDrag(b);
    });
  }

  function count() { return chosen.filter(Boolean).length; }

  function addFood(id, dragged) {
    if (chosen.indexOf(id) !== -1) return;
    var slot = chosen.indexOf(null);
    if (slot === -1) { Scenes.bump(plate.el); return; }
    chosen[slot] = id;
    var s = SLOTS[slot];
    var b = el("button", "pg-onplate", picHTML(id));
    b.setAttribute("data-id", id);
    b.setAttribute("aria-label", foodById[id].name);
    b.style.left = s[0] + "%";
    b.style.top = s[1] + "%";
    b.style.width = s[2] + "%";
    b.style.setProperty("--r", s[3] + "deg");
    b.addEventListener("click", function () { removeFood(id); });
    plate.el.appendChild(b);
    if (dragged) Scenes.bump(b.firstChild);
    else Scenes.dropIn(b.firstChild, 0);
    changed();
  }

  function removeFood(id) {
    var i = chosen.indexOf(id);
    if (i === -1) return;
    chosen[i] = null;
    var node = q('.pg-onplate[data-id="' + id + '"]', plate.el);
    if (node) node.remove();
    changed();
  }

  function setDrink(id, dragged) {
    if (drink === id) return;
    drink = id;
    var old = q(".pg-ondrink", coaster);
    if (old) old.remove();
    var b = el("button", "pg-ondrink", picHTML(id));
    b.setAttribute("data-id", id);
    b.setAttribute("aria-label", drinkById[id].name);
    b.addEventListener("click", function () { b.remove(); drink = null; changed(); });
    coaster.appendChild(b);
    if (dragged) Scenes.bump(b.firstChild);
    else Scenes.dropIn(b.firstChild, 0);
    changed();
  }

  function changed() {
    TRAY_ORDER.forEach(function (id) {
      q('.pg-item[data-id="' + id + '"]', tray).classList.toggle("is-used", chosen.indexOf(id) !== -1);
    });
    G.drinks.forEach(function (dr) {
      q('.pg-item[data-id="' + dr.id + '"]', drinksBox).classList.toggle("is-used", drink === dr.id);
    });
    tray.classList.toggle("is-full", count() >= MAX);
    checkBtn.disabled = !(count() === MAX && drink);
    clearResult();
  }

  function clearResult() {
    if (!pg.classList.contains("is-checked")) return;
    pg.classList.remove("is-checked", "is-good", "is-bad");
    result.innerHTML = "";
    againBtn.hidden = true;
    checkBtn.hidden = false;
  }

  function check() {
    var groups = {}, sweets = 0;
    chosen.forEach(function (id) {
      if (!id) return;
      var g = foodById[id].group;
      groups[g] = true;
      if (g === "sweets") sweets++;
    });
    var msgs = [];
    if (!groups.veg) msgs.push(G.messages.veg);
    if (!groups.bread) msgs.push(G.messages.bread);
    if (!groups.milk) msgs.push(G.messages.milk);
    if (!groups.meat) msgs.push(G.messages.meat);
    if (drink !== "water") msgs.push(G.messages.water);
    if (sweets > 1) msgs.push(G.messages.sweets);
    var good = msgs.length === 0;
    if (good) msgs = [G.messages.ok];

    result.innerHTML = "";
    msgs.forEach(function (m) {
      var p = el("p", "pg-msg");
      p.textContent = m;
      result.appendChild(p);
    });
    pg.classList.add("is-checked");
    pg.classList.toggle("is-good", good);
    pg.classList.toggle("is-bad", !good);
    checkBtn.hidden = true;
    againBtn.hidden = false;
    againBtn.focus({ preventScroll: true });
    if (good) celebrate();
  }

  function celebrate() {
    var imgs = plate.el.querySelectorAll(".pg-onplate img");
    Array.prototype.forEach.call(imgs, function (im, i) {
      if (!im.animate || Scenes.reduceMotion) return;
      im.animate([{ transform: "translateY(0)" }, { transform: "translateY(-14%) scale(1.06)" }, { transform: "translateY(0)" }],
        { duration: 420, delay: i * 70, easing: "cubic-bezier(.3,0,.3,1)" });
    });
  }

  function resetPlate() {
    chosen = [null, null, null, null, null];
    drink = null;
    Array.prototype.forEach.call(plate.el.querySelectorAll(".pg-onplate"), function (n) { n.remove(); });
    var d = q(".pg-ondrink", coaster);
    if (d) d.remove();
    pg.classList.remove("is-checked", "is-good", "is-bad");
    result.innerHTML = "";
    againBtn.hidden = true;
    checkBtn.hidden = false;
    changed();
  }

  function choose(b, dragged) {
    var id = b.getAttribute("data-id");
    if (b.getAttribute("data-kind") === "drink") setDrink(id, dragged);
    else if (chosen.indexOf(id) !== -1) removeFood(id);
    else addFood(id, dragged);
  }

  /* Drag & drop (works with mouse, touch and pen) */
  function enableDrag(b) {
    var start = null, ghost = null;
    b.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
      try { b.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    b.addEventListener("pointermove", function (e) {
      if (!start || e.pointerId !== start.id) return;
      var dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!ghost && Math.sqrt(dx * dx + dy * dy) > 8) {
        var pic = b.firstChild.getBoundingClientRect();
        ghost = el("div", "drag-ghost", picHTML(b.getAttribute("data-id")));
        ghost.style.width = pic.width + "px";
        ghost.style.height = pic.height + "px";
        ghost.style.left = (pic.left - start.x) + "px";
        ghost.style.top = (pic.top - start.y) + "px";
        document.body.appendChild(ghost);
        b.classList.add("is-dragging");
      }
      if (ghost) ghost.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
    });
    function end(e, cancelled) {
      if (!start) return;
      if (ghost) {
        ghost.remove();
        ghost = null;
        b.classList.remove("is-dragging");
        if (!cancelled && overTable(e.clientX, e.clientY, b.getAttribute("data-kind"))) choose(b, true);
        b.setAttribute("data-skip-click", "1");
      }
      start = null;
    }
    b.addEventListener("pointerup", function (e) { end(e, false); });
    b.addEventListener("pointercancel", function (e) { end(e, true); });
    b.addEventListener("click", function () {
      if (b.getAttribute("data-skip-click")) { b.removeAttribute("data-skip-click"); return; }
      choose(b, false);
    });
  }

  function overTable(x, y, kind) {
    var r = plate.el.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var inPlate = Math.pow(x - cx, 2) + Math.pow(y - cy, 2) <= Math.pow(r.width / 2 * 1.05, 2);
    if (kind === "food") return inPlate;
    var c = coaster.getBoundingClientRect();
    var inCoaster = x >= c.left - 30 && x <= c.right + 30 && y >= c.top - 30 && y <= c.bottom + 30;
    return inPlate || inCoaster;
  }

  /* ------------------------------------------------------------
   * Game 2 – True or False?
   * ------------------------------------------------------------ */
  function startQuiz() {
    qi = 0; score = 0;
    pg.hidden = true;
    qz.hidden = false;
    root.setAttribute("aria-labelledby", "qz-title");
    showQuestion();
    var first = q(".qz-true", qz);
    if (first) first.focus({ preventScroll: true });
  }

  function showQuestion() {
    var item = QZ.questions[qi];
    q("#qz-counter").textContent = QZ.counter.replace("{n}", qi + 1);
    q("#qz-q").textContent = item.text;
    q("#qz-fb-main").textContent = "";
    q("#qz-fb-expl").textContent = "";
    q("#qz-fb-src").textContent = "";
    qz.classList.remove("is-answered", "is-right", "is-wrong", "is-end");
    Array.prototype.forEach.call(qz.querySelectorAll(".qz-btn"), function (b) {
      b.disabled = false;
      b.classList.remove("is-chosen", "is-answer");
    });
    q("#qz-next").hidden = true;
    q("#qz-end").hidden = true;
    var card = q("#qz-card");
    if (card.animate && !Scenes.reduceMotion) {
      card.animate([{ transform: "translateX(60px) rotate(2deg)", opacity: 0 }, { transform: "translateX(0) rotate(-1deg)", opacity: 1 }],
        { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
  }

  function answer(val) {
    if (qz.classList.contains("is-answered")) return;
    var item = QZ.questions[qi];
    var right = val === item.answer;
    if (right) score++;
    qz.classList.add("is-answered", right ? "is-right" : "is-wrong");
    Array.prototype.forEach.call(qz.querySelectorAll(".qz-btn"), function (b) {
      var bv = b.getAttribute("data-answer") === "true";
      b.disabled = true;
      if (bv === val) b.classList.add("is-chosen");
      if (bv === item.answer) b.classList.add("is-answer");
    });
    q("#qz-fb-main").textContent = right ? QZ.correct : (item.answer ? QZ.wrongTrue : QZ.wrongFalse);
    q("#qz-fb-expl").textContent = item.explanation || "";
    q("#qz-fb-src").textContent = item.source;
    if (qi < QZ.questions.length - 1) {
      q("#qz-next").hidden = false;
      q("#qz-next").focus({ preventScroll: true });
    } else {
      q("#qz-score").textContent = QZ.score.replace("{x}", score);
      q("#qz-end").hidden = false;
      qz.classList.add("is-end");
      q("#qz-finish").focus({ preventScroll: true });
    }
  }

  /* ------------------------------------------------------------
   * Open / close
   * ------------------------------------------------------------ */
  function openGame() {
    open = true;
    root.hidden = false;
    document.body.classList.add("game-open");
    qz.hidden = true;
    pg.hidden = false;
    root.setAttribute("aria-labelledby", "pg-title");
    resetPlate();
    root.scrollTop = 0;
    requestAnimationFrame(function () { root.classList.add("is-in"); });
    var t = q("#pg-title");
    t.setAttribute("tabindex", "-1");
    t.focus({ preventScroll: true });
  }

  function closeGame(finished, silent) {
    if (!open) return;
    open = false;
    root.classList.remove("is-in");
    root.hidden = true;
    document.body.classList.remove("game-open");
    if (!silent) onCloseCb(!!finished);
  }

  function init(opts) {
    onCloseCb = (opts && opts.onClose) || onCloseCb;
    root = q("#game");
    pg = q("#pg");
    qz = q("#qz");
    plateHost = q("#pg-plate");
    coaster = q("#pg-coaster");
    tray = q("#pg-tray");
    drinksBox = q("#pg-drinks");
    result = q("#pg-result");
    checkBtn = q("#pg-check");
    againBtn = q("#pg-again");
    nextBtn = q("#pg-next");

    plate = new Scenes.Plate({ bare: true });
    plateHost.appendChild(plate.el);
    buildTray();

    checkBtn.addEventListener("click", check);
    againBtn.addEventListener("click", resetPlate);
    nextBtn.addEventListener("click", startQuiz);
    Array.prototype.forEach.call(qz.querySelectorAll(".qz-btn"), function (b) {
      b.addEventListener("click", function () { answer(b.getAttribute("data-answer") === "true"); });
    });
    q("#qz-next").addEventListener("click", function () { qi++; showQuestion(); q(".qz-true", qz).focus({ preventScroll: true }); });
    q("#qz-finish").addEventListener("click", function () { closeGame(true); });
  }

  window.Game = {
    init: init,
    open: openGame,
    close: closeGame,
    isOpen: function () { return open; }
  };
})();
