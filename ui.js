/* ============================================================================
   UI LAYER — the per-frame onDraw loop plus every overlay's draw routine and
   its row-builders / tap handlers. Extracted from index.html and loaded via
   <script src="ui.js"> AFTER the game script, so kaboom() is initialised when
   onDraw() registers here, and the game state / helpers / data this code reads
   are already declared (resolved at frame time via the shared global scope).
   ============================================================================ */
/* ============================================================================
   RENDERING — drawn every frame from game state with Kaboom primitives.
   (Swap any drawRect below for drawSprite to drop in pixel-art PNGs.)
   ============================================================================ */
const col = (a, mul = 1) => rgb(a[0] * mul, a[1] * mul, a[2] * mul);
const pulse = () => 0.5 + 0.5 * Math.sin(time() * 4);

// Draw the current moon phase as a disc; `bg` (the backdrop colour behind it)
// is used for the shadow that carves out the crescent/gibbous shape.
function drawMoon(cxp, cyp, R, bg) {
  drawCircle({ pos: vec2(cxp, cyp), radius: R, color: rgb(238, 236, 214) });
  drawCircle({ pos: vec2(cxp - R * 0.32, cyp - R * 0.2), radius: R * 0.13, color: rgb(214, 212, 190) });
  drawCircle({ pos: vec2(cxp + R * 0.28, cyp + R * 0.26), radius: R * 0.17, color: rgb(214, 212, 190) });
  const illum = moonIllum();
  if (illum < 0.985) {
    // shadow disc sits ON the moon at new (illum 0) and slides clear by full
    // (illum 1); it offsets toward the dark side so the lit limb faces correctly.
    const shift = (moonWaxing() ? -1 : 1) * illum * 2 * R;
    drawCircle({ pos: vec2(cxp + shift, cyp), radius: R + 1, color: rgb(bg[0], bg[1], bg[2]) });
  }
}

onDraw(() => {
  const r = room();

  // --- floor + walls (sprite if supplied, else colored placeholder) ---
  // Many rooms share a tile theme (see TILE_THEME); fall back to the room id.
  const theme = TILE_THEME[state.roomId] || state.roomId;
  const floorKey = "floor_" + theme, wallKey = "wall_" + theme;
  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      const isWall = r.grid[y][x] === "#";
      const key = isWall ? wallKey : floorKey;
      const pos = vec2(x * TILE, ORIGIN_Y + y * TILE);
      if (ready(key)) {
        drawSprite({ sprite: key, pos, width: TILE, height: TILE });
      } else {
        const shade = ((x + y) % 2 === 0) ? 1 : 0.92;   // subtle checker
        drawRect({ pos, width: TILE, height: TILE, color: isWall ? col(r.floor, 0.45) : col(r.floor, shade) });
      }
    }
  }

  // --- observatory night sky + the live moon ---
  if (state.roomId === "observatory") {
    const sky = [20, 22, 44];
    drawRect({ pos: vec2(0, ORIGIN_Y), width: CANVAS_W, height: 100, color: rgb(sky[0], sky[1], sky[2]) });
    for (let i = 0; i < 18; i++) {                      // a scatter of stars
      const sx = (i * 73 % CANVAS_W), sy = ORIGIN_Y + (i * 137 % 88) + 6;
      drawCircle({ pos: vec2(sx, sy), radius: 1, color: rgb(220, 225, 255), opacity: 0.6 });
    }
    drawMoon(CANVAS_W / 2, ORIGIN_Y + 46, 28, sky);
    drawText({ text: moonPhase().name, pos: vec2(CANVAS_W / 2, ORIGIN_Y + 86), size: 10,
               color: rgb(220, 220, 245), anchor: "center" });
  }

  // --- doors (walkable; labelled with destination) ---
  for (const d of r.doors) {
    const pos = vec2(d.gx * TILE, ORIGIN_Y + d.gy * TILE);
    if (ready("door")) {
      drawSprite({ sprite: "door", pos, width: TILE, height: TILE });
    } else {
      drawRect({ pos, width: TILE, height: TILE, color: rgb(95, 82, 145),
                 outline: { color: rgb(150, 135, 210), width: 1 + pulse() * 1.5 } });
    }
    drawText({
      text: d.label, pos: vec2(cx(d.gx), cy(d.gy)),
      size: 8, color: rgb(235, 230, 255), anchor: "center", width: TILE,
    });
  }

  // --- decor (non-interactive). flat lies on the floor; others stand up ---
  for (const o of (r.decor || [])) {
    if (!ready(o.kind)) continue;
    const s = o.size || PROP_DRAW;
    if (o.flat) {
      drawSprite({ sprite: o.kind, anchor: "center", pos: vec2(cx(o.gx), cy(o.gy)), width: s, height: s });
    } else {
      drawSprite({ sprite: o.kind, anchor: "bot", pos: vec2(cx(o.gx), ORIGIN_Y + (o.gy + 1) * TILE), width: s, height: s });
    }
  }

  // --- placed dorm furniture (cosmetic; only in the dorm) ---
  if (r === ROOMS.dorm) (state.dormDecor || []).forEach(drawPlacedDecor);

  // --- interactables (NPCs / props) with a gentle "tappable" glow ---
  for (const o of r.inters) {
    const p = pulse();

    // garden planters: soil bed; show seedling growth -> ripe crop
    // mine ore nodes: a rock with gleaming ore; depletes and replenishes
    if (o.nodeSlot !== undefined) {
      const _k = nodeKey(o);
      refreshNode(_k);
      const n = state.oreNodes[_k];
      const ore = n ? n.ore : ORE_PER;
      const live = ore > 0;
      const daysLeft = n ? Math.max(0, n.readyDay - state.dayCount) : 0;
      drawRect({ pos: vec2(cx(o.gx), ORIGIN_Y + o.gy * TILE + TILE / 2), width: TILE - 8, height: TILE - 10, anchor: "center",
                 color: live ? rgb(96, 90, 104) : rgb(60, 58, 66), radius: 4, outline: { color: rgb(40, 38, 46), width: 2 } });
      if (live) for (let i = 0; i < 3; i++)   // little ore gleams
        drawRect({ pos: vec2(o.gx * TILE + 8 + i * 7, ORIGIN_Y + o.gy * TILE + 12 + (i % 2) * 8), width: 4, height: 4,
                   color: rgb(150, 200, 230), radius: 1, opacity: 0.9 });
      if (live) drawRect({ pos: vec2(o.gx * TILE + 1, ORIGIN_Y + o.gy * TILE + 1), width: TILE - 2, height: TILE - 2,
                 color: rgb(0, 0, 0), opacity: 0, outline: { color: rgb(255, 255, 255), width: p * 2 }, radius: 4 });
      drawText({ text: live ? "Ore x" + ore : "spent (" + daysLeft + "d)", pos: vec2(cx(o.gx), ORIGIN_Y + o.gy * TILE + TILE + 1),
                 size: 8, anchor: "center", width: TILE * 2.6, color: live ? rgb(210, 225, 240) : rgb(150, 150, 165) });
      continue;
    }

    if (o.planterSlot !== undefined) {
      const pl = state.planters[o.planterSlot];
      // soil bed (sprite if supplied, else a brown rect)
      if (ready("planter")) drawSprite({ sprite: "planter", anchor: "bot",
        pos: vec2(cx(o.gx), ORIGIN_Y + (o.gy + 1) * TILE), width: PROP_DRAW, height: PROP_DRAW });
      else drawRect({ pos: vec2(o.gx * TILE + 3, ORIGIN_Y + o.gy * TILE + 9), width: TILE - 6, height: TILE - 12,
                 color: rgb(82, 60, 44), radius: 3, outline: { color: rgb(54, 38, 28), width: 1 } });
      let label = "Planter", actionable = true, ideal = false;
      if (pl) {
        const age = state.dayCount - pl.plantedDay, ripe = age >= GROW_DAYS;
        actionable = ripe;
        ideal = ripe && isIdealMoon(pl.herbId);
        // growth stages: tiny seedling -> bigger seedling -> ripe herb plant
        let spr, sz;
        if (ripe)                 { spr = herbSprite(pl.herbId); sz = PROP_DRAW; }
        else if (age >= GROW_DAYS / 2 && ready("seedling2")) { spr = "seedling2"; sz = 30; }
        else if (ready("seedling")) { spr = "seedling"; sz = 24; }
        else { spr = herbSprite(pl.herbId); sz = 18 + Math.min(age, GROW_DAYS) * 5; }
        // sit the plant in the soil (the planter box is taller than the tile),
        // not on its front rim
        if (ready(spr)) drawSprite({ sprite: spr, anchor: "bot",
          pos: vec2(cx(o.gx), ORIGIN_Y + (o.gy + 1) * TILE - 18), width: sz, height: sz, opacity: ripe ? 1 : 0.95 });
        label = ripe ? ITEMS[pl.herbId].name + " ready!" : ITEMS[pl.herbId].name + " (" + (GROW_DAYS - age) + "d)";
      }
      if (actionable) drawRect({ pos: vec2(o.gx * TILE + 1, ORIGIN_Y + o.gy * TILE + 1), width: TILE - 2, height: TILE - 2,
        color: rgb(0, 0, 0), opacity: 0, outline: { color: ideal ? rgb(255, 240, 170) : rgb(255, 255, 255), width: p * 2 }, radius: 4 });
      drawText({ text: label, pos: vec2(cx(o.gx), ORIGIN_Y + o.gy * TILE + TILE + 1), size: 8, anchor: "center",
        width: TILE * 2.6, color: ideal ? rgb(255, 240, 170) : (pl ? rgb(230, 225, 245) : rgb(180, 165, 140)) });
      continue;
    }

    // greenhouse pots (o.herbId) show ripe vs regrowing, with stock + moon cue
    const isPot = !!o.herbId;
    let ripe = true, stock = 0, daysLeft = 0, ideal = false;
    if (isPot) {
      refreshPot(o.herbId);
      const pot = state.pots[o.herbId];
      stock = pot ? pot.stock : 0;
      ripe = stock > 0;
      daysLeft = pot ? Math.max(0, pot.readyDay - state.dayCount) : 0;
      ideal = ripe && isIdealMoon(o.herbId);
    }
    const sprKey = isPot ? (ripe ? herbSprite(o.herbId) : "pots") : o.kind;
    if (ready(sprKey)) {
      // NPCs render as tall characters (player height); props/pots near-native.
      const isChar = CHAR_KINDS.has(o.kind);
      const w = isChar ? PLAYER_H * PLAYER_AR : PROP_DRAW;
      const h = isChar ? PLAYER_H : PROP_DRAW;
      drawSprite({
        sprite: sprKey, anchor: "bot",
        pos: vec2(cx(o.gx), ORIGIN_Y + (o.gy + 1) * TILE),
        width: w, height: h, opacity: (isPot && !ripe) ? 0.55 : 1,
      });
      // tappable halo only when actionable (pots only when ripe)
      if (!isPot || ripe) {
        drawRect({ pos: vec2(o.gx * TILE + 1, ORIGIN_Y + o.gy * TILE + 1), width: TILE - 2, height: TILE - 2,
                   color: rgb(0, 0, 0), opacity: 0,
                   outline: { color: ideal ? rgb(255, 240, 170) : rgb(255, 255, 255), width: p * 2 }, radius: 4 });
      }
    } else {
      drawRect({
        pos: vec2(o.gx * TILE + 4, ORIGIN_Y + o.gy * TILE + 4),
        width: TILE - 8, height: TILE - 8,
        color: col(o.color),
        outline: { color: rgb(255, 255, 255), width: 1 + p * 2 },
        radius: 4,
      });
    }
    let label = o.name;
    if (isPot) label = ripe ? o.name + " x" + stock + (ideal ? " (ideal!)" : "")
                            : o.name + " (" + daysLeft + "d)";
    drawText({
      text: label, pos: vec2(cx(o.gx), ORIGIN_Y + o.gy * TILE + TILE + 1),
      size: 8, anchor: "center", width: TILE * 2.6,
      color: (isPot && !ripe) ? rgb(150, 150, 165) : (ideal ? rgb(255, 240, 170) : rgb(230, 225, 245)),
    });
  }

  // --- player (sprite if supplied, else placeholder rect + facing nub) ---
  // Drawn ~1.4 tiles tall and bottom-anchored so the feet rest on the tile
  // (cozy Stardew proportion) rather than shrunk to a single 32px square.
  // walking? cycle the directional walk frames; otherwise the idle rotation.
  const moving = path && path.length > 0;
  let pKey = null;
  const nFrames = PLAYER_WALK[player.dir] || 0;
  if (moving && nFrames > 0) {
    const wf = "player_" + player.dir + "_w" + (Math.floor(time() * WALK_FPS) % nFrames);
    if (ready(wf)) pKey = wf;
  }
  if (!pKey) pKey = ready("player_" + player.dir) ? "player_" + player.dir : (ready("player") ? "player" : null);
  if (pKey) {
    drawSprite({
      sprite: pKey, anchor: "bot",
      pos: vec2(player.px, player.py + TILE * 0.42),
      width: PLAYER_H * PLAYER_AR, height: PLAYER_H,
    });
  } else {
    drawRect({
      pos: vec2(player.px, player.py), width: 22, height: 22,
      color: rgb(255, 210, 120), anchor: "center", radius: 4,
      outline: { color: rgb(120, 80, 30), width: 2 },
    });
    const nub = { up: [0, -9], down: [0, 9], left: [-9, 0], right: [9, 0] }[player.dir];
    drawRect({
      pos: vec2(player.px + nub[0], player.py + nub[1]), width: 7, height: 7,
      color: rgb(120, 80, 30), anchor: "center", radius: 2,
    });
  }

  drawHUD(r);
  if (brewUI)         drawBrew();
  if (journalOpen)    drawJournal();
  if (shopOpen)       drawShop();
  if (plantMenu)      drawPlantMenu();
  if (encounter)      drawEncounter();
  if (bagOpen)        drawBag();
  if (meditating)     drawMeditate();
  if (decorating)     drawDecorate();
  if (dialogue)       drawDialogue();
  else if (toastMsg && !brewUI && !journalOpen && !shopOpen && !plantMenu) drawToast();
  if (nightSummary)   drawNight();
  if (showTimetable)  drawTimetable();
  if (introLetter)    drawLetter();
});

