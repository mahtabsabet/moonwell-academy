/* ============================================================================
   GAME DATA & RULES — config tables plus the small pure helpers that operate on
   them. Extracted from index.html and loaded via <script src="data.js"> before
   the game script. Classic script, so its top-level declarations (TILE, ITEMS,
   ROOMS, RECIPES, CREATURES, SUBJECTS, lunar helpers, ...) are visible to the
   game script that follows. A few helpers here reference runtime symbols defined
   in the game script (state, firstOfKind, startDialogue); those resolve at call
   time via the shared global scope. Edit tables here to expand the game.
   ============================================================================ */
/* ---------- Layout constants ---------- */
const TILE     = 32;        // pixel size of one grid tile
const GW       = 12;        // grid width  (tiles)  -> 12 * 32 = 384 px
const GH       = 12;        // grid height (tiles)  -> 12 * 32 = 384 px
const ORIGIN_Y = 64;        // HUD strip occupies the top 64 px
const CANVAS_W = GW * TILE;             // 384
const CANVAS_H = ORIGIN_Y + GH * TILE + 64;  // 64 + 384 + 64 = 512
const SPEED    = 150;       // player walk speed in px/sec
const PLAYER_H    = 52;     // on-screen player HEIGHT in px (~1.6 tiles tall)
const PLAYER_AR   = 0.45;   // sprite aspect (width / height) of the witch walk frames
const PROP_DRAW   = 42;     // on-screen prop size in px (drawn near native, crisp)
const CHAR_KINDS  = new Set(["teacher", "shop", "friend",       // drawn as tall characters
  "t_potions", "t_astronomy", "t_divination", "t_crystals", "t_spellcraft", "t_kitchen", "t_creatures"]);

/* Room floor/wall tiles are shared by theme so similar rooms reuse one tileset.
   The renderer looks up floor_<theme>/wall_<theme>; rooms not listed here use
   their own id as the theme (dorm, greenhouse, village, divination, kitchen,
   infirmary, observatory, mine). */
const TILE_THEME = {
  courtyard: "academy", academy: "academy",
  potions: "class", crystals: "class", spellcraft: "class",
  creatures: "greenhouse", garden: "greenhouse",
  market: "village",
  furnishings: "shop", gem_shop: "shop", seed_shop: "shop", tools_shop: "shop", fruit_shop: "shop",
};

/* ---------- Items (herbs, brewing bases + potions) ----------
   kind: "herb" | "base" | "potion". sell: coin value. color: [r,g,b].
   Herb records double as the Year-One Herbology curriculum: correspondences
   (gender/planet/element/powers), practical herbal use, a safety note, an
   illustrated Book of Shadows lore line, and the lesson Prof. Sage teaches.
   See docs/curriculum-herbology.md for sources. HERB_ORDER sets the teaching
   order; learning a herb adds its Book of Shadows page. */
