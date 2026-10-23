/* The game: 1) Go shopping  2) Make your lunch  3) Make your snack  4) Result
   + the "how to play" demo (scene 8 loop, intro, and the ↻ button). */
(function () {
  "use strict";

  var C = window.CONTENT;
  var G = C.game;
  var FOOD = "assets/food/";
  var reduce = Scenes.reduceMotion;

  /* ------------------------------------------------------------------
   * Products
   * ------------------------------------------------------------------ */
  var PICS = {
    apple: "red_apple", banana: "banana", orange: "tangerine", strawberries: "strawberry",
    grapes: "grapes", carrot: "carrot", broccoli: "broccoli", tomato: "tomato",
    lettuce: "leafy_green", cucumber: "cucumber", potato: "potato",
    bread: "bread", pasta: "spaghetti", rice: "cooked_rice", oats: "bowl_of_oats", beans: "beans",
    croissant: "croissant", cookies: "cookie", doughnut: "doughnut",
    milk: "glass_of_milk", cheese: "cheese_wedge",
    chicken: "poultry_leg", steak: "cut_of_meat", fish: "fish", egg: "egg",
    pizza: "pizza", hamburger: "hamburger", icecream: "soft_ice_cream",
    chips: "french_fries", chocolate: "chocolate_bar", sweets: "candy", nuts: "peanuts",
    fizzy: "cup_with_straw", juice: "beverage_box"
  };
  var AISLES = ["fruitVeg", "bakery", "dairy", "meatFish", "frozen", "snacks", "drinks"];
  var COLD = { dairy: true, meatFish: true, frozen: true };
  var BY_ID = {};
  G.products.forEach(function (p) { BY_ID[p.id] = p; });

  var MAX_CART = 12;
  // Where foods sit on the plate and on the tray (% of the box): x, y, width, rotation
  var PLATE_SLOTS = [[50, 26, 26, -6], [73, 43, 25, 10], [65, 71, 25, -12], [35, 71, 25, 8], [27, 43, 25, -10]];
  var TRAY_SLOTS = [[28.75, 53.6, 22, -6], [55, 70, 21, 8], [79, 72, 20, -8]];

  function group(id) { return BY_ID[id].group; }
  function isDrink(id) { var g = group(id); return g === "WATER" || g === "SUGARY_DRINK"; }
  function isBad(id) { var g = group(id); return g === "SOMETIMES" || g === "SUGARY_DRINK"; }
  function hasGroup(list, g) { return list.some(function (id) { return group(id) === g; }); }

  function q(sel, r) { return (r || document).querySelector(sel); }
  function qa(sel, r) { return Array.prototype.slice.call((r || document).querySelectorAll(sel)); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* ------------------------------------------------------------------
   * Drawings
   * ------------------------------------------------------------------ */
  function bottleSVG() {
    return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<path d="M42 16h16v7c0 3 3 5 7 9 3 3 4 6 4 10v46c0 5-4 8-8 8H39c-4 0-8-3-8-8V42c0-4 1-7 4-10 4-4 7-6 7-9z" fill="url(#bottle-water)"/>' +
      '<path d="M31 50h38v18H31z" fill="#EAF4FF" opacity=".92"/>' +
      '<path d="M31 50h38" stroke="#2F80ED" stroke-width="2.5"/><path d="M31 68h38" stroke="#2F80ED" stroke-width="2.5"/>' +
      '<path d="M44 59c3-5 9-5 12 0" stroke="#2F80ED" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M31 76c6 3 32 3 38 0M31 84c6 3 32 3 38 0" stroke="rgba(255,255,255,.55)" stroke-width="1.6" fill="none"/>' +
      '<rect x="40.5" y="4" width="19" height="13" rx="3" fill="url(#bottle-cap)"/>' +
      '<path d="M43 7v8M47 7v8M51 7v8M55 7v8" stroke="rgba(255,255,255,.35)" stroke-width="1.4"/>' +
      '<path d="M37 40v44" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>' +
      "</svg>";
  }
  function traySVG() {
    return '<svg class="tray-svg" viewBox="0 0 800 560" aria-hidden="true">' +
      '<rect x="8" y="8" width="784" height="544" rx="64" fill="url(#tray-wood)"/>' +
      '<rect x="20" y="236" width="20" height="88" rx="10" fill="rgba(70,36,10,.5)"/>' +
      '<rect x="760" y="236" width="20" height="88" rx="10" fill="rgba(70,36,10,.5)"/>' +
      '<rect x="52" y="44" width="696" height="472" rx="40" fill="url(#tray-floor)"/>' +
      '<path d="M70 120c160-18 420-22 660-6M70 210c200-14 440-16 660 4M70 330c180-12 460-10 660 2M70 440c220-16 430-14 660 0" stroke="rgba(120,70,25,.16)" stroke-width="3" fill="none"/>' +
      '<rect x="52" y="44" width="696" height="472" rx="40" fill="none" stroke="rgba(80,40,10,.28)" stroke-width="6"/>' +
      '<path d="M20 120A100 100 0 0 1 120 20" stroke="rgba(255,240,215,.55)" stroke-width="8" fill="none" stroke-linecap="round"/>' +
      '<circle cx="242" cy="312" r="146" fill="rgba(60,30,8,.22)"/>' +
      '<svg x="80" y="150" width="300" height="300" viewBox="0 0 100 100">' +
      '<circle cx="50" cy="50" r="49.6" fill="url(#pl-rim)"/><circle cx="50" cy="50" r="37.4" fill="url(#pl-wall)"/><circle cx="50" cy="50" r="35.2" fill="url(#pl-floor)"/>' +
      '<path d="M13 33A40 40 0 0 1 33 12.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".95"/></svg>' +
      "</svg>";
  }
  function picHTML(id) {
    if (id === "water") return '<span class="pic pic-svg">' + bottleSVG() + "</span>";
    return '<img class="pic" src="' + FOOD + PICS[id] + '.png" alt="" draggable="false">';
  }
  function makeTray(host) {
    host.innerHTML = '<div class="tray">' + traySVG() + '<img class="tray-cup" src="' + FOOD + 'hot_beverage.png" alt="" draggable="false"></div>';
    return q(".tray", host);
  }
  function makePlate(host) {
    var p = new Scenes.Plate({ bare: true });
    host.innerHTML = "";
    host.appendChild(p.el);
    return p.el;
  }

  /* ------------------------------------------------------------------
   * Small animation helpers
   * ------------------------------------------------------------------ */
  function bump(node) { if (node && !reduce) Scenes.bump(node); }
  function shake(node) { if (node && !reduce) Scenes.shake(node); }

  // A product flies along a curve from one element to another (screen coordinates)
  function fly(fromEl, toEl, html, done) {
    var a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    if (reduce || !a.width || !b.width) { if (done) done(); return; }
    var g = el("div", "fly-ghost", html);
    g.style.width = a.width + "px";
    g.style.height = a.height + "px";
    document.body.appendChild(g);
    var s1 = b.width / a.width;
    var x0 = a.left, y0 = a.top;
    var x1 = b.left, y1 = b.top + (b.height - a.height * s1) / 2;
    var cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - Math.max(90, Math.abs(x1 - x0) * 0.22);
    var frames = [];
    for (var i = 0; i <= 12; i++) {
      var t = i / 12, u = 1 - t;
      var x = u * u * x0 + 2 * u * t * cx + t * t * x1;
      var y = u * u * y0 + 2 * u * t * cy + t * t * y1;
      var s = 1 + (s1 - 1) * t;
      frames.push({ transform: "translate(" + x + "px," + y + "px) scale(" + s + ") rotate(" + (Math.sin(t * Math.PI) * 14) + "deg)" });
    }
    var anim = g.animate(frames, { duration: 600, easing: "cubic-bezier(.45,.05,.55,.95)" });
    anim.onfinish = function () { g.remove(); if (done) done(); };
  }

  /* ------------------------------------------------------------------
   * State
   * ------------------------------------------------------------------ */
  var root, open = false, onCloseCb = function () {};
  var state = { stage: "shop", cart: [], lunch: [], snack: [], mode: "lunch", chosen: [], checked: false };
  var shop = {}, meal = {}, result = {};
  var introDemo = null;

  function showStage(name) {
    state.stage = name;
    q("#gs-shop").hidden = name !== "shop";
    q("#gs-meal").hidden = name !== "lunch" && name !== "snack";
    q("#gs-result").hidden = name !== "result";
    root.setAttribute("aria-labelledby", name === "shop" ? "shop-title" : name === "result" ? "result-title" : "meal-title");
    root.scrollTop = 0;
  }

  /* ------------------------------------------------------------------
   * Stage 1 – the supermarket
   * ------------------------------------------------------------------ */
  function buildShop() {
    shop.aisles = q("#aisles");
    shop.cart = q("#cart-items");
    shop.counter = q("#shop-counter");
    shop.checkout = q("#checkout");
    shop.shopper = q("#shopper");
    shop.slots = {};

    AISLES.forEach(function (key) {
      var list = G.products.filter(function (p) { return p.aisle === key; });
      var a = el("section", "aisle" + (COLD[key] ? " is-cold" : ""));
      a.style.setProperty("--cols", Math.ceil(list.length / 2));
      var sign = el("div", "aisle-sign", '<span class="sign-board"></span>');
      q(".sign-board", sign).textContent = G.shop.aisles[key];
      var gondola = el("div", "gondola");
      var shelf = el("div", "shelf");
      list.forEach(function (p) {
        var slot = el("div", "slot");
        var b = el("button", "product", picHTML(p.id));
        b.setAttribute("data-id", p.id);
        b.setAttribute("aria-label", p.name);
        var tag = el("span", "tag");
        tag.textContent = p.name;
        slot.appendChild(b);
        slot.appendChild(tag);
        shelf.appendChild(slot);
        shop.slots[p.id] = slot;
        b.addEventListener("click", function () {
          if (shop.dragged) return;
          if (state.cart.indexOf(p.id) !== -1) removeFromCart(p.id);
          else addToCart(p.id);
        });
      });
      gondola.appendChild(shelf);
      a.appendChild(sign);
      a.appendChild(gondola);
      shop.aisles.appendChild(a);
    });

    // Laptop: walk along the aisle (wheel, drag, arrows)
    shop.aisles.addEventListener("wheel", function (e) {
      if (!document.body.classList.contains("is-stage")) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { shop.aisles.scrollLeft += e.deltaY; e.preventDefault(); }
    }, { passive: false });
    var drag = null;
    shop.aisles.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: shop.aisles.scrollLeft, moved: false };
      shop.dragged = false;
    });
    window.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (Math.abs(dx) > 6) { drag.moved = true; shop.aisles.classList.add("is-dragging"); }
      if (drag.moved) shop.aisles.scrollLeft = drag.left - dx * (shop.aisles.offsetWidth / shop.aisles.getBoundingClientRect().width);
    });
    window.addEventListener("pointerup", function () {
      if (!drag) return;
      shop.dragged = drag.moved;
      drag = null;
      shop.aisles.classList.remove("is-dragging");
      setTimeout(function () { shop.dragged = false; }, 0);
    });
    q(".aisle-prev").addEventListener("click", function () { walk(-1); });
    q(".aisle-next").addEventListener("click", function () { walk(1); });
    shop.aisles.addEventListener("scroll", updateArrows, { passive: true });

    shop.checkout.addEventListener("click", checkout);
  }

  function walk(dir) {
    shop.aisles.scrollBy({ left: dir * shop.aisles.clientWidth * 0.7, behavior: reduce ? "auto" : "smooth" });
  }
  function updateArrows() {
    var a = shop.aisles;
    q(".aisle-prev").classList.toggle("is-off", a.scrollLeft < 10);
    q(".aisle-next").classList.toggle("is-off", a.scrollLeft > a.scrollWidth - a.clientWidth - 10);
  }

  function updateCounter() {
    var n = state.cart.length;
    shop.counter.textContent = G.shop.counter.replace("{n}", n);
    shop.counter.classList.toggle("is-full", n === MAX_CART);
    var wasHidden = shop.checkout.hidden;
    shop.checkout.hidden = n !== MAX_CART;
    if (wasHidden && !shop.checkout.hidden) bump(shop.checkout);
  }

  function addToCart(id) {
    if (state.cart.length >= MAX_CART) {
      shake(q(".shopper-cart"));
      bump(shop.counter);
      return;
    }
    state.cart.push(id);
    var slot = shop.slots[id];
    var mini = el("button", "cart-mini is-landing", picHTML(id));
    mini.setAttribute("data-id", id);
    mini.setAttribute("aria-label", BY_ID[id].name);
    mini.addEventListener("click", function () { removeFromCart(id); });
    shop.cart.appendChild(mini);
    var from = q(".pic", slot);
    slot.classList.add("is-taken");
    updateCounter();
    fly(from, mini, picHTML(id), function () {
      mini.classList.remove("is-landing");
      bump(mini.firstChild);
    });
  }

  function removeFromCart(id) {
    var i = state.cart.indexOf(id);
    if (i === -1) return;
    state.cart.splice(i, 1);
    var mini = q('.cart-mini[data-id="' + id + '"]', shop.cart);
    var slot = shop.slots[id];
    updateCounter();
    if (mini) {
      fly(mini, q(".pic", slot), picHTML(id), function () {
        slot.classList.remove("is-taken");
        bump(q(".pic", slot));
      });
      mini.remove();
    } else {
      slot.classList.remove("is-taken");
    }
  }

  function checkout() {
    if (state.cart.length !== MAX_CART || shop.leaving) return;
    shop.leaving = true;
    var go = function () { shop.leaving = false; startMeal("lunch"); };
    if (reduce || !shop.shopper.animate) { go(); return; }
    shop.shopper.animate([
      { transform: "translateX(0)" },
      { transform: "translateX(-24px)", offset: 0.15 },
      { transform: "translateX(2300px)" }
    ], { duration: 1150, easing: "cubic-bezier(.5,0,.75,0)" }).onfinish = go;
  }

  function enterShop(back) {
    showStage("shop");
    shop.aisles.scrollLeft = 0;
    updateArrows();
    updateCounter();
    if (back && !reduce && shop.shopper.animate) {
      shop.shopper.animate([{ transform: "translateX(-900px)" }, { transform: "translateX(0)" }],
        { duration: 800, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
  }

  function resetShop() {
    state.cart = [];
    shop.cart.innerHTML = "";
    Object.keys(shop.slots).forEach(function (id) { shop.slots[id].classList.remove("is-taken"); });
    updateCounter();
  }

  /* ------------------------------------------------------------------
   * Stages 2 and 3 – lunch and afternoon snack
   * ------------------------------------------------------------------ */
  function buildMeal() {
    meal.section = q("#gs-meal");
    meal.plateHost = q("#meal-plate");
    meal.drinks = q("#meal-drinks");
    meal.trayHost = q("#meal-tray");
    meal.bag = q("#bag-items");
    meal.result = q("#meal-result");
    meal.check = q("#meal-check");
    meal.again = q("#meal-again");
    meal.next = q("#meal-next");
    meal.back = q("#meal-back");
    meal.plate = makePlate(meal.plateHost);
    meal.tray = makeTray(meal.trayHost);
    meal.check.addEventListener("click", checkMeal);
    meal.again.addEventListener("click", function () { clearMeal(); bump(meal.bag); });
    meal.next.addEventListener("click", function () {
      if (state.mode === "lunch") { state.lunch = state.chosen.slice(); startMeal("snack"); }
      else { state.snack = state.chosen.slice(); showResult(); }
    });
    meal.back.addEventListener("click", function () {
      state.lunch = [];
      state.snack = [];
      enterShop(true);
    });
  }

  function cfg() {
    return state.mode === "lunch" ? { t: G.lunch, max: 5 } : { t: G.snack, max: 3 };
  }

  function bagFor(mode) {
    if (mode === "lunch") return state.cart.slice();
    return state.cart.filter(function (id) { return state.lunch.indexOf(id) === -1; });
  }

  // Is it possible to get it right with what is in the bag?
  function feasible(mode, bag) {
    var ok = bag.filter(function (id) { return !isBad(id); });
    if (mode === "lunch") {
      return ok.indexOf("water") !== -1 && hasGroup(ok, "VEG_FRUIT") && hasGroup(ok, "CEREALS") && hasGroup(ok, "MEAT_EGGS") && ok.length >= 5;
    }
    return hasGroup(ok, "DAIRY") && (hasGroup(ok, "VEG_FRUIT") || hasGroup(ok, "CEREALS")) && ok.length >= 3;
  }

  function startMeal(mode) {
    state.mode = mode;
    state.chosen = [];
    state.checked = false;
    var c = cfg();
    meal.section.setAttribute("data-mode", mode);
    meal.section.classList.remove("is-checked", "is-good", "is-bad");
    meal.result.innerHTML = "";
    q("#meal-title").textContent = c.t.title;
    q("#meal-instruction").textContent = c.t.instruction;
    meal.check.textContent = c.t.check;
    meal.again.textContent = c.t.tryAgain;
    meal.next.textContent = c.t.next;
    meal.back.textContent = c.t.back;

    meal.bagIds = bagFor(mode);
    meal.bag.innerHTML = "";
    meal.bag.setAttribute("data-count", meal.bagIds.length);
    meal.bagIds.forEach(function (id) {
      var b = el("button", "bag-item", picHTML(id) + '<span class="bag-name"></span>');
      b.setAttribute("data-id", id);
      q(".bag-name", b).textContent = BY_ID[id].name;
      enableDrag(b);
      meal.bag.appendChild(b);
    });
    clearPlaced();
    showStage(mode);
    updateMeal();
    if (!reduce) {
      qa(".bag-item .pic", meal.bag).forEach(function (p, i) { Scenes.dropIn(p, 120 + i * 45); });
    }
  }

  function placeTarget() {
    return state.mode === "lunch" ? meal.plate : meal.tray;
  }

  function place(id, dragged) {
    if (state.chosen.indexOf(id) !== -1) return;
    var max = cfg().max;
    if (state.chosen.length >= max) { bump(placeTarget()); return; }
    state.chosen.push(id);
    var node = el("button", "placed", picHTML(id));
    node.setAttribute("data-id", id);
    node.setAttribute("aria-label", BY_ID[id].name);
    node.addEventListener("click", function () { unplace(id); });
    if (state.mode === "lunch" && isDrink(id)) {
      node.classList.add("placed-drink");
      meal.drinks.appendChild(node);
    } else {
      var host = placeTarget();
      var slots = state.mode === "lunch" ? PLATE_SLOTS : TRAY_SLOTS;
      var used = qa(".placed", host).map(function (n) { return +n.getAttribute("data-slot"); });
      var si = 0;
      while (used.indexOf(si) !== -1) si++;
      var sl = slots[si];
      node.setAttribute("data-slot", si);
      node.style.left = sl[0] + "%";
      node.style.top = sl[1] + "%";
      node.style.width = sl[2] + "%";
      node.style.setProperty("--r", sl[3] + "deg");
      host.appendChild(node);
    }
    q('.bag-item[data-id="' + id + '"]', meal.bag).classList.add("is-used");
    if (dragged) bump(node.firstChild);
    else if (!reduce) Scenes.dropIn(node.firstChild, 0);
    updateMeal();
  }

  function unplace(id) {
    var i = state.chosen.indexOf(id);
    if (i === -1) return;
    state.chosen.splice(i, 1);
    var node = q('.placed[data-id="' + id + '"]', meal.section);
    if (node) node.remove();
    var tile = q('.bag-item[data-id="' + id + '"]', meal.bag);
    if (tile) { tile.classList.remove("is-used"); bump(q(".pic", tile)); }
    updateMeal();
  }

  function clearPlaced() {
    qa(".placed", meal.section).forEach(function (n) { n.remove(); });
    qa(".bag-item", meal.bag).forEach(function (n) { n.classList.remove("is-used"); });
  }

  function clearMeal() {
    state.chosen = [];
    clearPlaced();
    updateMeal();
  }

  function updateMeal() {
    var c = cfg();
    var full = state.chosen.length === c.max;
    if (state.checked) {
      state.checked = false;
      meal.section.classList.remove("is-checked", "is-good", "is-bad");
      meal.result.innerHTML = "";
    }
    meal.check.hidden = false;
    meal.check.disabled = !full;
    meal.again.hidden = true;
    meal.next.hidden = true;
    meal.back.hidden = feasible(state.mode, meal.bagIds);
    meal.bag.classList.toggle("is-full", full);
  }

  function lunchMessages(list) {
    var m = G.lunch.messages, out = [];
    if (!hasGroup(list, "VEG_FRUIT")) {
      out.push(m.vegFruit);
      if (list.indexOf("potato") !== -1) out.push(m.potato);
    }
    if (!hasGroup(list, "CEREALS")) out.push(m.cereals);
    if (!hasGroup(list, "MEAT_EGGS")) out.push(m.meatEggs);
    if (list.indexOf("water") === -1 && !hasGroup(list, "SUGARY_DRINK")) out.push(m.water);
    if (hasGroup(list, "SUGARY_DRINK")) out.push(m.sugaryDrink);
    if (hasGroup(list, "SOMETIMES")) out.push(m.sometimes);
    return out;
  }
  function snackMessages(list) {
    var m = G.snack.messages, out = [];
    if (!hasGroup(list, "DAIRY")) out.push(m.dairy);
    if (!hasGroup(list, "VEG_FRUIT") && !hasGroup(list, "CEREALS")) out.push(m.vegFruitCereals);
    if (hasGroup(list, "SUGARY_DRINK")) out.push(m.sugaryDrink);
    if (hasGroup(list, "SOMETIMES")) out.push(m.sometimes);
    return out;
  }

  function checkMeal() {
    var c = cfg();
    if (state.chosen.length !== c.max) return;
    var msgs = state.mode === "lunch" ? lunchMessages(state.chosen) : snackMessages(state.chosen);
    var good = msgs.length === 0;
    if (good) msgs = [c.t.ok];
    meal.result.innerHTML = "";
    msgs.forEach(function (txt) {
      var box = el("div", "meal-msg");
      var p = el("p", "label");
      p.textContent = txt;
      var s = el("p", "src");
      s.textContent = c.t.source;
      box.appendChild(p);
      box.appendChild(s);
      meal.result.appendChild(box);
    });
    state.checked = true;
    meal.section.classList.add("is-checked");
    meal.section.classList.toggle("is-good", good);
    meal.section.classList.toggle("is-bad", !good);
    meal.check.hidden = true;
    meal.again.hidden = false;
    meal.next.hidden = !good;
    meal.back.hidden = good || feasible(state.mode, meal.bagIds);
    (good ? meal.next : meal.again).focus({ preventScroll: true });
    if (good) celebrate(placeTarget()); else shake(placeTarget());
  }

  function celebrate(host) {
    if (reduce) return;
    qa(".placed .pic", meal.section).forEach(function (im, i) {
      if (!im.animate) return;
      im.animate([{ transform: "translateY(0)" }, { transform: "translateY(-14%) scale(1.06)" }, { transform: "translateY(0)" }],
        { duration: 420, delay: i * 70, easing: "cubic-bezier(.3,0,.3,1)" });
    });
    var glow = el("span", "good-glow");
    host.appendChild(glow);
    setTimeout(function () { glow.remove(); }, 1100);
  }

  /* Drag from the bag to the plate / tray (mouse, touch and pen) */
  function enableDrag(b) {
    var start = null, ghost = null;
    b.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || b.classList.contains("is-used")) return;
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
      try { b.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    b.addEventListener("pointermove", function (e) {
      if (!start || e.pointerId !== start.id) return;
      var dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!ghost && Math.sqrt(dx * dx + dy * dy) > 8) {
        var r = q(".pic", b).getBoundingClientRect();
        ghost = el("div", "drag-ghost", picHTML(b.getAttribute("data-id")));
        ghost.style.width = r.width + "px";
        ghost.style.height = r.height + "px";
        ghost.style.left = (r.left - start.x) + "px";
        ghost.style.top = (r.top - start.y) + "px";
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
        if (!cancelled && overTable(e.clientX, e.clientY)) place(b.getAttribute("data-id"), true);
        b.setAttribute("data-skip-click", "1");
      }
      start = null;
    }
    b.addEventListener("pointerup", function (e) { end(e, false); });
    b.addEventListener("pointercancel", function (e) { end(e, true); });
    b.addEventListener("click", function () {
      if (b.getAttribute("data-skip-click")) { b.removeAttribute("data-skip-click"); return; }
      var id = b.getAttribute("data-id");
      if (state.chosen.indexOf(id) !== -1) unplace(id);
      else place(id, false);
    });
  }
  function overTable(x, y) {
    var r = q(".meal-table").getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  /* ------------------------------------------------------------------
   * Stage 4 – result
   * ------------------------------------------------------------------ */
  function buildResult() {
    result.plate = makePlate(q("#result-plate"));
    result.tray = makeTray(q("#result-tray"));
    q("#result-finish").addEventListener("click", function () { closeGame(true); });
  }

  function showResult() {
    showStage("result");
    qa(".placed", q("#gs-result")).forEach(function (n) { n.remove(); });
    var pi = 0;
    state.lunch.forEach(function (id) {
      var n = el("span", "placed", picHTML(id));
      if (isDrink(id)) { n.classList.add("placed-drink"); q("#result-drinks").appendChild(n); return; }
      var sl = PLATE_SLOTS[pi++];
      n.style.left = sl[0] + "%"; n.style.top = sl[1] + "%"; n.style.width = sl[2] + "%";
      n.style.setProperty("--r", sl[3] + "deg");
      result.plate.appendChild(n);
    });
    state.snack.forEach(function (id, i) {
      var sl = TRAY_SLOTS[i];
      var n = el("span", "placed", picHTML(id));
      n.style.left = sl[0] + "%"; n.style.top = sl[1] + "%"; n.style.width = sl[2] + "%";
      n.style.setProperty("--r", sl[3] + "deg");
      result.tray.appendChild(n);
    });
    var left = state.cart.filter(function (id) { return state.lunch.indexOf(id) === -1 && state.snack.indexOf(id) === -1; });
    var bag = q("#result-bag");
    bag.innerHTML = "";
    left.forEach(function (id) {
      var t = el("span", "bag-item", picHTML(id) + '<span class="bag-name"></span>');
      q(".bag-name", t).textContent = BY_ID[id].name;
      bag.appendChild(t);
    });
    q("#result-reminder").hidden = !left.some(isBad);
    rain(q("#result-rain"));
    q("#result-finish").focus({ preventScroll: true });
  }

  var RAIN = ["red_apple", "carrot", "broccoli", "banana", "bread", "cheese_wedge", "egg", "tomato", "strawberry", "glass_of_milk", "grapes", "leafy_green", "tangerine", "poultry_leg", "cooked_rice"];
  function rain(box) {
    box.innerHTML = "";
    if (reduce) return;
    for (var i = 0; i < 30; i++) {
      var im = document.createElement("img");
      im.src = FOOD + RAIN[i % RAIN.length] + ".png";
      im.alt = "";
      im.className = "drop";
      im.style.width = (40 + Math.random() * 40) + "px";
      im.style.left = (Math.random() * 100) + "%";
      box.appendChild(im);
      im.animate([
        { transform: "translateY(-140px) rotate(0deg)" },
        { transform: "translateY(1240px) rotate(" + (Math.random() * 300 - 150) + "deg)" }
      ], { duration: 1500 + Math.random() * 1000, delay: Math.random() * 800, easing: "cubic-bezier(.35,0,.8,.9)", fill: "both" });
    }
    clearTimeout(rain.t);
    rain.t = setTimeout(function () { box.innerHTML = ""; }, 3300);
  }

  /* ==================================================================
   * DEMO – how to play (about 15 s), drawn with the real game graphics
   * ================================================================== */
  var DZ_W = 1120;
  var DEMO_SHELF = [["fruitVeg", ["apple", "broccoli", "carrot"]], ["bakery", ["bread", "rice", "pasta"]], ["dairy", ["milk", "cheese"]]];
  var DEMO_CART = ["broccoli", "bread", "milk", "water", "rice", "chicken", "tomato", "banana", "apple", "cheese", "carrot", "egg"];
  var DEMO_LUNCH = ["water", "broccoli", "rice", "chicken", "tomato"];
  var DEMO_SNACK = ["milk", "banana", "bread"];

  function text(path) {
    var v = C;
    path.split(".").forEach(function (k) { v = v[k]; });
    return v;
  }
  function tEl(tag, cls, path) { var e = el(tag, cls); e.textContent = text(path); return e; }

  function Demo(host, opts) {
    opts = opts || {};
    this.host = host;
    this.loop = !!opts.loop;
    this.onStep = opts.onStep || function () {};
    this.token = 0;
    this.running = false;
    this.anims = [];
    host.innerHTML = "";
    this.screen = el("div", "demo-screen" + (reduce ? " is-still" : ""));
    host.appendChild(this.screen);
    this.build();
    var self = this;
    this.fit = function () {
      var w = host.clientWidth;
      if (!w) return;
      var s = w / self.screen.offsetWidth;
      self.screen.style.transform = "scale(" + s + ")";
      if (reduce) host.style.height = Math.ceil(self.screen.offsetHeight * s) + "px";
    };
    if (window.ResizeObserver) new ResizeObserver(this.fit).observe(host);
    window.addEventListener("resize", this.fit);
    this.fit();
    if (reduce) this.showFinal();
  }

  Demo.prototype.build = function () {
    var sc = this.screen;
    // --- frame 1: supermarket
    var f1 = el("div", "df df-shop");
    f1.appendChild(tEl("p", "df-title", "game.shop.title"));
    f1.appendChild(tEl("p", "df-instr", "game.shop.instruction"));
    var counter = el("p", "df-counter");
    f1.appendChild(counter);
    var gondola = el("div", "df-gondola");
    var slots = {};
    DEMO_SHELF.forEach(function (aisle) {
      var grp = el("div", "df-aisle" + (COLD[aisle[0]] ? " is-cold" : ""));
      var sign = el("span", "sign-board");
      sign.textContent = G.shop.aisles[aisle[0]];
      grp.appendChild(sign);
      var row = el("div", "df-row");
      aisle[1].forEach(function (id) {
        var s = el("div", "df-slot", picHTML(id) + '<span class="tag"></span>');
        q(".tag", s).textContent = BY_ID[id].name;
        row.appendChild(s);
        slots[id] = s;
      });
      grp.appendChild(row);
      gondola.appendChild(grp);
    });
    f1.appendChild(gondola);
    var shopper = el("div", "df-shopper", '<img class="shopper-person" src="' + FOOD + 'person_walking.png" alt=""><div class="shopper-cart"><img class="cart-img" src="' + FOOD + 'shopping_cart.png" alt=""><div class="cart-items"></div></div>');
    f1.appendChild(shopper);
    var checkoutBtn = tEl("span", "btn btn-primary df-checkout", "game.shop.checkout");
    f1.appendChild(checkoutBtn);
    // --- frames 2 and 3: lunch and snack
    var f2 = this.mealFrame("lunch", DEMO_CART, DEMO_LUNCH);
    var f3 = this.mealFrame("snack", DEMO_CART.filter(function (id) { return DEMO_LUNCH.indexOf(id) === -1; }), DEMO_SNACK);
    sc.appendChild(f1);
    sc.appendChild(f2.frame);
    sc.appendChild(f3.frame);
    var hand = el("span", "df-hand", Scenes.SVG.hand());
    sc.appendChild(hand);
    this.f = { shop: f1, counter: counter, slots: slots, shopper: shopper, cart: q(".cart-items", shopper), checkout: checkoutBtn, lunch: f2, snack: f3, hand: hand };
  };

  Demo.prototype.mealFrame = function (mode, bagIds, pick) {
    var t = mode === "lunch" ? "game.lunch" : "game.snack";
    var frame = el("div", "df df-meal df-" + mode);
    frame.appendChild(tEl("p", "df-title", t + ".title"));
    frame.appendChild(tEl("p", "df-instr", t + ".instruction"));
    var table = el("div", "df-table");
    var target, drinks = null;
    if (mode === "lunch") {
      var ph = el("div", "df-plate");
      table.appendChild(ph);
      target = makePlate(ph);
      drinks = el("div", "df-drinks");
      table.appendChild(drinks);
    } else {
      var th = el("div", "df-tray");
      table.appendChild(th);
      target = makeTray(th);
    }
    frame.appendChild(table);
    var check = tEl("span", "btn btn-primary df-check", t + ".check");
    frame.appendChild(check);
    var bag = el("div", "bag df-bag");
    var items = el("div", "bag-items");
    var tiles = {};
    bagIds.forEach(function (id) {
      var b = el("span", "bag-item", picHTML(id) + '<span class="bag-name"></span>');
      q(".bag-name", b).textContent = BY_ID[id].name;
      items.appendChild(b);
      tiles[id] = b;
    });
    bag.appendChild(items);
    frame.appendChild(bag);
    // final positions of the picked products (hidden until they land)
    var placed = {}, si = 0;
    pick.forEach(function (id) {
      var n = el("span", "placed df-placed", picHTML(id));
      if (mode === "lunch" && isDrink(id)) {
        n.classList.add("placed-drink");
        drinks.appendChild(n);
      } else {
        var sl = (mode === "lunch" ? PLATE_SLOTS : TRAY_SLOTS)[si++];
        n.style.left = sl[0] + "%"; n.style.top = sl[1] + "%"; n.style.width = sl[2] + "%";
        n.style.setProperty("--r", sl[3] + "deg");
        target.appendChild(n);
      }
      placed[id] = n;
    });
    var flash = el("span", "df-flash");
    target.appendChild(flash);
    return { frame: frame, tiles: tiles, placed: placed, pick: pick, check: check, flash: flash };
  };

  // Centre of an element in demo coordinates (unaffected by the screen scale)
  Demo.prototype.pos = function (node) {
    var a = node.getBoundingClientRect(), s = this.screen.getBoundingClientRect();
    var k = this.screen.offsetWidth / s.width;
    return { x: (a.left + a.width / 2 - s.left) * k, y: (a.top + a.height / 2 - s.top) * k, w: a.width * k, h: a.height * k };
  };

  Demo.prototype.reset = function () {
    var f = this.f;
    f.counter.textContent = G.shop.counter.replace("{n}", 0);
    f.cart.innerHTML = "";
    Object.keys(f.slots).forEach(function (id) { f.slots[id].classList.remove("is-taken"); });
    f.checkout.classList.remove("is-on");
    [f.lunch, f.snack].forEach(function (m) {
      Object.keys(m.placed).forEach(function (id) { m.placed[id].classList.remove("is-on"); });
      Object.keys(m.tiles).forEach(function (id) { m.tiles[id].classList.remove("is-used"); });
      m.check.classList.remove("is-ready", "is-pressed");
      m.flash.classList.remove("is-on");
    });
    f.hand.style.opacity = 0;
    this.frame("shop");
  };

  Demo.prototype.frame = function (name) {
    var f = this.f;
    f.shop.classList.toggle("is-on", name === "shop");
    f.lunch.frame.classList.toggle("is-on", name === "lunch");
    f.snack.frame.classList.toggle("is-on", name === "snack");
    this.onStep(name === "shop" ? 0 : name === "lunch" ? 1 : 2);
  };

  Demo.prototype.anim = function (node, frames, o) {
    var a = node.animate(frames, o);
    this.anims.push(a);
    return a;
  };

  Demo.prototype.wait = function (ms, t) {
    var self = this;
    return new Promise(function (res, rej) {
      setTimeout(function () { if (t !== self.token) rej("stop"); else res(); }, ms);
    });
  };

  Demo.prototype.handTo = function (x, y, ms, t) {
    var from = this.handAt;
    this.anim(this.f.hand, [
      { transform: "translate(" + from.x + "px," + from.y + "px)" },
      { transform: "translate(" + x + "px," + y + "px)" }
    ], { duration: ms, easing: "cubic-bezier(.45,0,.25,1)", fill: "forwards" });
    this.handAt = { x: x, y: y };
    return this.wait(ms, t);
  };

  Demo.prototype.tap = function (t) {
    var at = this.handAt;
    this.anim(this.f.hand, [
      { transform: "translate(" + at.x + "px," + at.y + "px) scale(1)" },
      { transform: "translate(" + at.x + "px," + at.y + "px) scale(.84)" },
      { transform: "translate(" + at.x + "px," + at.y + "px) scale(1)" }
    ], { duration: 260, fill: "forwards" });
    var r = el("span", "df-ripple");
    r.style.left = at.x + "px";
    r.style.top = at.y + "px";
    this.screen.appendChild(r);
    setTimeout(function () { r.remove(); }, 700);
    return this.wait(200, t);
  };

  // A copy of a product travels between two points inside the demo
  Demo.prototype.travel = function (id, a, b, ms, curve) {
    var size0 = a.w;
    var g = el("span", "df-fly", picHTML(id));
    g.style.width = size0 + "px";
    g.style.height = size0 + "px";
    this.screen.appendChild(g);
    var frames = [];
    var cy = Math.min(a.y, b.y) - curve;
    for (var i = 0; i <= 10; i++) {
      var k = i / 10, u = 1 - k;
      var x = u * u * a.x + 2 * u * k * (a.x + b.x) / 2 + k * k * b.x;
      var y = curve ? u * u * a.y + 2 * u * k * cy + k * k * b.y : a.y + (b.y - a.y) * k;
      var s = (size0 + (b.w - size0) * k) / size0;
      frames.push({ transform: "translate(" + (x - size0 / 2) + "px," + (y - size0 / 2) + "px) scale(" + s + ")" });
    }
    var an = this.anim(g, frames, { duration: ms, easing: "cubic-bezier(.45,.05,.55,.95)", fill: "forwards" });
    an.onfinish = function () { g.remove(); };
  };

  Demo.prototype.addMini = function (id) {
    var m = el("span", "cart-mini", picHTML(id));
    this.f.cart.appendChild(m);
    return m;
  };

  Demo.prototype.run = async function (t) {
    var f = this.f;
    f.hand.style.opacity = "";
    this.handAt = { x: 760, y: 600 };
    // 1. Supermarket
    await this.wait(450, t);
    var picks = ["broccoli", "bread", "milk"];
    for (var i = 0; i < picks.length; i++) {
      var id = picks[i];
      var p = this.pos(q(".pic", f.slots[id]));
      await this.handTo(p.x + 14, p.y + 22, 500, t);
      await this.tap(t);
      var mini = this.addMini(id);
      mini.style.opacity = 0;
      var to = this.pos(mini);
      f.slots[id].classList.add("is-taken");
      this.travel(id, p, to, 520, 150);
      f.counter.textContent = G.shop.counter.replace("{n}", i + 1);
      (function (m) { setTimeout(function () { m.style.opacity = ""; }, 520); })(mini);
    }
    await this.wait(420, t);
    for (var n = 3; n < 12; n++) {
      var mm = this.addMini(DEMO_CART[n]);
      this.anim(mm, [{ transform: "scale(.2)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 180, easing: "ease-out" });
      f.counter.textContent = G.shop.counter.replace("{n}", n + 1);
      await this.wait(105, t);
    }
    f.checkout.classList.add("is-on");
    var cp = this.pos(f.checkout);
    await this.handTo(cp.x + 18, cp.y + 16, 520, t);
    await this.tap(t);
    this.anim(f.shopper, [{ transform: "translateX(0)" }, { transform: "translateX(1400px)" }], { duration: 760, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards" });
    await this.wait(700, t);

    // 2. Lunch  3. Snack
    var meals = [["lunch", f.lunch], ["snack", f.snack]];
    for (var mi = 0; mi < meals.length; mi++) {
      var m = meals[mi][1];
      this.frame(meals[mi][0]);
      await this.wait(420, t);
      for (var k = 0; k < m.pick.length; k++) {
        var pid = m.pick[k];
        var tile = m.tiles[pid];
        var a = this.pos(q(".pic", tile));
        var b = this.pos(m.placed[pid]);
        await this.handTo(a.x + 14, a.y + 20, 400, t);
        tile.classList.add("is-used");
        this.travel(pid, a, b, 500, 0);
        this.anim(f.hand, [
          { transform: "translate(" + (a.x + 14) + "px," + (a.y + 20) + "px) scale(.9)" },
          { transform: "translate(" + (b.x + 14) + "px," + (b.y + 20) + "px) scale(.9)" }
        ], { duration: 500, easing: "cubic-bezier(.45,.05,.55,.95)", fill: "forwards" });
        this.handAt = { x: b.x + 14, y: b.y + 20 };
        await this.wait(500, t);
        m.placed[pid].classList.add("is-on");
      }
      m.check.classList.add("is-ready");
      var bp = this.pos(m.check);
      await this.handTo(bp.x + 26, bp.y + 14, 460, t);
      await this.tap(t);
      m.check.classList.add("is-pressed");
      m.flash.classList.remove("is-on");
      void m.flash.offsetWidth;
      m.flash.classList.add("is-on");
      await this.wait(1050, t);
    }
    f.hand.style.opacity = 0;
    if (this.loop) {
      await this.wait(900, t);
      this.start();
    } else {
      this.running = false;
    }
  };

  Demo.prototype.start = function () {
    var t = ++this.token;
    this.running = true;
    this.clearAnims();
    this.reset();
    this.run(t).catch(function () { /* stopped */ });
  };

  Demo.prototype.play = function () {
    if (reduce) { this.showFinal(); return; }
    if (!this.running) this.start();
  };

  Demo.prototype.clearAnims = function () {
    this.anims.forEach(function (a) { try { a.cancel(); } catch (e) { /* ignore */ } });
    this.anims = [];
    qa(".df-fly, .df-ripple", this.screen).forEach(function (n) { n.remove(); });
  };

  Demo.prototype.stop = function () {
    this.token++;
    this.running = false;
    this.clearAnims();
  };

  // Reduced motion: the three steps as still pictures
  Demo.prototype.showFinal = function () {
    var f = this.f, self = this;
    f.counter.textContent = G.shop.counter.replace("{n}", 12);
    f.cart.innerHTML = "";
    DEMO_CART.forEach(function (id) { self.addMini(id); });
    ["broccoli", "bread", "milk"].forEach(function (id) { f.slots[id].classList.add("is-taken"); });
    f.checkout.classList.add("is-on");
    [f.lunch, f.snack].forEach(function (m) {
      m.pick.forEach(function (id) { m.placed[id].classList.add("is-on"); m.tiles[id].classList.add("is-used"); });
      m.check.classList.add("is-ready");
    });
    f.shop.classList.add("is-on");
    f.lunch.frame.classList.add("is-on");
    f.snack.frame.classList.add("is-on");
    f.hand.style.display = "none";
    this.onStep(-1);
  };

  /* ------------------------------------------------------------------
   * Intro / Watch again
   * ------------------------------------------------------------------ */
  function showIntro() {
    q("#intro").hidden = false;
    if (!introDemo) introDemo = new Demo(q("#intro-demo"), { loop: false });
    else introDemo.fit();
    introDemo.stop();
    introDemo.play();
    q("#intro-play").focus({ preventScroll: true });
  }
  function hideIntro() {
    q("#intro").hidden = true;
    if (introDemo) introDemo.stop();
  }

  /* ------------------------------------------------------------------
   * Open / close
   * ------------------------------------------------------------------ */
  function openGame() {
    open = true;
    root.hidden = false;
    document.body.classList.add("game-open");
    state.lunch = [];
    state.snack = [];
    resetShop();
    enterShop(false);
    requestAnimationFrame(function () { root.classList.add("is-in"); updateArrows(); });
    showIntro();
  }

  function closeGame(finished, silent) {
    if (!open) return;
    open = false;
    hideIntro();
    root.classList.remove("is-in");
    root.hidden = true;
    document.body.classList.remove("game-open");
    q("#result-rain").innerHTML = "";
    if (!silent) onCloseCb(!!finished);
  }

  function init(opts) {
    onCloseCb = (opts && opts.onClose) || onCloseCb;
    root = q("#game");
    buildShop();
    buildMeal();
    buildResult();
    q("#intro-skip").addEventListener("click", hideIntro);
    q("#intro-play").addEventListener("click", hideIntro);
    q('[data-action="watch-again"]', root).addEventListener("click", showIntro);
    updateCounter();
  }

  // Scene 8: the demo plays in a loop and the list follows the step
  function sceneDemo(host, steps) {
    var items = steps ? qa(".game-step", steps) : [];
    return new Demo(host, {
      loop: true,
      onStep: function (i) { items.forEach(function (li, k) { li.classList.toggle("is-current", k === i); }); }
    });
  }

  window.Game = {
    init: init,
    open: openGame,
    close: closeGame,
    isOpen: function () { return open; },
    sceneDemo: sceneDemo
  };
})();