/* ---------- HUD: room name, coin, friendship, inventory, hint ---------- */
function drawHUD(r) {
  // top strip
  drawRect({ pos: vec2(0, 0), width: CANVAS_W, height: ORIGIN_Y, color: rgb(26, 22, 38) });
  drawText({ text: r.name, pos: vec2(8, 6), size: 12, color: rgb(225, 215, 250) });
  drawText({
    text: "Coin " + state.coin + "   Friend " + state.friendship + "   Day " + state.dayCount + " · " + weekday(),
    pos: vec2(8, 24), size: 10, color: rgb(255, 225, 150),
  });
  // moon phase indicator (top-right corner)
  drawMoon(CANVAS_W - 13, 11, 8, [26, 22, 38]);
  // health & energy bars (top-right, under the moon)
  const bx = CANVAS_W - 120, bw = 112;
  drawText({ text: "HP", pos: vec2(bx - 16, 24), size: 8, color: rgb(220, 130, 130) });
  drawRect({ pos: vec2(bx, 24), width: bw, height: 6, color: rgb(40, 30, 36), radius: 3 });
  drawRect({ pos: vec2(bx, 24), width: bw * Math.max(0, state.health) / HP_MAX, height: 6, color: rgb(210, 70, 80), radius: 3 });
  drawText({ text: "EN", pos: vec2(bx - 16, 34), size: 8, color: rgb(130, 180, 220) });
  drawRect({ pos: vec2(bx, 34), width: bw, height: 6, color: rgb(28, 34, 42), radius: 3 });
  drawRect({ pos: vec2(bx, 34), width: bw * Math.max(0, state.energy) / EN_MAX, height: 6, color: rgb(80, 160, 220), radius: 3 });

  // inventory chips — compact (icon/colour + count) so the whole satchel fits
  const held = Object.keys(state.inv).filter((id) => state.inv[id] > 0 && ITEMS[id]);
  if (!held.length) {
    drawText({ text: "Bag: empty", pos: vec2(8, 41), size: 9, color: rgb(150, 150, 170) });
  } else {
    let ix = 8;
    for (const id of held) {
      const it = ITEMS[id], ikey = itemIcon(id);
      if (ikey) drawSprite({ sprite: ikey, pos: vec2(ix, 38), width: 18, height: 18 });
      else drawRect({ pos: vec2(ix, 41), width: 13, height: 13, color: col(it.color), radius: 3,
                      outline: { color: rgb(20, 16, 26), width: 1 } });
      const cnt = "x" + state.inv[id];
      drawText({ text: cnt, pos: vec2(ix + 19, 43), size: 9, color: rgb(225, 225, 235) });
      ix += 19 + cnt.length * 6 + 9;
    }
  }

  // objective hint along the bottom
  drawRect({ pos: vec2(0, CANVAS_H - 64), width: CANVAS_W, height: 64, color: rgb(26, 22, 38) });
  drawText({
    text: "> " + hintText(), pos: vec2(8, CANVAS_H - 56),
    size: 11, color: rgb(200, 220, 255), width: CANVAS_W - 16,
  });
  drawText({
    text: "Tap to move · tap a glowing object to use it",
    pos: vec2(8, CANVAS_H - 22), size: 9, color: rgb(140, 140, 165),
  });
}

/* ---------- Dialogue box ---------- */
function drawDialogue() {
  const line = dialogue.lines[dialogue.idx];
  const boxY = CANVAS_H - 150;
  drawRect({ pos: vec2(10, boxY), width: CANVAS_W - 20, height: 92, color: rgb(18, 16, 28), opacity: 0.96, radius: 8,
             outline: { color: rgb(140, 120, 200), width: 2 } });
  drawText({ text: line.s, pos: vec2(24, boxY + 12), size: 12, color: rgb(255, 210, 140) });
  drawText({ text: line.t, pos: vec2(24, boxY + 34), size: 11, color: rgb(232, 230, 245), width: CANVAS_W - 56 });
  drawText({ text: "(tap to continue)", pos: vec2(CANVAS_W - 24, boxY + 76), size: 9,
             color: rgb(150, 150, 175), anchor: "right" });
}

/* ---------- Transient toast ---------- */
function drawToast() {
  if (time() > toastMsg.until) { toastMsg = null; return; }
  const fade = Math.min(1, (toastMsg.until - time()) / 0.5);
  drawRect({ pos: vec2(CANVAS_W / 2, CANVAS_H - 120), width: CANVAS_W - 40, height: 30,
             color: rgb(18, 16, 28), opacity: 0.9 * fade, radius: 8, anchor: "center" });
  drawText({ text: toastMsg.text, pos: vec2(CANVAS_W / 2, CANVAS_H - 120), size: 11,
             color: rgb(255, 240, 200), anchor: "center", opacity: fade });
}