const ITEMS = {
  lavender: {
    name: "Lavender", kind: "herb", color: [150, 130, 215],
    botanical: "Lavandula angustifolia",
    gender: "Masculine", planet: "Mercury", element: "Air",
    powers: ["peace", "sleep", "purification", "love"],
    uses: "Calm, peace, restful sleep",
    herbal: "Calming tea; a sprig-stuffed sleep pillow; dried bundles as cleansing incense.",
    safety: "",
    lore: "Pick lavender for a quiet mind. Steep it for calm, burn it for clean air, tuck it beneath your pillow for kind dreams.",
    lesson: [
      { s: "Prof. Sage", t: "We begin with Lavender — Lavandula angustifolia. Element Air, planet Mercury." },
      { s: "Prof. Sage", t: "Air and Mercury rule the mind, so lavender soothes anxious thought and gives restful sleep." },
      { s: "Prof. Sage", t: "Steep it for calm, burn it to cleanse a room, tuck a sprig beneath your pillow for kind dreams." },
      { s: "Prof. Sage", t: "I've noted the Lavender Calm Tonic in your book — forage a sprig and brew it in Potions." },
    ],
  },
  basil: {
    name: "Basil", kind: "herb", color: [90, 170, 90],
    botanical: "Ocimum basilicum",
    gender: "Masculine", planet: "Mars", element: "Fire",
    powers: ["protection", "prosperity", "love", "courage"],
    herbal: "Hung at the door to protect; a leaf where money passes to draw custom; culinary warmth.",
    safety: "Culinary-safe; medicinal amounts best avoided in pregnancy.",
    lore: "Basil guards the door and fills the purse. Keep a leaf where money passes, and a sprig where you wish to be safe.",
    lesson: [
      { s: "Prof. Sage", t: "Basil next — Ocimum basilicum. A herb of Mars and Fire, all forward motion." },
      { s: "Prof. Sage", t: "Hang it at the door for protection; keep a leaf where money passes to draw prosperity." },
      { s: "Prof. Sage", t: "Fiery herbs push: basil lends courage to love and warmth to a home." },
    ],
  },
  mint: {
    name: "Mint", kind: "herb", color: [120, 200, 150],
    botanical: "Mentha spp.",
    gender: "Masculine", planet: "Mercury", element: "Air",
    powers: ["prosperity", "healing", "purification", "clarity"],
    herbal: "A leaf in the purse for money; a settling digestive tea; a brisk purifying wash.",
    safety: "Culinary-safe; peppermint oil may aggravate reflux in some. (Sources vary: peppermint leans Fire, spearmint Venus/Water.)",
    lore: "Mint moves things along — coin, words, and stale air alike. Carry a leaf to keep abundance flowing.",
    lesson: [
      { s: "Prof. Sage", t: "Mint — quick-growing and Mercurial, an Air herb of the swift mind." },
      { s: "Prof. Sage", t: "A leaf in the purse keeps coin flowing; a brisk tea clears the head and settles the stomach." },
      { s: "Prof. Sage", t: "Where mint spreads, things move along — money, words, and stale air alike." },
    ],
  },
  mugwort: {
    name: "Mugwort", kind: "herb", color: [140, 150, 120],
    botanical: "Artemisia vulgaris",
    gender: "Feminine", planet: "Venus (lunar)", element: "Earth",
    powers: ["prophetic dreams", "divination", "psychic power", "protection"],
    herbal: "A dream-pillow for prophetic dreams; incense before divination; weak tea for dream recall.",
    safety: "Avoid in pregnancy (emmenagogue); caution with ragweed allergy. Use small amounts.",
    lore: "Mugwort lifts the veil. Burn it before the cards, or sleep upon it to dream true — but never while carrying a child.",
    lesson: [
      { s: "Prof. Sage", t: "Mugwort — Artemisia, named for the moon-goddess Artemis. The diviner's herb." },
      { s: "Prof. Sage", t: "Burn it before the cards, or sleep upon it to dream true; it lifts the veil." },
      { s: "Prof. Sage", t: "But take care — never give mugwort to one who is carrying a child." },
    ],
  },
  dandelion: {
    name: "Dandelion", kind: "herb", color: [240, 210, 80],
    botanical: "Taraxacum officinale",
    gender: "Masculine", planet: "Jupiter", element: "Air",
    powers: ["divination", "wishes", "luck", "spirit-calling"],
    herbal: "Root tea to aid divination; blow the seed-clock to send a wish; nutritive spring greens.",
    safety: "Food-safe; mild diuretic. Caution if allergic to related daisies.",
    lore: "Dandelion answers questions and carries wishes. Brew the root to see further; blow the seeds to send your hope on the wind.",
    lesson: [
      { s: "Prof. Sage", t: "Dandelion — a little oracle of Jupiter and Air, sacred to Hecate." },
      { s: "Prof. Sage", t: "Brew the root to see further; blow the seed-clock to send a wish upon the wind." },
      { s: "Prof. Sage", t: "Its bitter greens cleanse the body, too — nothing in this plant is wasted." },
    ],
  },
  rose: {
    name: "Rose", kind: "herb", color: [225, 120, 150],
    botanical: "Rosa spp.",
    gender: "Feminine", planet: "Venus", element: "Water",
    powers: ["love", "healing", "psychic power", "divination"],
    herbal: "Petals in love and comfort magic; rosewater to anoint the brow for clearer sight; a soothing bath.",
    safety: "Gentle; use unsprayed, food-grade petals.",
    lore: "Rose opens the heart and the inner eye. Add petals to a bath for ease, or rosewater to your scrying for a softer sight.",
    lesson: [
      { s: "Prof. Sage", t: "Rose — the flower of Venus and the heart. Water, emotion, and gentle sight." },
      { s: "Prof. Sage", t: "Petals for love and comfort; rosewater to anoint the brow and clear the inner eye." },
      { s: "Prof. Sage", t: "A handful in the bath eases the mind as surely as any tonic." },
    ],
  },
  rosemary: {
    name: "Rosemary", kind: "herb", color: [110, 150, 120],
    botanical: "Salvia rosmarinus",
    gender: "Masculine", planet: "Sun", element: "Fire",
    powers: ["protection", "purification", "memory", "love"],
    herbal: "Protective sprigs at the door; a memory-and-focus tonic; cleansing baths.",
    safety: "Culinary-safe; medicinal amounts best avoided in pregnancy.",
    lore: "Rosemary remembers and guards. Hang it at the door, or carry it for protection and a clear, sharp mind.",
    lesson: [
      { s: "Prof. Sage", t: "Rosemary — Salvia rosmarinus. A herb of the Sun and Fire, strong and protective." },
      { s: "Prof. Sage", t: "It guards a home and sharpens memory; 'rosemary for remembrance,' as they say." },
      { s: "Prof. Sage", t: "Sealed with salt in a bottle, it makes a powerful ward to carry against harm." },
    ],
  },
  spring_water: {
    name: "Spring Water",
    kind: "base",
    color: [120, 180, 230],
    lore: "Fresh, living water — the base of any gentle tonic.",
  },
  salt: {
    name: "Salt", kind: "base", color: [232, 232, 238],
    lore: "The oldest protection — salt wards, cleanses, and seals.",
  },
  oil: {
    name: "Oil", kind: "base", color: [225, 195, 110],
    lore: "A gentle carrier oil — the base for anointing oils.",
  },
  lavender_calm_tonic: {
    name: "Calm Tonic", fullName: "Lavender Calm Tonic", kind: "potion",
    color: [185, 145, 255], sell: 25,
    lore: "A soft violet brew that quiets a restless mind.",
  },
  mugwort_dream_tea: {
    name: "Dream Tea", fullName: "Mugwort Dream Tea", kind: "potion",
    color: [150, 150, 118], sell: 30,
    lore: "Steeped just below a boil — it opens the gate to vivid, prophetic dreams.",
  },
  basil_wash: {  // legacy: no longer craftable, kept so old saves still display it
    name: "Floor Wash", fullName: "Basil Floor Wash", kind: "potion",
    color: [110, 170, 95], sell: 22,
    lore: "Simmered basil to cleanse and protect — wash from the back of the home to the front.",
  },
  prosperity_oil: {
    name: "Prosperity Oil", fullName: "Prosperity Oil", kind: "potion",
    color: [150, 200, 120], sell: 35,
    lore: "Basil warmed into oil — anoint coins, candles, or your door to draw money and custom.",
  },
  mint_wash: {
    name: "Cleansing Wash", fullName: "Mint Cleansing Wash", kind: "potion",
    color: [120, 200, 150], sell: 22,
    lore: "Brisk mint, simmered — wash to purify a space, a tool, or yourself.",
  },
  rose_love_oil: {
    name: "Love Oil", fullName: "Rose Love Oil", kind: "potion",
    color: [230, 140, 160], sell: 30,
    lore: "Rose petals warmed gently into oil — anoint yourself for love and comfort, or gift it.",
  },
  witch_bottle: {
    name: "Witch's Bottle", fullName: "Witch's Bottle", kind: "potion",
    color: [90, 78, 100], sell: 20, defense: 5,
    lore: "Salt and rosemary sealed in glass — carried as a ward; turns harm aside. (+defense)",
  },
  wishing_brew: {
    name: "Seer's Tea", fullName: "Dandelion Seer's Tea", kind: "potion",
    color: [240, 210, 90], sell: 40,
    lore: "Dandelion root in moon water — sip for divination and clear sight, or leave it steaming by the bed to call spirits.",
  },
  moon_water: {
    name: "Moon Water", kind: "base", color: [190, 200, 235],
    lore: "Spring water charged under the full moon — potent for divination.",
  },

  // ---- Crystals & Lithomancy (taught one at a time by Prof. Beryl) ----
  amethyst: {
    name: "Amethyst", kind: "stone", color: [150, 110, 205], sell: 18,
    mineral: "Quartz (purple)", element: "Air", planet: "Jupiter", chakra: "Third Eye & Crown",
    powers: ["calm", "intuition", "protection", "dreams"],
    uses: "Keep by the bed for calm sleep & dream recall. Cleanse in moonlight, never in sun.",
    lore: "Amethyst quiets a racing mind and opens the inner eye.",
    lesson: [
      { s: "Prof. Beryl", t: "We begin with Amethyst — purple quartz, a stone of Jupiter and the airy mind." },
      { s: "Prof. Beryl", t: "It calms a racing head, deepens intuition, and guards sleep — keep it by the bed." },
      { s: "Prof. Beryl", t: "Cleanse it in moonlight; leave it in the sun and its purple will fade." },
    ],
  },
  clear_quartz: {
    name: "Clear Quartz", kind: "stone", color: [220, 226, 238], sell: 12,
    mineral: "Quartz", element: "All", planet: "Sun", chakra: "All (Crown)",
    powers: ["amplify", "clarity", "healing"],
    uses: "Set an intention into it to amplify any working; cleanse it often.",
    lore: "The master crystal — it clears the mind and magnifies whatever you give it.",
    lesson: [
      { s: "Prof. Beryl", t: "Clear Quartz — the master crystal, clear as water, working with every chakra." },
      { s: "Prof. Beryl", t: "It amplifies whatever intention you set into it, and lends clarity and direction." },
      { s: "Prof. Beryl", t: "Programme it by holding it and naming your purpose; cleanse it often, for it takes on all it touches." },
    ],
  },
  rose_quartz: {
    name: "Rose Quartz", kind: "stone", color: [236, 165, 185], sell: 16,
    mineral: "Quartz (pink)", element: "Water", planet: "Venus", chakra: "Heart",
    powers: ["love", "self-love", "compassion", "healing"],
    uses: "Carry or keep by the bed for love, self-compassion, and easing grief.",
    lore: "The heart stone — gentle love, self-compassion, emotional healing.",
    lesson: [
      { s: "Prof. Beryl", t: "Rose Quartz — the heart stone, soft pink, ruled by Venus and Water." },
      { s: "Prof. Beryl", t: "It opens the heart to love — and first of all to self-compassion and healing." },
      { s: "Prof. Beryl", t: "Carry it, or set it by your bed, to soften grief and invite gentle love." },
    ],
  },
  citrine: {
    name: "Citrine", kind: "stone", color: [242, 200, 92], sell: 20,
    mineral: "Quartz (golden)", element: "Fire", planet: "Sun", chakra: "Solar Plexus",
    powers: ["abundance", "confidence", "joy"],
    uses: "Carry to draw money & confidence; the merchant's stone.",
    lore: "Sunlight caught in stone — draws abundance, confidence, and good cheer.",
    lesson: [
      { s: "Prof. Beryl", t: "Citrine — sunlight in stone, golden and warm, a stone of the Sun and Fire." },
      { s: "Prof. Beryl", t: "It draws abundance and confidence and lifts the spirits — the merchant's stone." },
      { s: "Prof. Beryl", t: "True citrine is rare; much that's sold is heated amethyst. Learn to tell them apart." },
    ],
  },
  black_tourmaline: {
    name: "Black Tourmaline", kind: "stone", color: [62, 58, 74], sell: 15,
    mineral: "Schorl (tourmaline)", element: "Earth", planet: "Saturn", chakra: "Root",
    powers: ["protection", "grounding", "banishing"],
    uses: "Keep by the door or carry it; it absorbs negativity. Cleanse often.",
    lore: "A shield in stone — grounds you and turns away negativity.",
    lesson: [
      { s: "Prof. Beryl", t: "Black Tourmaline — a dark, grounding stone of Saturn and Earth; your shield." },
      { s: "Prof. Beryl", t: "It absorbs and turns away negativity, and roots you when the world feels unsteady." },
      { s: "Prof. Beryl", t: "Keep it at the door or carry it — but cleanse it often, for it holds what it takes in." },
    ],
  },
  moonstone: {
    name: "Moonstone", kind: "stone", color: [202, 212, 236], sell: 22,
    mineral: "Feldspar", element: "Water", planet: "Moon", chakra: "Crown & Third Eye",
    powers: ["intuition", "new beginnings", "balance"],
    uses: "Charge under the full moon; for intuition and steadiness through change.",
    lore: "Moonlight made solid — for intuition, new beginnings, and the tides of feeling.",
    lesson: [
      { s: "Prof. Beryl", t: "Moonstone — pale and shimmering, ruled by the Moon and the tides of Water." },
      { s: "Prof. Beryl", t: "It heightens intuition, eases new beginnings, and steadies the emotions through change." },
      { s: "Prof. Beryl", t: "Charge it under the full moon, to which it is kin." },
    ],
  },

  // ---- Market goods (bought in the village shops; flavour + future use) ----
  apple:       { name: "Apple",       kind: "fruit", color: [200, 70, 70],  cost: 4,  sell: 2, restore: { energy: 15 }, lore: "Crisp apple — a quick bite of energy; love and abundance in kitchen witchery." },
  lemon:       { name: "Lemon",       kind: "fruit", color: [235, 220, 90], cost: 4,  sell: 2, restore: { energy: 12 }, lore: "Lemon — a sharp little lift; for cleansing and bright clarity." },
  pomegranate: { name: "Pomegranate", kind: "fruit", color: [170, 50, 60],  cost: 8,  sell: 4, restore: { energy: 22 }, lore: "Pomegranate — hearty energy; prosperity, fertility, and underworld mysteries." },
  health_potion: { name: "Health Draught", kind: "remedy", color: [220, 80, 90], cost: 22, sell: 10, restore: { health: 45 }, lore: "A red restorative — drink to mend your health." },
  energy_potion: { name: "Energy Tonic",   kind: "remedy", color: [90, 170, 220], cost: 18, sell: 8,  restore: { energy: 40 }, lore: "A bright tonic — drink to restore your energy." },
  // ---- Furniture: bought at Furnishings, placed in your dorm (Decorate). ----
  // `sprite` reuses real decor art where we have it; keys we haven't drawn yet
  // render as a tidy placeholder (a coloured prop) until a PNG is dropped in.
  // `flat` lies on the floor; `wall` hangs on a wall tile. The altar tools &
  // wall charms are grounded in real witchcraft (see docs/altar-and-decor.md).
  // -- Homely furnishings --
  deco_rug:       { name: "Woven Rug",     kind: "furniture", sprite: "rug",          flat: true, cost: 35, color: [150, 120, 165], lore: "A soft rug to warm the floorboards." },
  deco_table:     { name: "Table",         kind: "furniture", sprite: "desk",         cost: 45, color: [140, 110, 80],  lore: "A sturdy table for books and brewing." },
  deco_bookshelf: { name: "Bookshelf",     kind: "furniture", sprite: "bookshelf",    cost: 55, color: [120, 90, 60],   lore: "Shelves for your growing library." },
  deco_plant:     { name: "Potted Plant",  kind: "furniture", sprite: "pots",         cost: 30, color: [120, 160, 90],  lore: "A little green company for the room." },
  deco_lantern:   { name: "Lantern",       kind: "furniture", sprite: "lantern",      cost: 25, color: [230, 200, 120], lore: "Warm light for cosy evenings." },
  deco_barrel:    { name: "Barrel",        kind: "furniture", sprite: "barrel",       cost: 18, color: [150, 110, 70],  lore: "Rustic storage for odds and ends." },
  deco_orb:       { name: "Crystal Ball",  kind: "furniture", sprite: "crystal_ball", cost: 65, color: [160, 140, 210], lore: "A scrying globe for quiet gazing." },
  deco_telescope: { name: "Telescope",     kind: "furniture", sprite: "telescope",    cost: 80, color: [150, 160, 200], lore: "Bring the night sky indoors." },
  // -- Altar tools (real Wiccan / folk craft) --
  deco_altarcloth:{ name: "Altar Cloth",   kind: "furniture", sprite: "altar_cloth",    flat: true, cost: 22, color: [120, 90, 150],  lore: "Cloth that marks out your working surface." },
  deco_pentacle:  { name: "Pentacle",      kind: "furniture", sprite: "pentacle",       flat: true, cost: 28, color: [170, 150, 90],  lore: "An Earth-element disc for consecrating tools and offering protection." },
  deco_chalice:   { name: "Chalice",       kind: "furniture", sprite: "chalice",        cost: 26, color: [180, 170, 110], lore: "The ritual cup — element of Water, for blessings and offerings." },
  deco_athame:    { name: "Athame",        kind: "furniture", sprite: "athame",         cost: 30, color: [150, 160, 175], lore: "A ritual blade for directing energy (Fire in Gardnerian craft, Air in others)." },
  deco_wand:      { name: "Wand",          kind: "furniture", sprite: "wand",           cost: 24, color: [140, 110, 80],  lore: "A wand to direct will and energy — often Fire (or Air)." },
  deco_censer:    { name: "Incense Burner",kind: "furniture", sprite: "censer",         cost: 20, color: [150, 140, 160], lore: "A censer — element of Air; its smoke cleanses the space and welcomes spirits." },
  deco_besom:     { name: "Besom",         kind: "furniture", sprite: "besom",          cost: 24, color: [160, 140, 90],  lore: "The witch's broom, swept above the floor to clear out stale energy before a rite." },
  deco_bell:      { name: "Ritual Bell",   kind: "furniture", sprite: "bell",           cost: 18, color: [200, 180, 110], lore: "Rung to clear stagnant energy and mark the turns of a rite." },
  deco_cauldron:  { name: "Cauldron",      kind: "furniture", sprite: "cauldron",       cost: 40, color: [70, 70, 80],    lore: "A small cauldron — vessel of transformation." },
  deco_mirror:    { name: "Scrying Mirror",kind: "furniture", sprite: "scrying_mirror", cost: 45, color: [60, 60, 80],    lore: "A dark mirror for scrying, after John Dee's obsidian glass." },
  deco_salt:      { name: "Salt Dish",     kind: "furniture", sprite: "salt_dish",      cost: 12, color: [220, 220, 230], lore: "A dish of salt for cleansing and casting protective circles." },
  deco_offering:  { name: "Offering Bowl", kind: "furniture", sprite: "offering_bowl",  cost: 14, color: [170, 140, 110], lore: "A bowl to leave food or flowers for the spirits you keep." },
  // -- Wall hangings & charms --
  deco_moonphases:{ name: "Moon Phase Hanging", kind: "furniture", sprite: "moon_phases",     wall: true, cost: 30, color: [200, 205, 230], lore: "The lunar cycle, charted on your wall." },
  deco_tapestry:  { name: "Celestial Tapestry", kind: "furniture", sprite: "tapestry",        wall: true, cost: 50, color: [110, 90, 160],  lore: "Sun, moon and stars woven into cloth." },
  deco_herbs:     { name: "Drying Herbs",       kind: "furniture", sprite: "herb_bundle",     wall: true, cost: 16, color: [120, 150, 90],  lore: "Bundles of garden herbs hung to dry for cooking, brewing, and smoke-cleansing." },
  deco_wreath:    { name: "Protective Wreath",  kind: "furniture", sprite: "wreath",          wall: true, cost: 22, color: [90, 150, 100],  lore: "A woven ring of herbs and greenery to guard the threshold." },
  deco_horseshoe: { name: "Horseshoe",          kind: "furniture", sprite: "horseshoe",       wall: true, cost: 15, color: [180, 180, 190], lore: "Hung ends-up to hold the luck in (some say ends-down to pour it out)." },
  deco_ladder:    { name: "Witch's Ladder",     kind: "furniture", sprite: "witch_ladder",    wall: true, cost: 28, color: [150, 130, 100], lore: "A knotted cord strung with feathers — woven intentions, after the Wellington charm of 1878." },
  deco_botanical: { name: "Pressed Botanical",  kind: "furniture", sprite: "botanical_frame", wall: true, cost: 20, color: [150, 170, 120], lore: "Pressed flowers and herbs framed under glass." },
  deco_starchart: { name: "Star Chart",         kind: "furniture", sprite: "star_chart",      wall: true, cost: 24, color: [120, 130, 180], lore: "A framed map of the night sky." },
  candle:      { name: "Candle",      kind: "tool",  color: [240, 230, 180], cost: 5,  sell: 2, lore: "A spell candle — burn it dressed to your intent." },
  pendulum:    { name: "Pendulum",    kind: "tool",  color: [150, 150, 175], cost: 18, sell: 8, lore: "A pendulum — dowse for yes-or-no answers." },
  tarot_deck:  { name: "Tarot Deck",  kind: "tool",  color: [120, 90, 160],  cost: 25, sell: 12, lore: "Seventy-eight cards for divination and reflection." },
  wand:        { name: "Wand",        kind: "tool",  color: [150, 110, 70],  cost: 30, sell: 14, lore: "A wand of hazel — directs and focuses your will." },
  flute:       { name: "Flute",       kind: "tool",  color: [200, 170, 110], cost: 20, sell: 9,  lore: "A simple flute — like the piper of old, its tune charms rats and calms restless beasts." },
  pickaxe:     { name: "Pickaxe",     kind: "tool",  color: [150, 140, 150], cost: 25, sell: 10, lore: "An iron pickaxe — for working ore in the mines." },
  // creature materials (calmed mine-dwellers leave these behind)
  spider_silk: { name: "Spider Silk", kind: "material", color: [212, 212, 222], sell: 8, lore: "Fine cave-spider silk — for weaving charms and bindings." },
  beeswax:     { name: "Beeswax",     kind: "material", color: [236, 206, 120], sell: 6, lore: "Wax from a wasp comb — for candles and seals." },
};