/* ---------- Nightly recap (on sleep) ---------- */
function drawNight() {
  drawRect({ pos: vec2(0, 0), width: CANVAS_W, height: CANVAS_H, color: rgb(10, 8, 18), opacity: 0.93 });
  const cxm = CANVAS_W / 2;
  drawText({ text: "Goodnight", pos: vec2(cxm, 96), size: 22, color: rgb(255, 225, 150), anchor: "center" });
  drawText({ text: "Day " + state.dayCount + " · " + weekday(), pos: vec2(cxm, 126), size: 12,
             color: rgb(200, 200, 220), anchor: "center" });
  drawMoon(cxm - 64, 146, 9, [10, 8, 18]);
  drawText({ text: "Tonight: " + moonPhase().name, pos: vec2(cxm - 50, 146), size: 11,
             color: rgb(210, 210, 240), anchor: "left" });

  drawText({ text: "Today you:", pos: vec2(cxm, 168), size: 13, color: rgb(220, 215, 240), anchor: "center" });
  const log = state.todayLog.length ? state.todayLog : ["had a quiet day"];
  log.slice(0, 8).forEach((t, i) => {
    drawText({ text: "· " + t, pos: vec2(cxm, 194 + i * 22), size: 12, color: rgb(225, 225, 240), anchor: "center" });
  });

  const nextDay = DAYS[state.dayCount % DAYS.length];
  drawText({ text: "Coin " + state.coin + "   ·   " + bosHerbPages().length + "/" + HERB_ORDER.length + " plants studied",
             pos: vec2(cxm, CANVAS_H - 120), size: 11, color: rgb(200, 210, 230), anchor: "center" });
  drawText({ text: "Tap to wake on " + nextDay, pos: vec2(cxm, CANVAS_H - 80), size: 13,
             color: rgb(170, 200, 255), anchor: "center" });
}

/* ---------- Invitation letter (shown once at the start) ---------- */
function drawLetter() {
  drawRect({ pos: vec2(0, 0), width: CANVAS_W, height: CANVAS_H, color: rgb(8, 6, 14), opacity: 0.85 });
  const bx = 24, by = 70, bw = CANVAS_W - 48, bh = CANVAS_H - 180;
  drawRect({ pos: vec2(bx, by), width: bw, height: bh, color: rgb(236, 224, 194), radius: 6,
             outline: { color: rgb(150, 120, 60), width: 2 } });
  const x = bx + 18, w = bw - 36, INK = rgb(74, 52, 34), HDR = rgb(96, 58, 110);
  let y = by + 22;
  drawText({ text: "Moonwell Academy", pos: vec2(bx + bw / 2, y), size: 20, font: hf(), color: HDR, anchor: "center" }); y += 22;
  drawText({ text: "of Witchery & Herbal Arts", pos: vec2(bx + bw / 2, y), size: 12, font: hf(), color: INK, anchor: "center" }); y += 30;
  const body = [
    "Dear new student,",
    "It is our delight to welcome you to Moonwell Academy. A room has been made ready for you in the dormitory.",
    "Your timetable is pinned by your desk — study each craft on its appointed day.",
    "Rest tonight. Your lessons begin in the morning.",
    "— Headmistress Wren",
  ];
  for (const line of body) {
    drawText({ text: line, pos: vec2(x, y), size: 13, font: hf(), color: INK, width: w, lineSpacing: 3 });
    y += 13 * 1.2 * Math.ceil((line.length * 7) / w) + 12;
  }
  drawText({ text: "(tap to arrive)", pos: vec2(CANVAS_W / 2, by + bh - 18), size: 11, font: hf(),
             color: rgb(120, 95, 80), anchor: "center" });
}

/* ---------- Timetable overlay (today highlighted) ---------- */
function drawTimetable() {
  drawRect({ pos: vec2(0, 0), width: CANVAS_W, height: CANVAS_H, color: rgb(8, 6, 14), opacity: 0.85 });
  const bx = 18, by = 60, bw = CANVAS_W - 36, bh = CANVAS_H - 150;
  drawRect({ pos: vec2(bx, by), width: bw, height: bh, color: rgb(236, 224, 194), radius: 6,
             outline: { color: rgb(150, 120, 60), width: 2 } });
  const INK = rgb(74, 52, 34), HDR = rgb(96, 58, 110), today = weekday();
  let y = by + 20;
  drawText({ text: "Timetable", pos: vec2(bx + bw / 2, y), size: 20, font: hf(), color: HDR, anchor: "center" }); y += 22;
  drawText({ text: "Day " + state.dayCount + " · " + today + "  —  " + moonPhase().name,
             pos: vec2(bx + bw / 2, y), size: 12, font: hf(), color: INK, anchor: "center" }); y += 22;
  for (const d of DAYS) {
    const isToday = d === today;
    const classes = (TIMETABLE[d] || []).map((id) => SUBJECTS[id].name).join(", ") || "free study";
    if (isToday) drawRect({ pos: vec2(bx + 8, y - 2), width: bw - 16, height: 22, color: rgb(214, 198, 162), radius: 4 });
    drawText({ text: (isToday ? "> " : "  ") + d, pos: vec2(bx + 16, y), size: 13, font: hf(),
               color: isToday ? HDR : INK });
    drawText({ text: classes, pos: vec2(bx + 110, y), size: 12, font: hf(), color: INK, width: bw - 122 });
    y += 24;
  }
  drawText({ text: "(tap to close)", pos: vec2(CANVAS_W / 2, by + bh - 16), size: 11, font: hf(),
             color: rgb(120, 95, 80), anchor: "center" });
}

/* ---------- Merchant shop overlay ---------- */
function shopRows() {
  const shop = SHOPS[shopOpen] || SHOPS.general;
  const rows = [], x = 22, w = CANVAS_W - 44, H = 21; let y = 96;
  const push = (o) => { o.x = x; o.y = y; o.w = w; o.h = H; rows.push(o); y += H; };
  // seed packets (for studied herbs)
  if (shop.seeds) {
    push({ type: "hdr", label: "Buy seeds  (" + SEED_COST + "c each)" });
    let any = false;
    for (const id of HERB_ORDER) {
      if (!state.herbsKnown[id]) continue; any = true;
      push({ type: "seed", id, label: ITEMS[id].name + " seed", sub: "have " + (state.seeds[id] || 0), price: SEED_COST });
    }
    if (!any) push({ type: "note", label: "(study herbs to unlock their seeds)" });
    y += 6;
  }
  // fixed goods (paginated when the list is long, e.g. Furnishings)
  if (shop.buy && shop.buy.length) {
    const per = 14, pages = Math.ceil(shop.buy.length / per);
    const pg = shopPage = Math.max(0, Math.min(shopPage, pages - 1));
    push({ type: "hdr", label: "Buy" + (pages > 1 ? "  (page " + (pg + 1) + "/" + pages + ")" : "") });
    for (const id of shop.buy.slice(pg * per, pg * per + per)) {
      const owned = ITEMS[id].kind === "furniture" ? (state.furniture[id] || 0) : (state.inv[id] || 0);
      push({ type: "buy", id, label: ITEMS[id].name, sub: "own " + owned, price: buyCost(id) });
    }
    if (pages > 1) {
      rows.push({ type: "prev", x, y, w: w / 2 - 4, h: H });
      rows.push({ type: "next", x: x + w / 2 + 4, y, w: w / 2 - 4, h: H });
      y += H;
    }
    y += 6;
  }
  // selling
  if (shop.sellKinds && shop.sellKinds.length) {
    push({ type: "hdr", label: "Sell" });
    const sellable = Object.keys(state.inv).filter((id) => state.inv[id] > 0 && ITEMS[id] && shop.sellKinds.includes(ITEMS[id].kind));
    if (!sellable.length) push({ type: "note", label: "(nothing they'll buy)" });
    for (const id of sellable) push({ type: "sell", id, label: ITEMS[id].name + " x" + state.inv[id], price: ITEMS[id].sell != null ? ITEMS[id].sell : HERB_SELL });
    y += 8;
  }
  push({ type: "close", label: "Close" });
  return rows;
}
// Pick the best sprite to show next to a shop row: real item icon, herb plant,
// or (for furniture) its decor sprite. Returns null if no art is loaded yet.
function shopIcon(id) {
  const it = ITEMS[id];
  if (!it) return null;
  if (it.kind === "furniture" && ready(it.sprite)) return it.sprite;
  if (ready("item_" + id)) return "item_" + id;
  if (ready("herb_" + id)) return "herb_" + id;
  if (it.kind === "herb") return herbSprite(id);
  return null;
}
function drawShop() {
  const shop = SHOPS[shopOpen] || SHOPS.general;
  drawRect({ pos: vec2(0, 0), width: CANVAS_W, height: CANVAS_H, color: rgb(8, 6, 14), opacity: 0.86 });
  drawRect({ pos: vec2(14, 44), width: CANVAS_W - 28, height: CANVAS_H - 80, color: rgb(34, 28, 44), radius: 10,
             outline: { color: rgb(150, 120, 60), width: 2 } });
  drawText({ text: shop.name, pos: vec2(CANVAS_W / 2, 56), size: 16, color: rgb(255, 225, 150), anchor: "center" });
  drawText({ text: "Coin " + state.coin, pos: vec2(CANVAS_W / 2, 78), size: 11, color: rgb(255, 235, 175), anchor: "center" });
  for (const b of shopRows()) {
    if (b.type === "hdr") {
      drawText({ text: b.label, pos: vec2(b.x, b.y + 4), size: 12, color: rgb(190, 175, 220) });
    } else if (b.type === "note") {
      drawText({ text: b.label, pos: vec2(b.x + 6, b.y + 4), size: 10, color: rgb(150, 150, 170) });
    } else {
      const isBuy = b.type === "buy" || b.type === "seed";
      const isNav = b.type === "prev" || b.type === "next";
      const accent = b.type === "close" ? rgb(150, 130, 200) : (isNav ? rgb(150, 150, 200) : (isBuy ? rgb(120, 180, 130) : rgb(220, 170, 110)));
      drawRect({ pos: vec2(b.x, b.y), width: b.w, height: b.h - 3, color: rgb(46, 40, 58), radius: 5, outline: { color: accent, width: 1 } });
      if (b.type === "close") {
        drawText({ text: "Close", pos: vec2(b.x + b.w / 2, b.y + 5), size: 12, color: rgb(220, 220, 235), anchor: "center" });
      } else if (isNav) {
        drawText({ text: b.type === "prev" ? "< Prev" : "Next >", pos: vec2(b.x + b.w / 2, b.y + 5), size: 12, color: rgb(220, 220, 235), anchor: "center" });
      } else {
        const icon = shopIcon(b.id);
        const lx = icon ? b.x + 26 : b.x + 8;
        if (icon) drawSprite({ sprite: icon, pos: vec2(b.x + 13, b.y + (b.h - 3) / 2), anchor: "center", width: 16, height: 16 });
        drawText({ text: b.label, pos: vec2(lx, b.y + 5), size: 11, color: rgb(225, 225, 240) });
        if (b.sub) drawText({ text: b.sub, pos: vec2(b.x + b.w - 70, b.y + 5), size: 9, color: rgb(160, 160, 180), anchor: "right" });
        drawText({ text: (isBuy ? "-" : "+") + b.price + "c", pos: vec2(b.x + b.w - 8, b.y + 5), size: 11, color: accent, anchor: "right" });
      }
    }
  }
}
function handleShopTap(m) {
  for (const b of shopRows()) {
    if (!pointIn(m, b)) continue;
    if (b.type === "close") shopOpen = false;
    else if (b.type === "prev") shopPage = Math.max(0, shopPage - 1);
    else if (b.type === "next") shopPage += 1;
    else if (b.type === "seed") buySeed(b.id);
    else if (b.type === "buy") buyItem(b.id);
    else if (b.type === "sell") sellItem(b.id);
    return;
  }
}