// Order Prof. Beryl teaches the stones; each Crystals lesson adds a Book of
// Shadows page and a sample stone to your bag.
const CRYSTAL_ORDER = ["amethyst", "clear_quartz", "rose_quartz", "citrine", "black_tourmaline", "moonstone"];

// Furniture catalogue order (homely → altar tools → wall hangings), used by
// the Furnishings shop and the dorm Decorate palette.
const DECOR_ORDER = [
  "deco_rug", "deco_table", "deco_bookshelf", "deco_plant", "deco_lantern", "deco_barrel", "deco_orb", "deco_telescope",
  "deco_altarcloth", "deco_pentacle", "deco_chalice", "deco_athame", "deco_wand", "deco_censer", "deco_besom", "deco_bell", "deco_cauldron", "deco_mirror", "deco_salt", "deco_offering",
  "deco_moonphases", "deco_tapestry", "deco_herbs", "deco_wreath", "deco_horseshoe", "deco_ladder", "deco_botanical", "deco_starchart",
];

/* ---------- Village shops ----------
   Each shop's keeper opens a browse/buy panel. `seeds:true` lists seed packets
   for herbs you've studied; `buy` lists fixed goods (price from item.cost, or
   2x its sell value); `sellKinds` are the item kinds the shop will buy from you. */
const SHOPS = {
  general: { name: "Trading Post",   buy: ["health_potion", "energy_potion"], sellKinds: ["herb", "potion", "stone", "fruit", "tool", "material", "remedy"] },
  gem:     { name: "Gem Shop",       buy: ["amethyst", "clear_quartz", "rose_quartz", "citrine", "black_tourmaline", "moonstone"], sellKinds: ["stone"] },
  seed:    { name: "Seed & Garden",  seeds: true, buy: ["apple", "lemon", "pomegranate"], sellKinds: ["fruit"] },
  tools:   { name: "Magical Tools",  buy: ["pickaxe", "flute", "candle", "pendulum", "tarot_deck", "wand"], sellKinds: ["tool"] },
  fruit:   { name: "Fruit Stall",    buy: ["apple", "lemon", "pomegranate"], sellKinds: ["fruit"] },
  infirmary: { name: "Infirmary",    buy: ["health_potion", "energy_potion"], sellKinds: ["remedy"] },
  furnishings: { name: "Furnishings", buy: DECOR_ORDER, sellKinds: [] },
};
const buyCost = (id) => ITEMS[id].cost != null ? ITEMS[id].cost : (ITEMS[id].sell != null ? ITEMS[id].sell * 2 : 10);

/* ---------- The Mines ----------
   Ore nodes you work with a pickaxe; each yields a random stone (commoner stones
   weighted higher; a higher Mining skill improves the odds of rarer ones). Nodes
   deplete and regrow over ORE_REGROW days, like greenhouse pots. */
const MINE_NODES = [[2, 3], [5, 3], [8, 3], [3, 7], [7, 7]];
const ORE_PER = 3;
const ORE_REGROW = 4;
const ORE_TABLE = [   // [crystal id, base weight]
  ["clear_quartz", 30], ["amethyst", 24], ["rose_quartz", 20],
  ["citrine", 12], ["black_tourmaline", 9], ["moonstone", 5],
];

/* ---------- Mine creatures (no combat — purely defensive) ----------
   While mining, a creature may appear. You never fight: you Soothe, Frost, or
   Ward to settle it (then keep mining), or Back away (safe, but no ore). Each
   creature has a preferred response; the right one also leaves a small gift.
   `drop:"stone"` means the calmed creature shows you a bit of ore. */
// Defensive responses. `needs` approaches only appear when you carry the item
// (and consume one). No "attack" exists.
const APPROACHES = [
  { id: "soothe",  label: "Soothe — a calm, low hum", magic: true },
  { id: "flute",   label: "Play a flute", needsItem: "flute" },           // kept, not consumed
  { id: "frost",   label: "Frost — chill the air to slow them", magic: true },
  { id: "ward",    label: "Ward — raise a protective shield", magic: true },
  { id: "offer",   label: "Offer food (give a fruit)", needsKind: "fruit" }, // consumes a fruit
  { id: "light",   label: "Light a candle", needsItem: "candle" },           // consumes a candle
  { id: "retreat", label: "Back away (no ore)" },
];
const approachAvailable = (a) => a.needsItem ? (state.inv[a.needsItem] || 0) > 0
  : (a.needsKind ? !!firstOfKind(a.needsKind) : true);
// Bestiary, taught one at a time in Magical Creatures class. `calmWith` is the
// response that settles it (and leaves a gift); studying reveals it in encounters.
const CREATURES = {
  cave_spider: { name: "Cave Spider", tier: "mundane", color: [120, 105, 90], calmWith: "ward", drop: "spider_silk",
    appear: "A cave spider drops down on a silken thread!",
    best: "You raise a shield; it loses interest and leaves a strand of silk.", ok: "You shoo it back into the dark.",
    lore: "A big but timid cave spider. Stand firm behind a ward and it yields silk.",
    lesson: [{ s: "Keeper Fenn", t: "Cave spiders are shy despite their size — ward yourself and they leave you (and a little silk) be." }] },
  rat: { name: "Cave Rat", tier: "mundane", color: [130, 120, 108], calmWith: "flute", drop: "stone",
    appear: "Rats skitter out, whiskers twitching.",
    best: "You play a tune; like the piper of old, they fall in line and lead you to ore.", ok: "They startle and dart away.",
    lore: "Nervous, not malicious. A flute charms them — as the old piper charmed the rats — and they'll show you ore.",
    lesson: [{ s: "Keeper Fenn", t: "Cave rats won't be reasoned with — but a flute charms them, just as the piper of old led the rats away. Never go down without one." }] },
  wasps: { name: "Wasp Swarm", tier: "mundane", color: [214, 192, 74], calmWith: "frost", drop: "beeswax",
    appear: "A wasp swarm lifts off, buzzing crossly!",
    best: "You chill the air; they slow, settle, and leave a comb of wax.", ok: "You wave them off and they drift away.",
    lore: "All heat and motion. Chill the air and they slow and settle.",
    lesson: [{ s: "Keeper Fenn", t: "A wasp swarm is all heat and motion — chill the air and they slow right down." }] },
  knocker: { name: "Knocker", tier: "spirit", color: [150, 130, 110], calmWith: "offer", drop: "stone",
    appear: "A knocking echoes — a wrinkled little mine-spirit peers out!",
    best: "You leave it a bite of food; it knocks you toward a rich seam.", ok: "It grumbles and raps the walls.",
    lore: "A Cornish mine-spirit. It knocks to warn of cave-ins and leads the worthy to ore — leave it food, and never whistle.",
    lesson: [
      { s: "Keeper Fenn", t: "Knockers are Cornish mine-spirits — they knock to warn of collapse and lead good folk to rich veins." },
      { s: "Keeper Fenn", t: "Leave them the last bite of your food, as the old miners did, and never whistle or curse near them." }] },
  will_o_wisp: { name: "Will-o'-the-Wisp", tier: "spirit", color: [150, 220, 180], calmWith: "ward",
    appear: "A pale light bobs in the dark, beckoning you deeper...",
    best: "You steady your mind behind a ward and refuse to follow; it fades.", ok: "You blink and it drifts off.",
    lore: "A deceiving light that leads travellers astray. Don't follow — steady yourself behind a ward.",
    lesson: [{ s: "Keeper Fenn", t: "A will-o'-the-wisp is a false light that leads folk astray. Never follow it — ward your mind and stand your ground." }] },
  kobold: { name: "Kobold", tier: "spirit", color: [120, 140, 120], calmWith: "soothe", drop: "stone",
    appear: "A goblin-like kobold bristles by the ore!",
    best: "You speak kindly and low; pleased, it gives up a fine stone.", ok: "It scowls and sulks off.",
    lore: "A German mine-spirit — treat it kindly and it helps; slight it and it sours the ore (cobalt is named for it).",
    lesson: [{ s: "Keeper Fenn", t: "Kobolds are German mine-spirits. Treat them kindly and they help; slight them and they poison the ore — cobalt is named for them." }] },
  cave_sprite: { name: "Cave Sprite", tier: "spirit", color: [180, 160, 220], calmWith: "soothe",
    appear: "A flighty cave sprite darts about, scattering dust!",
    best: "A gentle, calm manner wins it over and it settles.", ok: "It giggles and zips away.",
    lore: "Mischievous, flighty fae. A gentle, calm manner wins them over.",
    lesson: [{ s: "Keeper Fenn", t: "Cave sprites are mischievous fae — easily startled. A gentle, calm manner and they'll settle." }] },
  shadow_moths: { name: "Shadow-Moths", tier: "spirit", color: [90, 84, 110], calmWith: "light",
    appear: "A cloud of shadow-moths boils up from the dark!",
    best: "You strike a candle; they drift to the flame and your path clears.", ok: "You push through the flutter.",
    lore: "Gather in the dark, scatter toward light. Strike a candle and they leave your path.",
    lesson: [{ s: "Keeper Fenn", t: "Shadow-moths swarm in the dark and flee toward light — strike a candle and they'll drift away to the flame." }] },
};
const CREATURE_ORDER = ["cave_spider", "rat", "wasps", "knocker", "will_o_wisp", "kobold", "cave_sprite", "shadow_moths"];
const CREATURES_BY_DEPTH = {
  1: ["cave_spider", "rat", "wasps"],
  2: ["knocker", "will_o_wisp", "rat"],
  3: ["kobold", "cave_sprite", "shadow_moths", "will_o_wisp"],
};
const ENCOUNTER_CHANCE = 0.35;  // +0.1 per level deeper
const MINE_REQUIRED = 3;        // creatures to study before the mines open

/* ---------- Vitals (health & energy) ----------
   Magic costs energy; an undefended creature hit costs health. At 0 health you
   faint and wake in the infirmary. Restore energy with food or by meditating,
   health with a remedy; a night's sleep restores both. */
const HP_MAX = 100, EN_MAX = 100;
const SPELL_COST = 12;            // energy per defensive spell (soothe/frost/ward)
const BREW_COST = 6;              // energy per brew (never blocks; floors at 0)
const MEDITATE_GAIN = 45, MEDITATE_SECS = 4;
const creatureBite = (c) => c.tier === "spirit" ? 18 : 12;
// Door gates: return true to allow, or show a message and return false.
function passGate(id) {
  if (id === "mine") {
    const studied = Object.keys(state.creaturesKnown || {}).length;
    if (studied < MINE_REQUIRED) {
      startDialogue([{ s: "Keeper Fenn", t: "Hold on — study at least " + MINE_REQUIRED + " magical creatures before you go down there. Come find me on a Tuesday." }]);
      return false;
    }
    if ((state.inv.flute || 0) <= 0) {
      startDialogue([{ s: "Keeper Fenn", t: "And don't go down without a flute — the rats won't part for you otherwise. Buy one at Magical Tools." }]);
      return false;
    }
  }
  return true;
}

// Order Prof. Sage teaches the Year-One plants. Each Herbology lesson teaches
// the next one, which adds its Book of Shadows page.
const HERB_ORDER = ["lavender", "basil", "mint", "mugwort", "dandelion", "rose", "rosemary"];

// Greenhouse pots: learning a herb grows a pot at its slot near Prof. Sage.
// Each pot yields POT_FULL picks; emptied pots regrow after REGROW_DAYS days.
const POT_FULL = 2;
const REGROW_DAYS = 3;
const POT_SLOTS = [[2, 5], [5, 5], [8, 5], [2, 7], [5, 7], [8, 7], [5, 9]]; // by HERB_ORDER index

// Herb Garden: plant seeds in planters, grow over GROW_DAYS, harvest. Seeds are
// bought from the merchant (SEED_COST) or drop while foraging (SEED_DROP_CHANCE).
const GROW_DAYS = 4;
const SEED_COST = 5;
const HERB_SELL = 2;
const SEED_DROP_CHANCE = 0.35;
const PLANTER_SLOTS = [[3, 4], [5, 4], [7, 4], [3, 7], [5, 7], [7, 7]];

/* ---------- Potion recipes (grounded in real folk/herbal practice) ----------
   needs: ingredient ids -> quantity, matched exactly in the cauldron. `herb` is
   the key plant (must be studied before Potions class teaches the recipe).
   Recipes using moon_water can only be brewed at the Full Moon (moon water only
   appears in the cauldron's pantry then). See docs/curriculum-herbology.md. */
const RECIPES = {
  calm_tonic: {
    id: "calm_tonic", name: "Lavender Calm Tonic", herb: "lavender", heat: "med",
    needs: { spring_water: 1, lavender: 1 }, makes: "lavender_calm_tonic",
    does: "Calms the mind; restful sleep.",
    method: "Steep lavender in spring water over a steady heat until pale violet.",
  },
  dream_tea: {
    id: "dream_tea", name: "Mugwort Dream Tea", herb: "mugwort", heat: "med",
    needs: { spring_water: 1, mugwort: 1 }, makes: "mugwort_dream_tea",
    does: "Vivid, prophetic dreams.",
    method: "Warm spring water just below a boil, steep mugwort, sip before bed.",
  },
  prosperity_oil: {
    id: "prosperity_oil", name: "Prosperity Oil", herb: "basil", heat: "low",
    needs: { oil: 1, basil: 1 }, makes: "prosperity_oil",
    does: "Draws money & luck. Anoint coins, candles, or the door.",
    method: "Warm basil gently into oil; never let it boil.",
  },
  mint_wash: {
    id: "mint_wash", name: "Mint Cleansing Wash", herb: "mint", heat: "high",
    needs: { spring_water: 1, mint: 1 }, makes: "mint_wash",
    does: "Purifies a space, a tool, or you.",
    method: "Simmer mint briskly; sprinkle or wipe to cleanse.",
  },
  rose_love_oil: {
    id: "rose_love_oil", name: "Rose Love Oil", herb: "rose", heat: "low",
    needs: { oil: 1, rose: 1 }, makes: "rose_love_oil",
    does: "Love, comfort. Anoint yourself, or gift it.",
    method: "Warm rose petals gently into oil — never let it boil.",
  },
  wishing_brew: {
    id: "wishing_brew", name: "Dandelion Seer's Tea", herb: "dandelion", heat: "high",
    needs: { moon_water: 1, dandelion: 1 }, makes: "wishing_brew",
    does: "Divination & clear sight. (Full moon.)",
    method: "Simmer dandelion root in moon water; sip, or leave it steaming by the bed.",
  },
  witch_bottle: {
    id: "witch_bottle", name: "Witch's Bottle", herb: "rosemary", heat: "high",
    needs: { salt: 1, rosemary: 1 }, makes: "witch_bottle",
    does: "A ward you carry. (+defense)",
    method: "Char the salt with rosemary and seal it in glass; keep it on you or by the door.",
  },
  health_draught: {
    id: "health_draught", name: "Health Draught", herb: "rose", heat: "med",
    needs: { spring_water: 1, rose: 1, mint: 1 }, makes: "health_potion",
    does: "Restores health when drunk.",
    method: "Steep rose hips and mint in spring water — a soothing, restorative tea.",
  },
};
const RECIPE_ORDER = ["calm_tonic", "prosperity_oil", "mint_wash", "dream_tea", "wishing_brew", "rose_love_oil", "health_draught", "witch_bottle"];
const HEATS = ["low", "med", "high"];
const heatWord = (h) => ({ low: "warm gently", med: "steep", high: "simmer hard" }[h] || h);