/* ---------- Dorm decorating mode ----------
   Bottom palette of owned furniture (paged). Tap a chip to select a piece,
   then tap a tile to place it. Tap a placed piece to select it, then Rotate /
   Remove it, or tap another tile to move it. Floor pieces go on open floor;
   wall hangings go on a wall tile. Cosmetic — nothing blocks walking.        */
function decorOwned() {
  return DECOR_ORDER.filter((id) => (state.furniture[id] || 0) > 0);
}
const DECOR_PER = 7;
function decorRows() {
  const rows = [], band = CANVAS_H - 64;
  // control row (right-aligned buttons): Done always; Rotate/Remove when a
  // placed piece is selected
  rows.push({ type: "done", x: CANVAS_W - 46, y: band + 3, w: 42, h: 15 });
  if (decorating.pick != null) {
    rows.push({ type: "rotate", x: CANVAS_W - 96, y: band + 3, w: 46, h: 15 });
    rows.push({ type: "remove", x: CANVAS_W - 150, y: band + 3, w: 50, h: 15 });
  }
  // palette: page arrows + owned chips for the current page
  const owned = decorOwned(), pages = Math.max(1, Math.ceil(owned.length / DECOR_PER));
  decorating.page = Math.max(0, Math.min(decorating.page || 0, pages - 1));
  if (pages > 1) {
    rows.push({ type: "pprev", x: 4, y: band + 22, w: 18, h: 38 });
    rows.push({ type: "pnext", x: CANVAS_W - 22, y: band + 22, w: 18, h: 38 });
  }
  let x = pages > 1 ? 26 : 8;
  for (const id of owned.slice(decorating.page * DECOR_PER, decorating.page * DECOR_PER + DECOR_PER)) {
    rows.push({ type: "chip", id, x, y: band + 22, w: 40, h: 38 });
    x += 46;
  }
  return rows;
}
function drawDecorate() {
  const band = CANVAS_H - 64;
  // lore tooltip for the focused piece (floats just above the palette band)
  const focus = decorating.pick != null ? (state.dormDecor[decorating.pick] || {}).id : decorating.sel;
  if (focus && ITEMS[focus] && ITEMS[focus].lore) {
    drawRect({ pos: vec2(0, band - 30), width: CANVAS_W, height: 30, color: rgb(20, 16, 30), opacity: 0.92 });
    drawText({ text: ITEMS[focus].name + " — " + ITEMS[focus].lore, pos: vec2(6, band - 27), size: 9,
               color: rgb(220, 214, 240), width: CANVAS_W - 12 });
  }
  drawRect({ pos: vec2(0, band), width: CANVAS_W, height: 64, color: rgb(30, 24, 44) });
  // instruction line (left of the control buttons)
  let tip;
  if (decorating.pick != null) {
    const o = state.dormDecor[decorating.pick];
    tip = "Selected " + (ITEMS[o.id] ? ITEMS[o.id].name : "piece") + " — Rotate / Remove, or tap a tile to move it.";
  } else if (decorating.sel) {
    tip = "Placing " + ITEMS[decorating.sel].name + " — tap " + (ITEMS[decorating.sel].wall ? "a wall" : "an open floor") + " tile.";
  } else {
    tip = "Tap a piece, then a tile. Tap a placed piece to edit it.";
  }
  drawText({ text: tip, pos: vec2(6, band + 5), size: 9, color: rgb(225, 216, 244), width: CANVAS_W - 158 });
  if (!decorOwned().length) {
    drawText({ text: "No furniture yet — buy some at the Furnishings shop (Market Street).",
               pos: vec2(6, band + 30), size: 10, color: rgb(180, 170, 200), width: CANVAS_W - 16 });
  }
  const labels = { done: "Done", rotate: "Rotate", remove: "Remove", pprev: "<", pnext: ">" };
  for (const b of decorRows()) {
    if (b.type === "chip") {
      const it = ITEMS[b.id], seld = decorating.sel === b.id;
      drawRect({ pos: vec2(b.x, b.y), width: b.w, height: b.h, color: rgb(44, 36, 58), radius: 5,
                 outline: { color: seld ? rgb(255, 210, 130) : rgb(90, 78, 110), width: seld ? 2 : 1 } });
      if (ready(it.sprite)) drawSprite({ sprite: it.sprite, anchor: "center", pos: vec2(b.x + b.w / 2, b.y + 15), width: 22, height: 22 });
      else drawRect({ pos: vec2(b.x + b.w / 2, b.y + 15), width: 16, height: 16, anchor: "center", color: col(it.color), radius: 3 });
      drawText({ text: "x" + state.furniture[b.id], pos: vec2(b.x + b.w / 2, b.y + 28), size: 9, color: rgb(225, 222, 235), anchor: "center" });
    } else {
      const accent = b.type === "remove" ? rgb(220, 150, 150) : rgb(180, 150, 210);
      drawRect({ pos: vec2(b.x, b.y), width: b.w, height: b.h, color: rgb(58, 48, 74), radius: 4, outline: { color: accent, width: 1 } });
      drawText({ text: labels[b.type], pos: vec2(b.x + b.w / 2, b.y + 3), size: b.type.startsWith("p") ? 12 : 10,
                 color: rgb(232, 224, 248), anchor: "center" });
    }
  }
}
function handleDecorateTap(m) {
  // panel buttons take priority over the room
  for (const b of decorRows()) {
    if (!pointIn(m, b)) continue;
    if (b.type === "done") { decorating = null; save(); }
    else if (b.type === "pprev") decorating.page = Math.max(0, (decorating.page || 0) - 1);
    else if (b.type === "pnext") decorating.page = (decorating.page || 0) + 1;
    else if (b.type === "chip") { decorating.sel = (decorating.sel === b.id ? null : b.id); decorating.pick = null; }
    else if (b.type === "rotate" && decorating.pick != null) {
      const o = state.dormDecor[decorating.pick]; o.rot = ((o.rot || 0) + 1) % 4; save();
    } else if (b.type === "remove" && decorating.pick != null) {
      const o = state.dormDecor[decorating.pick];
      state.furniture[o.id] = (state.furniture[o.id] || 0) + 1;
      state.dormDecor.splice(decorating.pick, 1);
      decorating.pick = null; toast("Picked up"); save();
    }
    return;
  }
  // taps on the grid (above the palette band)
  if (m.y < ORIGIN_Y || m.y >= CANVAS_H - 64) return;
  const gx = Math.floor(m.x / TILE), gy = Math.floor((m.y - ORIGIN_Y) / TILE);
  if (gx < 0 || gy < 0 || gx >= GW || gy >= GH) return;
  const r = ROOMS.dorm;
  const hit = (state.dormDecor || []).findIndex((d) => d.gx === gx && d.gy === gy);
  // tapped another placed piece -> select it for editing
  if (hit >= 0 && hit !== decorating.pick) { decorating.pick = hit; decorating.sel = null; return; }
  if (hit >= 0) return;                              // tapped the selected piece's own tile
  // empty tile: move the selected placed piece, else place a new one
  if (decorating.pick != null) {
    const o = state.dormDecor[decorating.pick];
    if (!validDecorTile(r, gx, gy, ITEMS[o.id], decorating.pick)) { toast("Can't place there"); return; }
    o.gx = gx; o.gy = gy; save(); return;
  }
  const id = decorating.sel;
  if (!id || (state.furniture[id] || 0) <= 0) return;
  if (!validDecorTile(r, gx, gy, ITEMS[id], -1)) { toast("Can't place there"); return; }
  const it = ITEMS[id];
  state.dormDecor.push({ id, sprite: it.sprite, gx, gy, flat: !!it.flat, wall: !!it.wall, rot: 0 });
  state.furniture[id] -= 1;
  if (state.furniture[id] <= 0) { delete state.furniture[id]; if (decorating.sel === id) decorating.sel = null; }
  save();
}
// Is (gx,gy) a legal home for this furniture? Wall hangings need a wall tile
// (not a door); floor pieces need open floor (no wall/door/inter/built-in
// decor). Either way the tile must be free of other placed pieces.
function validDecorTile(r, gx, gy, it, selfIdx) {
  const occ = (state.dormDecor || []).findIndex((d) => d.gx === gx && d.gy === gy);
  if (occ >= 0 && occ !== selfIdx) return false;
  const isWall = r.grid[gy][gx] === "#";
  if (it && it.wall) return isWall && !doorAt(r, gx, gy);
  if (isWall || doorAt(r, gx, gy) || interAt(r, gx, gy) || decorAt(r, gx, gy)) return false;
  return true;
}
// Draw one placed dorm piece (sprite if we have art, else a tidy placeholder),
// with rotation; in Decorate mode add a selection outline + a small label.
function drawPlacedDecor(o, idx) {
  const it = ITEMS[o.id] || {}, flat = it.flat, wall = it.wall, ang = (o.rot || 0) * 90;
  const cxp = cx(o.gx), cyp = ORIGIN_Y + o.gy * TILE + TILE / 2;
  if (ready(o.sprite)) {
    if (flat)      drawSprite({ sprite: o.sprite, anchor: "center", pos: vec2(cxp, cy(o.gy)), width: PROP_DRAW, height: PROP_DRAW, angle: ang });
    else if (wall) drawSprite({ sprite: o.sprite, anchor: "center", pos: vec2(cxp, cyp), width: 26, height: 26, angle: ang });
    else           drawSprite({ sprite: o.sprite, anchor: "bot", pos: vec2(cxp, ORIGIN_Y + (o.gy + 1) * TILE), width: PROP_DRAW, height: PROP_DRAW, angle: ang });
  } else {
    // placeholder shapes until PixelLab art is dropped in under o.sprite
    const odd = (o.rot || 0) % 2 === 1;
    if (flat) {
      drawRect({ pos: vec2(cxp, cy(o.gy)), anchor: "center", width: odd ? 16 : 30, height: odd ? 30 : 16,
                 color: col(it.color), radius: 4, outline: { color: col(it.color, 0.6), width: 2 } });
    } else if (wall) {
      drawRect({ pos: vec2(cxp, cyp - 12), anchor: "center", width: 3, height: 4, color: rgb(60, 54, 50) });
      drawRect({ pos: vec2(cxp, cyp), anchor: "center", width: 22, height: 22, color: col(it.color), radius: 3,
                 outline: { color: rgb(40, 34, 30), width: 2 } });
    } else {
      drawRect({ pos: vec2(cxp, ORIGIN_Y + (o.gy + 1) * TILE - 3), anchor: "bot", width: 18, height: 26,
                 color: col(it.color), radius: 4, outline: { color: col(it.color, 0.6), width: 2 } });
    }
  }
  if (decorating) {
    const picked = decorating.pick === idx;
    drawRect({ pos: vec2(o.gx * TILE + 1, ORIGIN_Y + o.gy * TILE + 1), width: TILE - 2, height: TILE - 2,
               color: rgb(0, 0, 0), opacity: 0,
               outline: { color: picked ? rgb(255, 220, 130) : rgb(200, 190, 220), width: picked ? 2 + pulse() * 2 : 1 }, radius: 4 });
    drawText({ text: it.name || "", pos: vec2(cxp, ORIGIN_Y + o.gy * TILE + TILE - 1), size: 7, anchor: "center",
               width: TILE * 2.4, color: rgb(235, 228, 248) });
  }
}

/* ---------- Plant-a-seed chooser ---------- */
function plantRows() {
  const rows = [], x = 44, w = CANVAS_W - 88, H = 26; let y = 150;
  for (const id of HERB_ORDER) {
    if ((state.seeds[id] || 0) <= 0) continue;
    rows.push({ x, y, w, h: H, id, label: ITEMS[id].name + " seed  (have " + state.seeds[id] + ")" }); y += H + 4;
  }
  rows.push({ x, y: y + 6, w, h: H, id: null, label: "Cancel" });
  return rows;
}
function drawPlantMenu() {
  drawRect({ pos: vec2(0, 0), width: CANVAS_W, height: CANVAS_H, color: rgb(8, 6, 14), opacity: 0.82 });
  drawText({ text: "Plant which seed?", pos: vec2(CANVAS_W / 2, 116), size: 15, color: rgb(255, 230, 175), anchor: "center" });
  for (const b of plantRows()) {
    const isCancel = b.id === null;
    drawRect({ pos: vec2(b.x, b.y), width: b.w, height: b.h, color: rgb(46, 40, 58), radius: 6,
               outline: { color: isCancel ? rgb(150, 130, 200) : rgb(120, 180, 130), width: 1 } });
    drawText({ text: b.label, pos: vec2(b.x + b.w / 2, b.y + b.h / 2), size: 12,
               color: rgb(225, 225, 240), anchor: "center" });
  }
}
function handlePlantTap(m) {
  for (const b of plantRows()) {
    if (!pointIn(m, b)) continue;
    if (b.id === null) plantMenu = null;
    else plantSeed(plantMenu.slot, b.id);
    return;
  }
}

/* ---------- Mine creature encounter (defensive choices, no combat) ---------- */
function encounterRows() {
  const rows = [], x = 28, w = CANVAS_W - 56, H = 28; let y = 248;
  for (const a of APPROACHES) {
    if (!approachAvailable(a)) continue;   // item-gated: only if you carry it
    const disabled = a.magic && state.energy < SPELL_COST;
    rows.push({ x, y, w, h: H, id: a.id, label: a.label + (a.magic ? "  (-" + SPELL_COST + " en)" : ""), magic: a.magic, disabled }); y += H + 5;
  }
  return rows;
}
function drawEncounter() {
  const c = CREATURES[encounter.creature];
  const known = !!state.creaturesKnown[encounter.creature];
  drawRect({ pos: vec2(0, 0), width: CANVAS_W, height: CANVAS_H, color: rgb(8, 6, 14), opacity: 0.88 });
  if (ready(encounter.creature)) {
    drawSprite({ sprite: encounter.creature, pos: vec2(CANVAS_W / 2, 120), anchor: "center", width: 84, height: 84 });
  } else {
    drawRect({ pos: vec2(CANVAS_W / 2, 120), width: 84, height: 84, anchor: "center", color: col(c.color), radius: 8,
               outline: { color: rgb(20, 16, 26), width: 2 } });
  }
  drawText({ text: c.name + (c.tier === "spirit" ? "  (spirit)" : ""), pos: vec2(CANVAS_W / 2, 172), size: 16, color: rgb(255, 225, 150), anchor: "center" });
  drawText({ text: c.appear, pos: vec2(CANVAS_W / 2, 198), size: 12, color: rgb(225, 220, 240), anchor: "center", width: CANVAS_W - 60 });
  drawText({ text: known ? "Keeper Fenn taught you about this one." : "You don't know this creature yet — guess, or back away.",
             pos: vec2(CANVAS_W / 2, 222), size: 10, color: rgb(170, 170, 190), anchor: "center", width: CANVAS_W - 50 });
  drawText({ text: "Health " + state.health + "   Energy " + state.energy, pos: vec2(CANVAS_W / 2, 238), size: 10,
             color: rgb(200, 190, 170), anchor: "center" });
  for (const b of encounterRows()) {
    const retreat = b.id === "retreat";
    const hint = known && b.id === c.calmWith && !b.disabled;   // highlight the studied response
    const oc = b.disabled ? rgb(90, 80, 90) : (hint ? rgb(150, 220, 150) : (retreat ? rgb(150, 130, 200) : rgb(120, 180, 160)));
    drawRect({ pos: vec2(b.x, b.y), width: b.w, height: b.h, color: hint ? rgb(58, 70, 56) : rgb(46, 40, 58),
               opacity: b.disabled ? 0.5 : 1, radius: 6, outline: { color: oc, width: hint ? 2 : 1 } });
    drawText({ text: b.label + (hint ? "   (try this)" : ""), pos: vec2(b.x + 12, b.y + b.h / 2), size: 11,
               color: b.disabled ? rgb(150, 145, 155) : (hint ? rgb(220, 245, 220) : rgb(225, 225, 240)), anchor: "left" });
  }
}
function handleEncounterTap(m) {
  for (const b of encounterRows()) { if (pointIn(m, b) && !b.disabled) { resolveEncounter(b.id); return; } }
}

/* ---------- Bag: eat / drink / meditate ---------- */
function useConsumable(id) {
  const r = ITEMS[id].restore || {};
  if (r.health) state.health = Math.min(HP_MAX, state.health + r.health);
  if (r.energy) state.energy = Math.min(EN_MAX, state.energy + r.energy);
  state.inv[id] -= 1;
  const verb = ITEMS[id].kind === "remedy" ? "Drank" : "Ate";
  toast(verb + " " + ITEMS[id].name + " (" + (r.health ? "+" + r.health + " HP" : "+" + r.energy + " EN") + ").");
  save();
}
function bagRows() {
  const rows = [], x = 22, w = CANVAS_W - 44, H = 24; let y = 120;
  const push = (o) => { o.x = x; o.y = y; o.w = w; o.h = H; rows.push(o); y += H + 4; };
  push({ type: "hdr", label: "Eat / Drink" });
  const consumables = Object.keys(state.inv).filter((id) => state.inv[id] > 0 && ITEMS[id] && ITEMS[id].restore);
  if (!consumables.length) push({ type: "note", label: "(no food or remedies — buy some in the village)" });
  for (const id of consumables) {
    const r = ITEMS[id].restore;
    push({ type: "use", id, label: ITEMS[id].name + "  x" + state.inv[id], gain: r.health ? "+" + r.health + " HP" : "+" + r.energy + " EN" });
  }
  y += 8;
  push({ type: "meditate", label: "Meditate — ground & draw energy from the earth" });
  y += 4;
  push({ type: "close", label: "Close" });
  return rows;
}
function drawBag() {
  drawRect({ pos: vec2(0, 0), width: CANVAS_W, height: CANVAS_H, color: rgb(8, 6, 14), opacity: 0.86 });
  drawRect({ pos: vec2(14, 44), width: CANVAS_W - 28, height: CANVAS_H - 80, color: rgb(34, 28, 44), radius: 10, outline: { color: rgb(150, 120, 60), width: 2 } });
  drawText({ text: "Bag", pos: vec2(CANVAS_W / 2, 58), size: 16, color: rgb(255, 225, 150), anchor: "center" });
  drawText({ text: "Health " + state.health + " / " + HP_MAX + "    Energy " + state.energy + " / " + EN_MAX,
             pos: vec2(CANVAS_W / 2, 80), size: 11, color: rgb(230, 220, 200), anchor: "center" });
  for (const b of bagRows()) {
    if (b.type === "hdr") { drawText({ text: b.label, pos: vec2(b.x, b.y + 4), size: 12, color: rgb(190, 175, 220) }); continue; }
    if (b.type === "note") { drawText({ text: b.label, pos: vec2(b.x + 6, b.y + 4), size: 10, color: rgb(150, 150, 170) }); continue; }
    const accent = b.type === "close" ? rgb(150, 130, 200) : (b.type === "meditate" ? rgb(140, 200, 160) : rgb(180, 200, 130));
    drawRect({ pos: vec2(b.x, b.y), width: b.w, height: b.h, color: rgb(46, 40, 58), radius: 6, outline: { color: accent, width: 1 } });
    if (b.type === "close" || b.type === "meditate") {
      drawText({ text: b.label, pos: vec2(b.x + b.w / 2, b.y + b.h / 2), size: 12, color: rgb(225, 225, 240), anchor: "center" });
    } else {
      drawText({ text: b.label, pos: vec2(b.x + 8, b.y + b.h / 2), size: 11, color: rgb(225, 225, 240), anchor: "left" });
      drawText({ text: b.gain, pos: vec2(b.x + b.w - 8, b.y + b.h / 2), size: 11, color: accent, anchor: "right" });
    }
  }
}
function handleBagTap(m) {
  for (const b of bagRows()) {
    if (!pointIn(m, b)) continue;
    if (b.type === "close") bagOpen = false;
    else if (b.type === "use") useConsumable(b.id);
    else if (b.type === "meditate") { bagOpen = false; meditating = { start: time(), from: state.energy }; }
    return;
  }
}
function drawMeditate() {
  const t = Math.min(1, (time() - meditating.start) / MEDITATE_SECS);
  state.energy = Math.min(EN_MAX, Math.round(meditating.from + MEDITATE_GAIN * t));
  drawRect({ pos: vec2(0, 0), width: CANVAS_W, height: CANVAS_H, color: rgb(8, 10, 16), opacity: 0.9 });
  drawText({ text: "Meditating...", pos: vec2(CANVAS_W / 2, CANVAS_H / 2 - 40), size: 16, color: rgb(200, 220, 255), anchor: "center" });
  drawText({ text: "Drawing energy up from the earth.", pos: vec2(CANVAS_W / 2, CANVAS_H / 2 - 16), size: 11, color: rgb(170, 185, 210), anchor: "center" });
  const bw = 200, bx = CANVAS_W / 2 - bw / 2, by = CANVAS_H / 2 + 10;
  drawRect({ pos: vec2(bx, by), width: bw, height: 10, color: rgb(28, 34, 42), radius: 5 });
  drawRect({ pos: vec2(bx, by), width: bw * t, height: 10, color: rgb(90, 170, 220), radius: 5 });
  if (t >= 1) { meditating = null; toast("You feel renewed."); save(); }
}