/* ---------- NPC / object dialogue ---------- */
const DIALOGUE = {
  teacher_learn: [
    { s: "Prof. Sage", t: "Welcome to Herbalism. Today we study Lavender, and the craft of calm." },
    { s: "Prof. Sage", t: "Lavandula angustifolia. Its element is Air; its planet is Mercury." },
    { s: "Prof. Sage", t: "Air and Mercury both govern the mind — thought, breath, the nervous system." },
    { s: "Prof. Sage", t: "So lavender soothes anxious thought and quiets the body for restful sleep." },
    { s: "Prof. Sage", t: "Traditionally it's used for peace, purification, and gentle, happy dreams." },
    { s: "Prof. Sage", t: "We will brew a Lavender Calm Tonic. The recipe is now in your grimoire." },
    { s: "Prof. Sage", t: "Method: fill the cauldron with spring water, add a sprig of lavender, steep until pale violet." },
    { s: "Prof. Sage", t: "Forage fresh lavender in the greenhouse, then return to the cauldron here in class." },
    { s: "You",        t: "Air and Mercury — calm and sleep. Water, lavender, steep. Understood!" },
  ],
  teacher_repeat: [
    { s: "Prof. Sage", t: "Remember: lavender is Air and Mercury — it calms the restless mind." },
    { s: "Prof. Sage", t: "Forage a sprig, then steep it in spring water at the cauldron." },
  ],
  friend_first: [
    { s: "Robin", t: "Oh — morning! First-day jitters? You'll do great here." },
    { s: "You",   t: "Thanks, Robin. See you around the common room!" },
  ],
  friend_again: [
    { s: "Robin", t: "Brewing already? You're a natural, honestly." },
  ],
  merchant_sell: [
    { s: "Merchant", t: "A Lavender Calm Tonic! I can smell the Mercury in it. Here's 25 coin." },
  ],
  merchant_empty: [
    { s: "Merchant", t: "Bring me a potion to sell and I'll pay you well." },
  ],
};

/* ---------- Subjects / classes ----------
   Each class has a teacher you tap to attend. Attending the first time grants a
   skill point and records a journal "takeaway"; lessons are real-world grounded
   correspondences. learnsRecipe: attending unlocks the brewing recipe.
   Add a subject here + a teacher interactable in a room to create a new class. */
const SUBJECTS = {
  herbology: {
    name: "Herbology", teacher: "Prof. Sage", learnsRecipe: true,
    takeaway: "Lavender (Air, Mercury) calms the mind. Forage a sprig, steep in spring water.",
    lesson: DIALOGUE.teacher_learn,
    review: DIALOGUE.teacher_repeat,
  },
  potions: {
    name: "Potions & Alchemy", teacher: "Prof. Hollis",
    takeaway: "Infusions steep gentle herbs; decoctions simmer roots. Brew with intention.",
    lesson: [
      { s: "Prof. Hollis", t: "Potions is patient work. An infusion steeps soft herbs in hot water." },
      { s: "Prof. Hollis", t: "A decoction simmers tougher roots and barks to draw their virtue out." },
      { s: "Prof. Hollis", t: "Add ingredients one at a time, and brew with clear intention — the cauldron amplifies it." },
    ],
  },
  astronomy: {
    name: "Astronomy & Lunar Studies", teacher: "Prof. Vega",
    takeaway: "Wax to begin, wane to release. Each day answers to a planet.",
    lesson: [
      { s: "Prof. Vega", t: "The moon waxes from new to full, then wanes back to new." },
      { s: "Prof. Vega", t: "Begin new work as she waxes; release and rest as she wanes." },
      { s: "Prof. Vega", t: "Each day has its planet: Mon-Moon, Tue-Mars, Wed-Mercury, Thu-Jupiter, Fri-Venus, Sat-Saturn, Sun-Sun." },
      { s: "Prof. Vega", t: "Work with the sky's timing and your craft finds an easier current." },
    ],
  },
  divination: {
    name: "Divination", teacher: "Madame Vesper",
    takeaway: "Tarot: 22 Major, 56 Minor. Tasseomancy reads tea leaves. It reveals, not dictates.",
    lesson: [
      { s: "Madame Vesper", t: "Divination listens; it does not command. The cards and leaves offer a mirror, not a verdict." },
      { s: "Madame Vesper", t: "Tarot holds 22 Major Arcana for life's great themes, and 56 Minor for daily currents." },
      { s: "Madame Vesper", t: "In tasseomancy we read the shapes tea leaves leave behind. Steady mind, soft eyes." },
    ],
  },
  crystals: {
    name: "Crystals & Lithomancy", teacher: "Prof. Beryl",
    takeaway: "Amethyst calms, quartz amplifies, rose quartz for love. Cleanse, then charge.",
    lesson: [
      { s: "Prof. Beryl", t: "Stones hold steady energies. Amethyst calms, clear quartz amplifies, rose quartz opens the heart." },
      { s: "Prof. Beryl", t: "Cleanse a new stone in moonlight or running water, then charge it with your intent." },
      { s: "Prof. Beryl", t: "In lithomancy we cast the stones and read where, and how, they fall." },
    ],
  },
  spellcraft: {
    name: "Spellcraft & Sigils", teacher: "Prof. Ember",
    takeaway: "Candle colours carry intent. Sigil = intention, minus repeats, woven into one mark.",
    lesson: [
      { s: "Prof. Ember", t: "A spell is intention given form. Choose a candle by colour — green growth, blue calm, red courage." },
      { s: "Prof. Ember", t: "To make a sigil: write your intention, strike out repeated letters, weave what remains into one mark." },
      { s: "Prof. Ember", t: "Charge the mark with focus — then release it, and let it work." },
    ],
  },
  kitchen: {
    name: "Kitchen Witchery & Folklore", teacher: "Miss Marjoram",
    takeaway: "Cook with intent. Rosemary = protection, basil = prosperity, cinnamon = luck.",
    lesson: [
      { s: "Miss Marjoram", t: "The hearth is the heart of the home. Cook with intent and a meal becomes a small spell." },
      { s: "Miss Marjoram", t: "Kitchen herbs carry meaning: rosemary for protection, basil for prosperity, cinnamon for warmth and luck." },
      { s: "Miss Marjoram", t: "Folklore keeps the old protections — salt on the threshold, iron at the door." },
    ],
  },
  creatures: {
    name: "Magical Creatures", teacher: "Keeper Fenn",
    takeaway: "Mine-dwellers, mundane and magical — soothe, ward, or offer; never fight.",
    // taught one creature per visit (progressive), like Herbology/Crystals
  },
};

/* ---------- Astronomy syllabus ----------
   Astronomy & Lunar Studies is progressive (like Herbology/Crystals/Creatures):
   Prof. Vega teaches one topic per visit, each adding a Book of Shadows page.
   `icon` reuses existing celestial art; `sky`/`craft`/`lore` fill the page. */