/* ---------- Field journal: a parchment page of studies + takeaways ---------- */
// The Book of Shadows is paged: page 0 is the studies overview, then one
// illustrated page per studied herb (in HERB_ORDER). Prev/Next/Close buttons.
function bosHerbPages() { return HERB_ORDER.filter((h) => state.herbsKnown[h]); }
function bosCrystalPages() { return CRYSTAL_ORDER.filter((c) => state.crystalsKnown[c]); }
function bosCreaturePages() { return CREATURE_ORDER.filter((c) => state.creaturesKnown[c]); }
function bosAstroPages() { return ASTRO_ORDER.filter((a) => state.astronomyKnown[a]); }
function bosTotalPages() { return 1 + bosHerbPages().length + bosCrystalPages().length + bosCreaturePages().length + bosAstroPages().length; }
function bosButtons() {
  const y = CANVAS_H - 90, h = 26;
  return [
    { id: "prev",  x: 22,             y, w: 74, h, label: "< Prev" },
    { id: "close", x: CANVAS_W / 2 - 37, y, w: 74, h, label: "Close" },
    { id: "next",  x: CANVAS_W - 96,  y, w: 74, h, label: "Next >" },
  ];
}
function handleBosTap(m) {
  if (bosPage === 0 && pointIn(m, resetBtn())) {     // reset (two-tap confirm)
    if (resetArmed) resetGame(); else resetArmed = true;
    return;
  }
  for (const b of bosButtons()) {
    if (!pointIn(m, b)) continue;
    resetArmed = false;                              // any nav cancels a pending reset
    if (b.id === "close") journalOpen = false;
    else if (b.id === "prev") bosPage = Math.max(0, bosPage - 1);
    else if (b.id === "next") bosPage = Math.min(bosTotalPages() - 1, bosPage + 1);
    return;
  }
}

function drawJournal() {                       // (the Book of Shadows)
  drawRect({ pos: vec2(0, 0), width: CANVAS_W, height: CANVAS_H, color: rgb(8, 6, 14), opacity: 0.6 });
  const bx = 12, by = 40, bw = CANVAS_W - 24, bh = CANVAS_H - 110;
  drawRect({ pos: vec2(bx, by), width: bw, height: bh, color: rgb(58, 34, 30), radius: 12,
             outline: { color: rgb(150, 120, 60), width: 3 } });
  const px = bx + 12, py = by + 12, pw = bw - 24, ph = bh - 24;
  drawRect({ pos: vec2(px, py), width: pw, height: ph, color: rgb(236, 224, 194), radius: 4 });

  const herbs = bosHerbPages(), crystals = bosCrystalPages(), creatures = bosCreaturePages(), astro = bosAstroPages();
  if (bosPage > bosTotalPages() - 1) bosPage = bosTotalPages() - 1;
  const i = bosPage - 1;
  if (bosPage === 0) drawBosOverview(px, py, pw, ph);
  else if (i < herbs.length) drawHerbPage(herbs[i], px, py, pw, ph);
  else if (i - herbs.length < crystals.length) drawCrystalPage(crystals[i - herbs.length], px, py, pw, ph);
  else if (i - herbs.length - crystals.length < creatures.length) drawCreaturePage(creatures[i - herbs.length - crystals.length], px, py, pw, ph);
  else drawAstroPage(astro[i - herbs.length - crystals.length - creatures.length], px, py, pw, ph);

  // page buttons
  for (const b of bosButtons()) {
    const on = (b.id === "prev" && bosPage > 0) || (b.id === "next" && bosPage < bosTotalPages() - 1) || b.id === "close";
    drawRect({ pos: vec2(b.x, b.y), width: b.w, height: b.h, radius: 6,
               color: on ? rgb(176, 150, 200) : rgb(90, 80, 96), opacity: on ? 1 : 0.5,
               outline: { color: rgb(120, 95, 150), width: 1 } });
    drawText({ text: b.label, pos: vec2(b.x + b.w / 2, b.y + b.h / 2), size: 11, font: hf(),
               color: rgb(30, 22, 38), anchor: "center" });
  }
  drawText({ text: "Page " + (bosPage + 1) + " / " + bosTotalPages(), pos: vec2(CANVAS_W / 2, CANVAS_H - 50),
             size: 10, font: hf(), color: rgb(210, 200, 225), anchor: "center" });
}

function drawBosOverview(px, py, pw, ph) {
  let y = py + 14, x = px + 16;
  drawText({ text: "Book of Shadows", pos: vec2(px + pw / 2, y), size: 20, font: hf(), color: rgb(96, 58, 110), anchor: "center" }); y += 26;
  drawText({ text: "Coin " + state.coin + "    Friendship " + state.friendship, pos: vec2(px + pw / 2, y),
             size: 13, font: hf(), color: rgb(74, 52, 34), anchor: "center" }); y += 18;
  drawText({ text: "Defense " + defense() + "    Mining " + (state.skills.mining || 0),
             pos: vec2(px + pw / 2, y), size: 12, font: hf(), color: rgb(96, 58, 110), anchor: "center" }); y += 22;
  drawText({ text: "Studies", pos: vec2(x, y), size: 15, font: hf(), color: rgb(96, 58, 110) }); y += 18;
  for (const id in SUBJECTS) {
    const lvl = state.skills[id] || 0;
    const dots = lvl ? "  " + "*".repeat(Math.min(lvl, 6)) : "";
    drawText({ text: SUBJECTS[id].name + dots, pos: vec2(x + 6, y), size: 13, font: hf(),
               color: lvl ? rgb(74, 52, 34) : rgb(150, 135, 110) }); y += 17;
  }
  y += 6;
  const studied = bosHerbPages().length;
  drawText({ text: "Herbal:  " + studied + " of " + HERB_ORDER.length + " plants studied.", pos: vec2(x, y),
             size: 13, font: hf(), color: rgb(96, 58, 110) }); y += 16;
  const stones = bosCrystalPages().length, beasts = bosCreaturePages().length, skies = bosAstroPages().length;
  drawText({ text: "Stones:  " + stones + " of " + CRYSTAL_ORDER.length + " · Beasts:  " + beasts + " of " + CREATURE_ORDER.length,
             pos: vec2(x, y), size: 13, font: hf(), color: rgb(96, 58, 110) }); y += 16;
  drawText({ text: "Heavens:  " + skies + " of " + ASTRO_ORDER.length + " charted.",
             pos: vec2(x, y), size: 13, font: hf(), color: rgb(96, 58, 110) }); y += 16;
  drawText({ text: (studied || stones || beasts || skies) ? "Turn the page for plants, stones, beasts & stars." : "Attend class to fill these pages.",
             pos: vec2(x, y), size: 12, font: hf(), color: rgb(74, 52, 34), width: pw - 28 });

  // autosave note + reset button
  drawText({ text: "Your progress saves automatically.", pos: vec2(px + pw / 2, 392), size: 10, font: hf(),
             color: rgb(120, 100, 80), anchor: "center" });
  const rb = resetBtn();
  drawRect({ pos: vec2(rb.x, rb.y), width: rb.w, height: rb.h, radius: 6,
             color: resetArmed ? rgb(150, 60, 55) : rgb(70, 50, 46),
             outline: { color: rgb(190, 90, 80), width: 1 } });
  drawText({ text: resetArmed ? "Tap again to confirm" : "Reset game",
             pos: vec2(rb.x + rb.w / 2, rb.y + rb.h / 2), size: 12, font: hf(),
             color: rgb(245, 220, 215), anchor: "center" });
}

function drawHerbPage(id, px, py, pw, ph) {
  const h = ITEMS[id];
  const x = px + 16, INK = rgb(74, 52, 34), HDR = rgb(96, 58, 110);
  let y = py + 16;
  drawText({ text: h.name, pos: vec2(px + pw / 2, y), size: 22, font: hf(), color: HDR, anchor: "center" }); y += 24;
  drawText({ text: h.botanical, pos: vec2(px + pw / 2, y), size: 12, font: hf(), color: INK, anchor: "center" }); y += 20;
  // framed illustration
  const iy = y + 30;
  drawRect({ pos: vec2(px + pw / 2, iy), width: 66, height: 66, anchor: "center", color: rgb(228, 214, 180),
             radius: 4, outline: { color: rgb(150, 120, 80), width: 2 } });
  if (ready(herbSprite(id))) drawSprite({ sprite: herbSprite(id), pos: vec2(px + pw / 2, iy), width: 56, height: 56, anchor: "center" });
  else drawRect({ pos: vec2(px + pw / 2, iy), width: 52, height: 52, anchor: "center", color: col(h.color), radius: 4 });
  y = iy + 44;
  drawText({ text: h.gender + "  ·  " + h.planet + "  ·  " + h.element, pos: vec2(px + pw / 2, y),
             size: 13, font: hf(), color: HDR, anchor: "center" }); y += 22;
  drawText({ text: "Powers:  " + h.powers.join(", "), pos: vec2(x, y), size: 13, font: hf(), color: INK, width: pw - 28, lineSpacing: 2 }); y += 30;
  drawText({ text: "Herbal:  " + h.herbal, pos: vec2(x, y), size: 13, font: hf(), color: INK, width: pw - 28, lineSpacing: 2 }); y += 44;
  if (HERB_MOON[id]) { drawText({ text: "Gather:  " + HERB_MOON[id] + " moon", pos: vec2(x, y), size: 13, font: hf(), color: HDR }); y += 20; }
  if (h.safety) { drawText({ text: "Caution:  " + h.safety, pos: vec2(x, y), size: 12, font: hf(), color: rgb(150, 70, 60), width: pw - 28, lineSpacing: 2 }); y += 34; }
  drawText({ text: '"' + h.lore + '"', pos: vec2(x, y), size: 13, font: hf(), color: rgb(96, 70, 110), width: pw - 28, lineSpacing: 2 });
}

function drawCrystalPage(id, px, py, pw, ph) {
  const c = ITEMS[id];
  const x = px + 16, INK = rgb(74, 52, 34), HDR = rgb(96, 58, 110);
  let y = py + 16;
  drawText({ text: c.name, pos: vec2(px + pw / 2, y), size: 22, font: hf(), color: HDR, anchor: "center" }); y += 24;
  drawText({ text: c.mineral, pos: vec2(px + pw / 2, y), size: 12, font: hf(), color: INK, anchor: "center" }); y += 20;
  // framed gemstone (colour chip — no sprite yet)
  const iy = y + 30;
  drawRect({ pos: vec2(px + pw / 2, iy), width: 66, height: 66, anchor: "center", color: rgb(228, 214, 180),
             radius: 4, outline: { color: rgb(150, 120, 80), width: 2 } });
  if (ready("item_" + id)) drawSprite({ sprite: "item_" + id, pos: vec2(px + pw / 2, iy), width: 56, height: 56, anchor: "center" });
  else drawRect({ pos: vec2(px + pw / 2, iy), width: 40, height: 40, anchor: "center", color: col(c.color), radius: 6,
                  outline: { color: rgb(255, 255, 255), width: 1 } });
  y = iy + 44;
  drawText({ text: c.element + "  ·  " + c.planet, pos: vec2(px + pw / 2, y), size: 13, font: hf(), color: HDR, anchor: "center" }); y += 18;
  drawText({ text: "Chakra:  " + c.chakra, pos: vec2(px + pw / 2, y), size: 12, font: hf(), color: INK, anchor: "center" }); y += 22;
  drawText({ text: "Powers:  " + c.powers.join(", "), pos: vec2(x, y), size: 13, font: hf(), color: INK, width: pw - 28, lineSpacing: 2 }); y += 30;
  drawText({ text: "Use:  " + c.uses, pos: vec2(x, y), size: 13, font: hf(), color: INK, width: pw - 28, lineSpacing: 2 }); y += 44;
  drawText({ text: '"' + c.lore + '"', pos: vec2(x, y), size: 13, font: hf(), color: rgb(96, 70, 110), width: pw - 28, lineSpacing: 2 });
}

function drawCreaturePage(id, px, py, pw, ph) {
  const c = CREATURES[id];
  const x = px + 16, INK = rgb(74, 52, 34), HDR = rgb(96, 58, 110);
  const approach = (APPROACHES.find((a) => a.id === c.calmWith) || {}).label || c.calmWith;
  let y = py + 16;
  drawText({ text: c.name, pos: vec2(px + pw / 2, y), size: 22, font: hf(), color: HDR, anchor: "center" }); y += 24;
  drawText({ text: c.tier === "spirit" ? "mine-spirit" : "mundane creature", pos: vec2(px + pw / 2, y), size: 12, font: hf(), color: INK, anchor: "center" }); y += 20;
  // portrait (PixelLab sprite when loaded, else placeholder colour block)
  const iy = y + 30;
  drawRect({ pos: vec2(px + pw / 2, iy), width: 66, height: 66, anchor: "center", color: rgb(228, 214, 180),
             radius: 4, outline: { color: rgb(150, 120, 80), width: 2 } });
  if (ready(id)) {
    drawSprite({ sprite: id, pos: vec2(px + pw / 2, iy), anchor: "center", width: 60, height: 60 });
  } else {
    drawRect({ pos: vec2(px + pw / 2, iy), width: 44, height: 44, anchor: "center", color: col(c.color), radius: 6,
               outline: { color: rgb(255, 255, 255), width: 1 } });
  }
  y = iy + 44;
  drawText({ text: "Settle it by:  " + approach, pos: vec2(x, y), size: 13, font: hf(), color: HDR, width: pw - 28, lineSpacing: 2 }); y += 30;
  if (c.drop) { drawText({ text: "Leaves:  " + (c.drop === "stone" ? "a bit of ore" : ITEMS[c.drop].name), pos: vec2(x, y), size: 13, font: hf(), color: INK }); y += 20; }
  drawText({ text: '"' + c.lore + '"', pos: vec2(x, y), size: 13, font: hf(), color: rgb(96, 70, 110), width: pw - 28, lineSpacing: 2 });
}

function drawAstroPage(id, px, py, pw, ph) {
  const a = ASTRONOMY[id];
  const x = px + 16, INK = rgb(74, 52, 34), HDR = rgb(96, 58, 110);
  let y = py + 16;
  drawText({ text: a.name, pos: vec2(px + pw / 2, y), size: 22, font: hf(), color: HDR, anchor: "center" }); y += 24;
  drawText({ text: a.sub, pos: vec2(px + pw / 2, y), size: 12, font: hf(), color: INK, anchor: "center", width: pw - 28 }); y += 20;
  // framed celestial illustration (reuses existing art; colour block fallback)
  const iy = y + 30;
  drawRect({ pos: vec2(px + pw / 2, iy), width: 66, height: 66, anchor: "center", color: rgb(228, 214, 180),
             radius: 4, outline: { color: rgb(150, 120, 80), width: 2 } });
  if (a.icon && ready(a.icon)) drawSprite({ sprite: a.icon, pos: vec2(px + pw / 2, iy), width: 56, height: 56, anchor: "center" });
  else drawRect({ pos: vec2(px + pw / 2, iy), width: 42, height: 42, anchor: "center", color: rgb(60, 64, 110), radius: 6,
                  outline: { color: rgb(220, 225, 255), width: 1 } });
  y = iy + 44;
  drawText({ text: "In the sky:  " + a.sky, pos: vec2(x, y), size: 13, font: hf(), color: INK, width: pw - 28, lineSpacing: 2 }); y += 44;
  drawText({ text: "In the craft:  " + a.craft, pos: vec2(x, y), size: 13, font: hf(), color: HDR, width: pw - 28, lineSpacing: 2 }); y += 48;
  drawText({ text: '"' + a.lore + '"', pos: vec2(x, y), size: 13, font: hf(), color: rgb(96, 70, 110), width: pw - 28, lineSpacing: 2 });
}

/* ============================================================================
   BREWING SCREEN — a dedicated view: the cauldron, an ingredient pantry you
   tap one item at a time, a grimoire to check the method, and a Brew button.
   ============================================================================ */
const pointIn = (m, b) => m.x >= b.x && m.x <= b.x + b.w && m.y >= b.y && m.y <= b.y + b.h;

// Build the tappable button list for the current brew screen state.
function brewButtons() {
  const btns = [];
  // heat control: three selectable flame levels
  ["low", "med", "high"].forEach((lv, i) => {
    btns.push({ kind: "heat", level: lv, x: 60 + i * 76, y: 190, w: 70, h: 22,
      label: { low: "Low", med: "Med", high: "High" }[lv],
      color: brewUI.heat === lv ? [255, 175, 75] : [150, 130, 120] });
  });
  // pantry: one button per available ingredient
  const items = pantry();
  items.forEach((it, i) => {
    const col = i % 2, rowi = Math.floor(i / 2);
    btns.push({
      kind: "add", id: it.id,
      x: 18 + col * 178, y: 248 + rowi * 36, w: 168, h: 30,
      label: ITEMS[it.id].name + (it.n === Infinity ? "" : "  x" + it.n),
      color: ITEMS[it.id].color,
    });
  });
  // action bar across the bottom
  const acts = [
    { kind: "grimoire", label: "Grimoire", color: [150, 130, 215] },
    { kind: "brew",     label: "Brew",     color: [120, 200, 120] },
    { kind: "empty",    label: "Empty",    color: [180, 120, 120] },
    { kind: "leave",    label: "Leave",    color: [120, 120, 140] },
  ];
  acts.forEach((a, i) => btns.push({ ...a, x: 14 + i * 90, y: 462, w: 84, h: 38 }));
  return btns;
}