const ASTRONOMY = {
  moon_phases: {
    name: "The Eight Phases", sub: "New · Waxing · Full · Waning", icon: "moon_phases",
    sky: "The Moon rounds new to full to new about every 29 and a half days, lit from the side by the Sun.",
    craft: "Wax to draw in and begin; wane to release and banish; charge water, stones and tools at the Full Moon.",
    lore: "As above the tides, so below the heart.",
    lesson: [
      { s: "Prof. Vega", t: "The Moon makes her round in roughly twenty-nine and a half days — one synodic moonth." },
      { s: "Prof. Vega", t: "New and waxing is for beginnings; full for power; waning for release; the dark moon for rest." },
      { s: "Prof. Vega", t: "Leave a jar of water out under the Full Moon and you'll have moon water by morning." },
    ],
  },
  planets: {
    name: "The Seven Wanderers", sub: "Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn", icon: "telescope",
    sky: "Seven lights the ancients saw move against the fixed stars: the Sun and Moon, and five planets.",
    craft: "Each rules a weekday and a virtue — time a working to its planet for an easier current.",
    lore: "Mon-Moon, Tue-Mars, Wed-Mercury, Thu-Jupiter, Fri-Venus, Sat-Saturn, Sun-Sun.",
    lesson: [
      { s: "Prof. Vega", t: "Before telescopes, seven 'wandering stars' moved against the rest — the classical planets." },
      { s: "Prof. Vega", t: "Each lends its nature: Mars for courage, Venus for love, Mercury for words, Jupiter for luck, Saturn for endings." },
      { s: "Prof. Vega", t: "And each governs a day — work love magic on Friday (Venus), study and letters on Wednesday (Mercury)." },
    ],
  },
  zodiac: {
    name: "The Wheel of the Zodiac", sub: "Twelve signs, four elements", icon: "star_chart",
    sky: "The Sun walks a band of twelve constellations across the year — the ecliptic, or zodiac.",
    craft: "Each sign carries an element — Fire, Earth, Air, Water. Note the Moon's sign for the day's mood.",
    lore: "Aries to Pisces, the year turns through fire, earth, air and water, thrice over.",
    lesson: [
      { s: "Prof. Vega", t: "The Sun's yearly path, the ecliptic, passes through twelve signs — the zodiac." },
      { s: "Prof. Vega", t: "They sort into four elements, three signs each: Fire, Earth, Air and Water." },
      { s: "Prof. Vega", t: "Watch which sign the Moon is in — a Water moon for feeling, an Air moon for clear thought." },
    ],
  },
  north_star: {
    name: "Polaris, the Lodestar", sub: "Finding north by night", icon: "telescope",
    sky: "Polaris sits almost over the north pole, so it barely stirs while the whole sky wheels around it.",
    craft: "Follow the two pointer stars at the end of the Plough's bowl straight to it — and you'll always find north.",
    lore: "The still point the whole sky turns upon.",
    lesson: [
      { s: "Prof. Vega", t: "One star scarcely moves all night: Polaris, the North Star, almost above the pole." },
      { s: "Prof. Vega", t: "Find the Plough — the Great Bear's tail and bowl — and its two end stars point right at her." },
      { s: "Prof. Vega", t: "Lost in the dark? Polaris is north. Travellers and witches alike have steered by her." },
    ],
  },
  constellations: {
    name: "Reading the Constellations", sub: "Pictures in the stars", icon: "star_chart",
    sky: "The Great Bear, Orion the Hunter, Cassiopeia's W — patterns the old folk named and storied.",
    craft: "They keep the seasons: Orion rules winter nights; the Summer Triangle, the warm months.",
    lore: "Every people drew its own myths upon the same scattered lights.",
    lesson: [
      { s: "Prof. Vega", t: "Constellations are figures we trace among the stars — bears, hunters, queens." },
      { s: "Prof. Vega", t: "They double as a calendar: Orion's belt means deep winter; the Summer Triangle, high summer." },
      { s: "Prof. Vega", t: "Learn a handful and the night sky becomes both clock and map." },
    ],
  },
  eclipses: {
    name: "Eclipses & Omens", sub: "When Sun or Moon is swallowed", icon: "moon_phases",
    sky: "A solar eclipse falls at the New Moon as she crosses the Sun; a lunar eclipse at the Full, in Earth's shadow.",
    craft: "Old lore names them potent, unsettling thresholds — many witches rest and observe rather than cast.",
    lore: "A door opens; step through it gently.",
    lesson: [
      { s: "Prof. Vega", t: "When the Moon slips exactly between us and the Sun, she eclipses it — by day, at the New Moon." },
      { s: "Prof. Vega", t: "When Earth's shadow falls across the Full Moon she reddens — the 'blood moon' of a lunar eclipse." },
      { s: "Prof. Vega", t: "Eclipses were read as omens of change. Many prefer to watch and reflect, not work." },
    ],
  },
  wheel_of_year: {
    name: "The Wheel of the Year", sub: "Solstices, equinoxes & cross-quarters", icon: "star_chart",
    sky: "The Sun's height marks the turning year: longest day at midsummer, longest night at midwinter, balance between.",
    craft: "Eight festivals — the sabbats — mark the spokes: the two solstices, two equinoxes, and the cross-quarter days.",
    lore: "The year is a wheel; every dark turns again toward light.",
    lesson: [
      { s: "Prof. Vega", t: "Track the Sun and the year shows its joints: two solstices and two equinoxes." },
      { s: "Prof. Vega", t: "Midwinter is the longest night, midsummer the longest day; the equinoxes balance dark and light." },
      { s: "Prof. Vega", t: "Between them fall the cross-quarter days — eight festivals in all, the Wheel of the Year." },
    ],
  },
  comets_stars: {
    name: "Comets & Falling Stars", sub: "Wanderers and wishes", icon: "telescope",
    sky: "Most 'falling stars' are specks of dust burning up; comets are icy visitors trailing long bright tails.",
    craft: "Catch a shooting star and make your wish — a folk charm for fixing an intention in an instant.",
    lore: "Quick — before the light goes out.",
    lesson: [
      { s: "Prof. Vega", t: "A shooting star is no star at all, but a grain of dust burning bright as it falls." },
      { s: "Prof. Vega", t: "Comets swing in on long orbits, growing glowing tails — once feared as omens, now welcomed." },
      { s: "Prof. Vega", t: "Tradition says a wish made on a falling star takes flight — a fine way to set an intention." },
    ],
  },
};
const ASTRO_ORDER = ["moon_phases", "planets", "zodiac", "north_star", "constellations", "eclipses", "wheel_of_year", "comets_stars"];

/* ---------- Calendar & timetable ----------
   A 7-day week. The timetable maps each weekday to the classes offered that day;
   a class only teaches on its scheduled days. Sleeping advances the day. Weekends
   are free study (forage, brew, visit). Edit TIMETABLE to reschedule classes. */
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMETABLE = {
  Monday:    ["herbology", "potions"],
  Tuesday:   ["astronomy", "creatures"],
  Wednesday: ["divination", "crystals"],
  Thursday:  ["herbology", "spellcraft"],
  Friday:    ["potions", "kitchen"],
  Saturday:  [],   // free study
  Sunday:    [],   // rest
};
// Which weekdays a subject is taught (for "come back on..." hints).
function subjectDays(id) { return DAYS.filter((d) => (TIMETABLE[d] || []).includes(id)); }

/* ---------- Lunar system ----------
   A stylised synodic cycle: an in-game "moonth" of LUNAR_CYCLE days, bucketed
   into the 8 traditional phases. The moon starts New on Day 1, is Full near the
   middle, and drives gathering potency and observatory work. Meanings are the
   common folk-magic associations of each phase. */
const LUNAR_CYCLE = 28;
const MOON_PHASES = [
  { name: "New Moon",        mean: "Beginnings. Set intentions, plant seeds, rest." },
  { name: "Waxing Crescent", mean: "Intention takes root; first small steps." },
  { name: "First Quarter",   mean: "Action and decision; push through resistance." },
  { name: "Waxing Gibbous",  mean: "Refine and adjust as things grow." },
  { name: "Full Moon",       mean: "Peak power — divination, charging, manifestation, release." },
  { name: "Waning Gibbous",  mean: "Gratitude; share and give back." },
  { name: "Last Quarter",    mean: "Release and banish; let go of what no longer serves." },
  { name: "Waning Crescent", mean: "Rest, reflect, surrender before the new." },
];
const moonFrac  = () => ((state.dayCount - 1) % LUNAR_CYCLE) / LUNAR_CYCLE; // 0..1
const moonIndex = () => Math.round(moonFrac() * 8) % 8;
const moonPhase = () => MOON_PHASES[moonIndex()];
const moonIllum = () => (1 - Math.cos(2 * Math.PI * moonFrac())) / 2;       // 0 new .. 1 full
const moonWaxing = () => moonFrac() < 0.5;

// Best moon phase to gather each herb (grows with the waxing moon; psychic/
// divinatory herbs peak at the full moon). Shown in the Book of Shadows.
const HERB_MOON = {
  lavender: "Waxing", basil: "Waxing", mint: "Waxing",
  mugwort: "Full", dandelion: "Full", rose: "Waxing", rosemary: "Waxing",
};

/* ---------- Maps ----------
   Every room shares a simple bordered grid: '#' = wall, '.' = floor.
   Doors and interactables are placed as objects ON the grid; doors override
   walls and are walkable, interactables are solid (you stand next to them).

     doors:  { gx, gy, to, atGx, atGy, label }
       -> stepping onto (gx,gy) loads room `to`, placing you at (atGx,atGy).
     inters: { gx, gy, kind, name, color, action }
       -> tapping it walks you adjacent, then runs `action`.
*/
const STD_GRID = [
  "############",
  "#..........#",
  "#..........#",
  "#..........#",
  "#..........#",
  "#..........#",
  "#..........#",
  "#..........#",
  "#..........#",
  "#..........#",
  "#..........#",
  "############",
];