function handleBrewTap(m) {
  if (brewUI.grimoireOpen) { brewUI.grimoireOpen = false; return; }  // tap closes grimoire
  for (const b of brewButtons()) {
    if (!pointIn(m, b)) continue;
    if (b.kind === "add")      brewAdd(b.id);
    else if (b.kind === "heat") { brewUI.heat = b.level; brewUI.msg = "Flame set to " + b.label.toLowerCase() + " (" + heatWord(b.level) + ")."; }
    else if (b.kind === "grimoire") brewUI.grimoireOpen = true;
    else if (b.kind === "brew")     brewAttempt();
    else if (b.kind === "empty")  { brewReturnContents(); brewUI.msg = "Cleared the cauldron."; }
    else if (b.kind === "leave")    brewLeave();
    return;
  }
}

// Flickering fire under the cauldron, sized to the heat level.
function drawFlames(cxp, baseY, heat) {
  const lvl = { low: 1, med: 2, high: 3 }[heat] || 0;
  if (!lvl) return;
  drawCircle({ pos: vec2(cxp, baseY + 4), radius: 16 + lvl * 5, color: rgb(255, 140, 50), opacity: 0.16 });
  const count = 2 + lvl * 2;
  for (let i = 0; i < count; i++) {
    const t = time() * 6 + i * 1.3;
    const fx = cxp + (i - (count - 1) / 2) * (10 + lvl * 2);
    const h = (8 + lvl * 7) * (0.7 + 0.3 * Math.sin(t));
    drawCircle({ pos: vec2(fx, baseY - h * 0.4), radius: 5 + lvl, color: rgb(240, 120, 40), opacity: 0.85 });
    drawCircle({ pos: vec2(fx, baseY - h * 0.55), radius: 3 + lvl * 0.6, color: rgb(255, 215, 95), opacity: 0.9 });
  }
}

// Average the colors of whatever is steeping, for the liquid tint.
function brewLiquidColor() {
  if (brewUI.contents.length === 0) return rgb(40, 50, 70);
  let r = 0, g = 0, b = 0;
  for (const id of brewUI.contents) { const c = ITEMS[id].color; r += c[0]; g += c[1]; b += c[2]; }
  const n = brewUI.contents.length;
  return rgb(r / n, g / n, b / n);
}

function drawBrew() {
  drawRect({ pos: vec2(0, 0), width: CANVAS_W, height: CANVAS_H, color: rgb(16, 14, 26), opacity: 0.97 });
  const cxm = CANVAS_W / 2, cauldY = 86;
  drawText({ text: "The Cauldron", pos: vec2(cxm, 14), size: 16, color: rgb(225, 215, 250), anchor: "center" });

  // bubble rate rises with the flame
  const bubbleSpeed = { low: 12, med: 24, high: 40 }[brewUI.heat] || 20;
  // cauldron body + bubbling liquid (sprite if supplied, else drawn pot)
  if (ready("cauldron_big")) {
    drawSprite({ sprite: "cauldron_big", pos: vec2(cxm, cauldY), width: 120, height: 120, anchor: "center" });
    drawCircle({ pos: vec2(cxm, cauldY - 8), radius: 30, color: brewLiquidColor(), opacity: 0.85 });
  } else {
    drawCircle({ pos: vec2(cxm, cauldY + 6), radius: 56, color: rgb(34, 30, 46) });
    drawCircle({ pos: vec2(cxm, cauldY), radius: 44, color: brewLiquidColor() });
  }
  for (let i = 0; i < brewUI.contents.length; i++) {       // bubbles (faster on higher heat)
    const a = time() * 2 + i * 1.7;
    drawCircle({ pos: vec2(cxm + Math.sin(a) * 22, (cauldY - 4) - ((time() * bubbleSpeed + i * 25) % 40)),
                 radius: 3, color: rgb(255, 255, 255), opacity: 0.4 });
  }
  drawFlames(cxm, cauldY + 58, brewUI.heat);               // fire beneath the pot

  // contents readout
  const contents = brewUI.contents.length
    ? brewUI.contents.map((id) => ITEMS[id].name).join(", ")
    : "(empty)";
  drawText({ text: "In the pot: " + contents, pos: vec2(cxm, 166), size: 10,
             color: rgb(220, 220, 240), anchor: "center", width: CANVAS_W - 24 });
  // heat control label (buttons drawn from brewButtons)
  drawText({ text: "Heat:", pos: vec2(18, 196), size: 11, color: rgb(255, 190, 120) });
  drawText({ text: brewUI.msg || "", pos: vec2(cxm, 222), size: 10,
             color: rgb(255, 230, 170), anchor: "center", width: CANVAS_W - 24 });
  drawText({ text: "Add an ingredient:", pos: vec2(18, 238), size: 10, color: rgb(180, 180, 205) });

  // buttons
  for (const b of brewButtons()) {
    drawRect({ pos: vec2(b.x, b.y), width: b.w, height: b.h, color: col(b.color, 0.85), radius: 6,
               outline: { color: col(b.color), width: 2 } });
    drawText({ text: b.label, pos: vec2(b.x + b.w / 2, b.y + b.h / 2), size: 11,
               color: rgb(20, 18, 28), anchor: "center" });
  }

  if (brewUI.grimoireOpen) drawGrimoire();
}

// The grimoire: rendered as an open book — a two-page parchment spread with a
// handwriting font, section tabs, framed illustrations and real correspondences.
const INK     = rgb(74, 52, 34);    // body handwriting
const INK_HDR = rgb(96, 58, 110);   // headings (faded violet ink)
const PARCH   = rgb(236, 224, 194); // page colour
const PARCH_D = rgb(214, 198, 162); // page shadow / ruled lines

// one small framed illustration (sprite if loaded, else a coloured chip)
// faint ruled lines to sell the "written page" look
function ruledLines(px, py, pw, ph) {
  for (let ly = py + 18; ly < py + ph - 6; ly += 16) {
    drawRect({ pos: vec2(px + 6, ly), width: pw - 12, height: 1, color: PARCH_D, opacity: 0.5 });
  }
}

// a page heading "tab"
function pageTab(px, py, pw, label) {
  drawRect({ pos: vec2(px + pw / 2, py - 8), width: 80, height: 18, anchor: "center",
             color: rgb(176, 150, 200), radius: 9, outline: { color: rgb(120, 95, 150), width: 1 } });
  drawText({ text: label, pos: vec2(px + pw / 2, py - 8), size: 12, font: hf(),
             color: rgb(40, 28, 48), anchor: "center" });
}

function drawGrimoire() {
  // dim the cauldron behind
  drawRect({ pos: vec2(0, 0), width: CANVAS_W, height: CANVAS_H, color: rgb(8, 6, 14), opacity: 0.6 });

  // leather book cover
  const bx = 10, by = 42, bw = CANVAS_W - 20, bh = CANVAS_H - 96;
  drawRect({ pos: vec2(bx, by), width: bw, height: bh, color: rgb(58, 34, 30), radius: 12,
             outline: { color: rgb(150, 120, 60), width: 3 } });

  // two parchment pages + centre spine
  const pad = 12, gap = 10;
  const pw = (bw - pad * 2 - gap) / 2, ph = bh - pad * 2;
  const lpx = bx + pad, rpx = lpx + pw + gap, py = by + pad;
  drawRect({ pos: vec2(lpx, py), width: pw, height: ph, color: PARCH, radius: 4 });
  drawRect({ pos: vec2(rpx, py), width: pw, height: ph, color: PARCH, radius: 4 });
  ruledLines(lpx, py, pw, ph);
  ruledLines(rpx, py, pw, ph);
  drawRect({ pos: vec2(CANVAS_W / 2 - 2, py), width: 4, height: ph, color: rgb(40, 24, 22), opacity: 0.55 });

  pageTab(lpx, py, pw, "Recipes");
  pageTab(rpx, py, pw, "Recipes");
  const known = RECIPE_ORDER.filter((rid) => state.knownRecipes[rid]);
  const ingName = (rid) => Object.entries(RECIPES[rid].needs)
    .map(([ing, q]) => (q > 1 ? q + "x " : "") + ITEMS[ing].name).join(" + ");

  if (!known.length) {
    drawText({ text: "These pages are still blank...", pos: vec2(CANVAS_W / 2, py + ph / 2 - 10),
               size: 14, font: hf(), color: INK, anchor: "center", width: bw - 60 });
    drawText({ text: "Learn recipes in Herbology & Potions.", pos: vec2(CANVAS_W / 2, py + ph / 2 + 12),
               size: 13, font: hf(), color: INK, anchor: "center", width: bw - 60 });
  } else {
    // two columns, recipes flow down then across
    const cols = [{ x: lpx + 12, w: pw - 20 }, { x: rpx + 12, w: pw - 20 }];
    const perCol = Math.ceil(known.length / 2);
    known.forEach((rid, i) => {
      const c = cols[Math.floor(i / perCol)] || cols[1];
      let y = py + 14 + (i % perCol) * 64;
      const r = RECIPES[rid];
      drawText({ text: r.name, pos: vec2(c.x, y), size: 14, font: hf(), color: INK_HDR, width: c.w, lineSpacing: 1 }); y += 18;
      drawText({ text: ingName(rid), pos: vec2(c.x, y), size: 12, font: hf(), color: INK, width: c.w, lineSpacing: 1 }); y += 17;
      drawText({ text: r.does, pos: vec2(c.x, y), size: 12, font: hf(), color: rgb(96, 70, 110), width: c.w, lineSpacing: 1 });
    });
  }

  drawText({ text: "(tap anywhere to close)", pos: vec2(CANVAS_W / 2, CANVAS_H - 42),
             size: 11, font: hf(), color: rgb(210, 200, 225), anchor: "center" });
}