const ROOMS = {
  dorm: {
    name: "Your Dorm",
    floor: [56, 44, 70],
    grid: STD_GRID,
    doors: [
      { gx: 5, gy: 0, to: "courtyard", atGx: 5, atGy: 10, label: "Courtyard ^" },
    ],
    // door is at the top, so the furniture sits toward the bottom of the room
    inters: [
      { gx: 2, gy: 9, kind: "bed",  name: "Bed",     color: [90, 120, 200], action: "sleep" },
      { gx: 9, gy: 9, kind: "desk", name: "Book of Shadows", color: [150, 130, 90], action: "journal" },
      { gx: 7, gy: 9, kind: "timetable", name: "Timetable", color: [190, 170, 130], action: "timetable" },
      { gx: 4, gy: 9, kind: "decorate", name: "Decorate", color: [180, 150, 200], action: "decorate" },
    ],
    // decor: non-interactive props. solid:true blocks walking (default);
    // flat:true lays it on the floor (e.g. rugs) so you can walk over it.
    decor: [
      { gx: 9, gy: 2, kind: "bookshelf" },
      { gx: 1, gy: 10, kind: "lantern", size: 26 },
      { gx: 5, gy: 6, kind: "rug", solid: false, flat: true, size: 40 },
    ],
  },

  // ---- Central hub: the courtyard quad ----
  courtyard: {
    name: "Academy Courtyard",
    floor: [50, 70, 56],
    grid: STD_GRID,
    doors: [
      { gx: 5,  gy: 11, to: "dorm",        atGx: 5,  atGy: 1,  label: "Dorm v" },
      { gx: 0,  gy: 5,  to: "village",     atGx: 10, atGy: 6,  label: "Village <" },
      { gx: 11, gy: 6,  to: "greenhouse",  atGx: 1,  atGy: 5,  label: "Greenhouse >" },
      { gx: 5,  gy: 0,  to: "academy",     atGx: 5,  atGy: 10, label: "Academy ^" },
      { gx: 9,  gy: 0,  to: "observatory", atGx: 6,  atGy: 10, label: "Observatory ^" },
      { gx: 11, gy: 9,  to: "infirmary",   atGx: 1,  atGy: 9,  label: "Infirmary >" },
    ],
    inters: [
      { gx: 3, gy: 8, kind: "friend", name: "Robin", color: [240, 150, 190], action: "friend" },
    ],
    decor: [
      { gx: 1,  gy: 1,  kind: "lantern", size: 26 },
      { gx: 10, gy: 1,  kind: "lantern", size: 26 },
      { gx: 2,  gy: 10, kind: "pots" },
      { gx: 10, gy: 10, kind: "barrel" },
    ],
  },

  // ---- Infirmary: where you wake after fainting; rest and buy remedies ----
  infirmary: {
    name: "Infirmary",
    floor: [72, 74, 82],
    grid: STD_GRID,
    doors: [ { gx: 0, gy: 9, to: "courtyard", atGx: 10, atGy: 9, label: "Courtyard <" } ],
    inters: [
      { gx: 3, gy: 2, kind: "shop", name: "Nurse Bramble", color: [205, 150, 160], action: "shop", shop: "infirmary" },
      { gx: 9, gy: 9, kind: "bed",  name: "Cot", color: [150, 160, 200], action: "sleep" },
    ],
    decor: [
      { gx: 9, gy: 2, kind: "pots" },
      { gx: 1, gy: 2, kind: "lantern", size: 26 },
      { gx: 1, gy: 6, kind: "barrel" },
      // remedies on the dispensary shelf
      { gx: 5, gy: 2, kind: "item_health_potion", size: 24, solid: false },
      { gx: 6, gy: 2, kind: "item_energy_potion", size: 24, solid: false },
    ],
  },

  // ---- Indoor classroom wing ----
  academy: {
    name: "Academy Hall",
    floor: [60, 52, 72],
    grid: STD_GRID,
    doors: [
      { gx: 5,  gy: 11, to: "courtyard",  atGx: 5, atGy: 1, label: "Courtyard v" },
      { gx: 2,  gy: 0,  to: "potions",    atGx: 5, atGy: 10, label: "Potions ^" },
      { gx: 5,  gy: 0,  to: "divination", atGx: 5, atGy: 10, label: "Divination ^" },
      { gx: 8,  gy: 0,  to: "crystals",   atGx: 5, atGy: 10, label: "Crystals ^" },
      { gx: 0,  gy: 5,  to: "spellcraft", atGx: 5, atGy: 10, label: "Spellcraft <" },
      { gx: 11, gy: 5,  to: "kitchen",    atGx: 5, atGy: 10, label: "Kitchen >" },
      { gx: 11, gy: 8,  to: "creatures",  atGx: 5, atGy: 10, label: "Creatures >" },
    ],
    inters: [],
    decor: [
      { gx: 2, gy: 2, kind: "bookshelf" },
      { gx: 9, gy: 2, kind: "bookshelf" },
      { gx: 5, gy: 6, kind: "rug", solid: false, flat: true, size: 44 },
      { gx: 1, gy: 9, kind: "lantern", size: 26 },
    ],
  },
  creatures: {
    name: "Magical Creatures",
    floor: [54, 60, 54],
    grid: STD_GRID,
    doors: [ { gx: 5, gy: 11, to: "academy", atGx: 10, atGy: 8, label: "Hall v" } ],
    inters: [ { gx: 6, gy: 2, kind: "t_creatures", name: "Keeper Fenn", color: [140, 180, 130], action: "class", subject: "creatures" } ],
    decor: [
      { gx: 2, gy: 2, kind: "barrel" },
      { gx: 9, gy: 2, kind: "crystal_ball", size: 28 },
      { gx: 2, gy: 8, kind: "pots" },
      { gx: 9, gy: 8, kind: "lantern", size: 26 },
    ],
  },

  // ---- Herbology is held in the greenhouse (forage + class together) ----
  greenhouse: {
    name: "Greenhouse — Herbology",
    floor: [40, 64, 48],
    grid: STD_GRID,
    doors: [
      { gx: 0,  gy: 5, to: "courtyard", atGx: 10, atGy: 6, label: "Courtyard <" },
      { gx: 11, gy: 6, to: "garden",    atGx: 1,  atGy: 6, label: "Garden >" },
    ],
    // Prof. Sage is the static base; herb pots are added dynamically as you
    // study plants (see syncGreenhousePots).
    inters: [
      { gx: 6, gy: 2, kind: "teacher", name: "Prof. Sage", color: [120, 200, 120], action: "class", subject: "herbology" },
    ],
    decor: [
      { gx: 10, gy: 8, kind: "pots" },
      { gx: 3, gy: 2, kind: "barrel" },
      { gx: 1, gy: 9, kind: "lantern", size: 26 },
    ],
  },

  // ---- The Herb Garden: plant, grow, and harvest your own herbs ----
  garden: {
    name: "Herb Garden",
    floor: [74, 58, 46],
    grid: STD_GRID,
    doors: [
      { gx: 0, gy: 6, to: "greenhouse", atGx: 10, atGy: 6, label: "Greenhouse <" },
    ],
    inters: PLANTER_SLOTS.map((s, i) => ({
      gx: s[0], gy: s[1], kind: "planter", name: "Planter", color: [120, 90, 60],
      action: "planter", planterSlot: i,
    })),
    decor: [
      { gx: 10, gy: 2, kind: "barrel" },
      { gx: 1, gy: 2, kind: "watering_can", size: 30 },
      { gx: 1, gy: 9, kind: "seed_packet", size: 22 },
      { gx: 10, gy: 9, kind: "lantern", size: 26 },
    ],
  },

  // ---- Indoor classrooms (off the Academy Hall) ----
  potions: {
    name: "Potions & Alchemy",
    floor: [50, 60, 72],
    grid: STD_GRID,
    doors: [
      { gx: 5, gy: 11, to: "academy", atGx: 2, atGy: 1, label: "Hall v" },
    ],
    inters: [
      { gx: 6, gy: 2, kind: "t_potions", name: "Prof. Hollis", color: [60, 165, 165], action: "class", subject: "potions" },
      { gx: 3, gy: 8, kind: "cauldron",  name: "Cauldron",     color: [60, 165, 165], action: "brew" },
    ],
    decor: [
      { gx: 9, gy: 2, kind: "bookshelf" },
      { gx: 9, gy: 8, kind: "mortar", size: 32 },
      { gx: 1, gy: 8, kind: "pots" },
    ],
  },
  divination: {
    name: "Divination",
    floor: [56, 48, 78],
    grid: STD_GRID,
    doors: [
      { gx: 5, gy: 11, to: "academy", atGx: 5, atGy: 1, label: "Hall v" },
    ],
    inters: [
      { gx: 6, gy: 2, kind: "t_divination", name: "Madame Vesper", color: [150, 120, 210], action: "class", subject: "divination" },
    ],
    decor: [
      { gx: 3, gy: 3, kind: "crystal_ball", size: 34 },
      { gx: 6, gy: 7, kind: "rug", solid: false, flat: true, size: 44 },
      { gx: 9, gy: 2, kind: "bookshelf" },
      { gx: 1, gy: 2, kind: "lantern", size: 26 },
    ],
  },
  crystals: {
    name: "Crystals & Lithomancy",
    floor: [54, 52, 76],
    grid: STD_GRID,
    doors: [
      { gx: 5, gy: 11, to: "academy", atGx: 8, atGy: 1, label: "Hall v" },
    ],
    inters: [
      { gx: 6, gy: 2, kind: "t_crystals", name: "Prof. Beryl", color: [190, 150, 220], action: "class", subject: "crystals" },
    ],
    decor: [
      { gx: 9, gy: 3, kind: "crystal_ball", size: 30 },
      { gx: 2, gy: 8, kind: "pots" },
      { gx: 9, gy: 8, kind: "barrel" },
      { gx: 2, gy: 2, kind: "lantern", size: 26 },
    ],
  },
  spellcraft: {
    name: "Spellcraft & Sigils",
    floor: [64, 52, 60],
    grid: STD_GRID,
    doors: [
      { gx: 5, gy: 11, to: "academy", atGx: 1, atGy: 5, label: "Hall v" },
    ],
    inters: [
      { gx: 6, gy: 2, kind: "t_spellcraft", name: "Prof. Ember", color: [220, 160, 90], action: "class", subject: "spellcraft" },
    ],
    decor: [
      { gx: 3, gy: 3, kind: "lantern", size: 26 },
      { gx: 9, gy: 3, kind: "lantern", size: 26 },
      { gx: 2, gy: 8, kind: "desk" },
      { gx: 9, gy: 8, kind: "bookshelf" },
    ],
  },
  kitchen: {
    name: "Kitchen Witchery",
    floor: [68, 56, 48],
    grid: STD_GRID,
    doors: [
      { gx: 5, gy: 11, to: "academy", atGx: 10, atGy: 5, label: "Hall v" },
    ],
    inters: [
      { gx: 6, gy: 2, kind: "t_kitchen", name: "Miss Marjoram", color: [210, 120, 100], action: "class", subject: "kitchen" },
    ],
    decor: [
      { gx: 3, gy: 8, kind: "barrel" },
      { gx: 9, gy: 8, kind: "pots" },
      { gx: 9, gy: 3, kind: "mortar", size: 32 },
      { gx: 1, gy: 2, kind: "lantern", size: 26 },
    ],
  },

  // ---- Up on the grounds: the observatory ----
  observatory: {
    name: "Observatory",
    floor: [26, 28, 52],
    grid: STD_GRID,
    doors: [
      { gx: 5, gy: 11, to: "courtyard", atGx: 9, atGy: 1, label: "Down v" },
    ],
    inters: [
      { gx: 6, gy: 3, kind: "t_astronomy", name: "Prof. Vega", color: [120, 140, 230], action: "class", subject: "astronomy" },
      { gx: 6, gy: 8, kind: "telescope", name: "Telescope", color: [150, 160, 210], action: "observe" },
    ],
    decor: [
      { gx: 2, gy: 8, kind: "telescope", size: 44 },
      { gx: 1, gy: 1, kind: "lantern", size: 26 },
      { gx: 10, gy: 1, kind: "lantern", size: 26 },
    ],
  },

  // ---- The village: a square, a market street, and shops you can enter ----
  village: {
    name: "Village Square",
    floor: [70, 66, 74],
    grid: STD_GRID,
    doors: [
      { gx: 11, gy: 6, to: "courtyard", atGx: 1,  atGy: 5,  label: "Courtyard >" },
      { gx: 5,  gy: 0, to: "market",    atGx: 5,  atGy: 10, label: "Market ^" },
      { gx: 0,  gy: 6, to: "mine",      atGx: 10, atGy: 6,  label: "Mine <", gate: "mine" },
    ],
    inters: [
      { gx: 6, gy: 6, kind: "shop", name: "Merchant", color: [230, 170, 90], action: "shop", shop: "general" },
    ],
    decor: [
      { gx: 1, gy: 1, kind: "lantern", size: 26 },
      { gx: 10, gy: 2, kind: "lantern", size: 26 },
      { gx: 2, gy: 9, kind: "pots" },
      { gx: 9, gy: 9, kind: "pots" },
      { gx: 2, gy: 5, kind: "barrel" },
      { gx: 5, gy: 8, kind: "coin_pouch", solid: false, size: 22 },
    ],
  },
  market: {
    name: "Market Street",
    floor: [80, 72, 62],
    grid: STD_GRID,
    doors: [
      { gx: 5,  gy: 11, to: "village",    atGx: 5, atGy: 1,  label: "Square v" },
      { gx: 2,  gy: 0,  to: "gem_shop",   atGx: 5, atGy: 10, label: "Gems ^" },
      { gx: 8,  gy: 0,  to: "seed_shop",  atGx: 5, atGy: 10, label: "Seeds ^" },
      { gx: 0,  gy: 4,  to: "tools_shop", atGx: 5, atGy: 10, label: "Tools <" },
      { gx: 11, gy: 4,  to: "fruit_shop", atGx: 5, atGy: 10, label: "Fruit >" },
      { gx: 5,  gy: 0,  to: "furnishings", atGx: 5, atGy: 10, label: "Decor ^" },
    ],
    inters: [],
    decor: [
      { gx: 1,  gy: 1,  kind: "lantern", size: 26 },
      { gx: 10, gy: 1,  kind: "lantern", size: 26 },
      // market stall goods laid out in the square
      { gx: 3, gy: 8, kind: "item_health_potion", size: 24, solid: false },
      { gx: 4, gy: 8, kind: "item_apple",         size: 24, solid: false },
      { gx: 7, gy: 8, kind: "item_pomegranate",   size: 24, solid: false },
      { gx: 8, gy: 8, kind: "item_energy_potion", size: 24, solid: false },
      { gx: 1,  gy: 9,  kind: "barrel" },
      { gx: 10, gy: 9,  kind: "barrel" },
      { gx: 5,  gy: 8,  kind: "pots" },
    ],
  },
  furnishings: {
    name: "Furnishings",
    floor: [70, 58, 72],
    grid: STD_GRID,
    doors: [ { gx: 5, gy: 11, to: "market", atGx: 5, atGy: 1, label: "Street v" } ],
    inters: [ { gx: 6, gy: 2, kind: "shop", name: "Furnisher", color: [180, 150, 200], action: "shop", shop: "furnishings" } ],
    decor: [
      // furniture showroom display
      { gx: 2, gy: 1, kind: "bookshelf" },
      { gx: 3, gy: 1, kind: "lantern",   size: 26 },
      { gx: 4, gy: 1, kind: "cauldron",  size: 30 },
      { gx: 7, gy: 1, kind: "telescope", size: 30 },
      { gx: 8, gy: 1, kind: "crystal_ball", size: 30 },
      { gx: 9, gy: 1, kind: "chalice",   size: 24, solid: false },
      { gx: 2, gy: 8, kind: "barrel" },
      { gx: 9, gy: 8, kind: "star_chart", size: 26, solid: false },
      { gx: 8, gy: 8, kind: "pentacle", flat: true, size: 28, solid: false },
      { gx: 5, gy: 6, kind: "rug", solid: false, flat: true, size: 38 },
    ],
  },
  gem_shop: {
    name: "Gem Shop",
    floor: [60, 56, 80],
    grid: STD_GRID,
    doors: [ { gx: 5, gy: 11, to: "market", atGx: 2, atGy: 1, label: "Street v" } ],
    inters: [ { gx: 6, gy: 2, kind: "shop", name: "Gemcutter", color: [160, 130, 215], action: "shop", shop: "gem" } ],
    decor: [
      // gems on display along the back counter
      { gx: 2, gy: 1, kind: "item_amethyst",         size: 24, solid: false },
      { gx: 3, gy: 1, kind: "item_clear_quartz",     size: 24, solid: false },
      { gx: 4, gy: 1, kind: "item_rose_quartz",      size: 24, solid: false },
      { gx: 7, gy: 1, kind: "item_citrine",          size: 24, solid: false },
      { gx: 8, gy: 1, kind: "item_black_tourmaline", size: 24, solid: false },
      { gx: 9, gy: 1, kind: "item_moonstone",        size: 24, solid: false },
      { gx: 2, gy: 8, kind: "crystal_ball", size: 30 },
      { gx: 9, gy: 8, kind: "crystal_ball", size: 30 },
      { gx: 5, gy: 8, kind: "barrel" },
    ],
  },
  seed_shop: {
    name: "Seed & Garden",
    floor: [54, 64, 48],
    grid: STD_GRID,
    doors: [ { gx: 5, gy: 11, to: "market", atGx: 8, atGy: 1, label: "Street v" } ],
    inters: [ { gx: 6, gy: 2, kind: "shop", name: "Gardener", color: [120, 180, 90], action: "shop", shop: "seed" } ],
    decor: [
      // potted herbs on display
      { gx: 2, gy: 1, kind: "herb_lavender", size: 30, solid: false },
      { gx: 3, gy: 1, kind: "herb_basil",    size: 30, solid: false },
      { gx: 4, gy: 1, kind: "herb_mint",     size: 30, solid: false },
      { gx: 7, gy: 1, kind: "herb_rose",     size: 30, solid: false },
      { gx: 8, gy: 1, kind: "herb_rosemary", size: 30, solid: false },
      { gx: 9, gy: 1, kind: "herb_mugwort",  size: 30, solid: false },
      { gx: 2, gy: 8, kind: "watering_can", size: 30 },
      { gx: 9, gy: 8, kind: "seed_packet", size: 22 },
      { gx: 5, gy: 8, kind: "pots" },
    ],
  },
  tools_shop: {
    name: "Magical Tools",
    floor: [58, 52, 66],
    grid: STD_GRID,
    doors: [ { gx: 5, gy: 11, to: "market", atGx: 1, atGy: 4, label: "Street v" } ],
    inters: [ { gx: 6, gy: 2, kind: "shop", name: "Toolwright", color: [205, 170, 120], action: "shop", shop: "tools" } ],
    decor: [
      // tools on display
      { gx: 2, gy: 1, kind: "item_pickaxe",    size: 26, solid: false },
      { gx: 3, gy: 1, kind: "item_flute",      size: 26, solid: false },
      { gx: 4, gy: 1, kind: "item_candle",     size: 24, solid: false },
      { gx: 7, gy: 1, kind: "item_pendulum",   size: 24, solid: false },
      { gx: 8, gy: 1, kind: "item_tarot_deck", size: 24, solid: false },
      { gx: 9, gy: 1, kind: "item_wand",       size: 26, solid: false },
      { gx: 2, gy: 8, kind: "bookshelf" },
      { gx: 9, gy: 8, kind: "barrel" },
    ],
  },
  fruit_shop: {
    name: "Fruit Stall",
    floor: [72, 60, 52],
    grid: STD_GRID,
    doors: [ { gx: 5, gy: 11, to: "market", atGx: 10, atGy: 4, label: "Street v" } ],
    inters: [ { gx: 6, gy: 2, kind: "shop", name: "Grocer", color: [210, 120, 100], action: "shop", shop: "fruit" } ],
    decor: [
      // fruit on display
      { gx: 2, gy: 1, kind: "item_apple",       size: 24, solid: false },
      { gx: 3, gy: 1, kind: "item_lemon",       size: 24, solid: false },
      { gx: 4, gy: 1, kind: "item_pomegranate", size: 24, solid: false },
      { gx: 7, gy: 1, kind: "item_apple",       size: 24, solid: false },
      { gx: 8, gy: 1, kind: "item_lemon",       size: 24, solid: false },
      { gx: 9, gy: 1, kind: "item_pomegranate", size: 24, solid: false },
      { gx: 2, gy: 8, kind: "barrel" },
      { gx: 9, gy: 8, kind: "barrel" },
      { gx: 5, gy: 8, kind: "pots" },
    ],
  },

  // ---- The Mines: work ore with a pickaxe to find stones ----
  mine: {
    name: "The Mines",
    floor: [40, 38, 48], depth: 1,
    grid: STD_GRID,
    doors: [
      { gx: 11, gy: 6, to: "village", atGx: 1, atGy: 6,  label: "Village >" },
      { gx: 5,  gy: 11, to: "mine2",  atGx: 5, atGy: 1,  label: "Descend v" },
    ],
    inters: MINE_NODES.map((s, i) => ({ gx: s[0], gy: s[1], kind: "ore", name: "Ore", color: [122, 112, 124], action: "mine", nodeSlot: i })),
    decor: [
      { gx: 1, gy: 1, kind: "lantern", size: 26 },
      { gx: 1, gy: 10, kind: "lantern", size: 26 },
      { gx: 10, gy: 10, kind: "barrel" },
    ],
  },
  mine2: {
    name: "The Mines — Deep",
    floor: [34, 32, 44], depth: 2,
    grid: STD_GRID,
    doors: [
      { gx: 5, gy: 0,  to: "mine",  atGx: 5, atGy: 10, label: "Ascend ^" },
      { gx: 5, gy: 11, to: "mine3", atGx: 5, atGy: 1,  label: "Descend v" },
    ],
    inters: MINE_NODES.map((s, i) => ({ gx: s[0], gy: s[1], kind: "ore", name: "Ore", color: [120, 108, 126], action: "mine", nodeSlot: i })),
    decor: [
      { gx: 1, gy: 10, kind: "lantern", size: 26 },
      { gx: 10, gy: 1, kind: "lantern", size: 26 },
    ],
  },
  mine3: {
    name: "The Mines — Deepest",
    floor: [28, 26, 40], depth: 3,
    grid: STD_GRID,
    doors: [
      { gx: 5, gy: 0, to: "mine2", atGx: 5, atGy: 10, label: "Ascend ^" },
    ],
    inters: MINE_NODES.map((s, i) => ({ gx: s[0], gy: s[1], kind: "ore", name: "Ore", color: [118, 104, 128], action: "mine", nodeSlot: i })),
    decor: [
      { gx: 1, gy: 1, kind: "lantern", size: 26 },
      { gx: 10, gy: 10, kind: "lantern", size: 26 },
    ],
  },
};

// The greenhouse's permanent fixtures (Prof. Sage); pots are appended per herb.
const GH_BASE = ROOMS.greenhouse.inters.slice();
