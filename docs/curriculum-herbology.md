# Herbology Curriculum — Year One

> Design doc for the Herbology class and its companion, Potions & Alchemy.
>
> **On the correspondences:** these reflect widely-attested folk-magic tradition,
> corroborated across multiple sources and commonly credited to Scott Cunningham's
> *Encyclopedia of Magical Herbs*. They have **not** been verified line-by-line
> against that book — so treat them as "the common tradition," not "exactly what
> Cunningham printed." Where traditions genuinely disagree (e.g. mint, mugwort),
> the entry says *sources vary* rather than asserting one answer. For a cozy game
> grounded in real practice, that's the honest bar. Sources at the bottom.
>
> This is the **content plan** — it drives the in-game Book of Shadows entries,
> the foraging table, and the Potions recipes.

## How it fits the game

- **Herbology class** (Greenhouse, Prof. Sage): each lesson introduces one plant
  — its botanical identity, planetary/elemental correspondences, magical powers,
  and practical herbal uses. Attending records a **Book of Shadows** entry and a
  skill point.
- **Foraging:** once a plant's lesson is learned, it becomes forageable (in the
  greenhouse now; wild areas later, some moon-/season-gated).
- **Potions & Alchemy class** (Prof. Hollis): teaches *recipes* that combine the
  herbs you've studied into potions, oils, sachets, and teas. Herbology gives you
  the ingredients and the "why"; Potions gives you the method and the "how".
- **Book of Shadows:** every studied plant gets a beautiful illustrated page —
  picture, correspondences, uses, and a short lore passage in the school's voice.

## Year-One plant roster

The six core plants below are the starting curriculum. Suggested additions for a
fuller year follow.

| Plant | Botanical | Gender | Planet | Element | Core powers |
|---|---|---|---|---|---|
| Lavender | *Lavandula angustifolia* | Masculine | Mercury | Air | Peace, sleep, purification, love |
| Basil | *Ocimum basilicum* | Masculine | Mars | Fire | Protection, prosperity, love |
| Mint | *Mentha spp.* | Masculine | Mercury | Air | Prosperity, healing, purification |
| Mugwort | *Artemisia vulgaris* | Feminine | Venus (lunar) | Earth | Prophetic dreams, divination, protection |
| Dandelion | *Taraxacum officinale* | Masculine | Jupiter | Air | Divination, wishes, spirit-calling |
| Rose | *Rosa spp.* | Feminine | Venus | Water | Love, healing, psychic & divination |

---

## Plant entries

Each entry is written so its fields map straight to a `HERBS` data record and a
Book of Shadows page: **correspondences**, **herbal use**, **safety**, **lore**.

### 1. Lavender — *Lavandula angustifolia*
- **Correspondences:** Masculine · Mercury · Air. Powers: peace, restful sleep,
  purification, love, happiness.
- **Why:** Air and Mercury both govern the mind — thought, breath, the nerves —
  so lavender soothes anxious thought and quiets the body.
- **Herbal use:** Calming infusion; a sprig-stuffed pillow for gentle sleep and
  good dreams; dried bundles as cleansing incense; asperging (sprinkling) herb
  for purifying a space.
- **Safety:** Gentle and widely safe; essential oil should be diluted.
- **Lore (BoS):** *"Pick lavender for a quiet mind. Steep it for calm, burn it for
  clean air, and tuck it beneath your pillow for kind dreams."*
- **Potion:** Lavender Calm Tonic *(already in game)*.

### 2. Basil — *Ocimum basilicum*
- **Correspondences:** Masculine · Mars · Fire (Culpeper places it in Scorpio).
  Powers: protection, wealth & prosperity, love, harmony.
- **Why:** Fiery and Martial — a herb that *pushes*: it wards a threshold, draws
  custom and coin, and lends courage to love.
- **Herbal use:** Hung over a door or scattered to protect the home; carried or
  kept in a till to draw business and money; culinary herb of warmth and welcome.
- **Safety:** Culinary-safe; medicinal amounts best avoided in pregnancy.
- **Lore (BoS):** *"Basil guards the door and fills the purse. Keep a leaf where
  money passes, and a sprig where you wish to be safe."*
- **Potion:** *Basil Floor Wash* — simmered basil to cleanse & protect a space,
  washed from the back of the home to the front. A real, documented Hoodoo/folk
  practice (basil is a classic protection & cleansing herb in floor washes).

### 3. Mint — *Mentha spp.*
- **Correspondences:** Masculine · Mercury · Air (peppermint leans Fire; spearmint
  Venus/Water). Powers: prosperity & money, healing, purification, clear
  communication.
- **Why:** Quick-growing and quick-witted — mint's Mercurial nature speeds money,
  clears the head, and freshens a space.
- **Herbal use:** A leaf in the wallet to keep money flowing in; settling
  digestive tea; a brisk purifying wash; rub fresh leaves on surfaces to cleanse.
- **Safety:** Culinary-safe; peppermint oil can aggravate reflux in some.
- **Lore (BoS):** *"Mint moves things along — coin, words, and stale air alike.
  Carry a leaf to keep abundance flowing."*
- **Potion:** *Clear-Mind Tea* (focus) or *Coinflow Brew* (prosperity).

### 4. Mugwort — *Artemisia vulgaris*
- **Correspondences:** Feminine · Venus, strongly **lunar** · Earth. Sacred to
  **Artemis/Diana**. Powers: prophetic dreams, divination, psychic power,
  protection, astral travel.
- **Why:** Named for the moon-goddess Artemis; the diviner's herb — it opens the
  inner eye and deepens dreams.
- **Herbal use:** Dream-pillow for prophetic dreams; light as incense before
  divination or scrying; a weak tea to aid dream recall.
- **Safety:** ⚠️ **Avoid in pregnancy** (emmenagogue); avoid with ragweed allergy.
  Use small amounts.
- **Lore (BoS):** *"Mugwort lifts the veil. Burn it before the cards, or sleep
  upon it to dream true — but never while carrying a child."*
- **Potion:** *Dreaming Draught* / *Seer's Dream-Pillow* (boosts Divination &
  Astronomy work).

### 5. Dandelion — *Taraxacum officinale*
- **Correspondences:** Masculine · Jupiter · Air. Linked to **Hecate**. Powers:
  divination, wishes, calling spirits, luck.
- **Why:** The whole plant is a little oracle — golden head, then a sphere of
  wishes carried on the wind.
- **Herbal use:** Blow the seed-clock to send a wish or a message; root tea to
  aid divination and prophetic dreaming; nutritive, detoxifying spring greens
  (vitamins A, C, K; supports the liver).
- **Safety:** Food-safe; mild diuretic. Caution if allergic to related daisies.
- **Lore (BoS):** *"Dandelion answers questions and carries wishes. Brew the root
  to see further; blow the seeds to send your hope on the wind."*
- **Potion:** *Wishing Draught* / *Seer's Root Tea* (divination aid).

### 6. Rose — *Rosa spp.*
- **Correspondences:** Feminine · Venus · Water. Powers: love, healing, psychic
  power, divination, luck, protection, tranquillity.
- **Why:** The flower of Venus and the heart — emotion, beauty, intuition, and
  gentle healing.
- **Herbal use:** Petals in love and friendship magic; rosewater to anoint the
  brow for clearer intuition and to cleanse divination tools; soothing tea and
  calming bath; petals as anti-inflammatory in skincare.
- **Safety:** Gentle; use unsprayed/food-grade petals.
- **Lore (BoS):** *"Rose opens the heart and the inner eye. Add petals to a bath
  for ease, or rosewater to your scrying for a softer sight."*
- **Potion:** *Heart's-Ease Water* (love/comfort) or *Clear-Sight Rosewater*
  (divination aid).

---

## Suggested additions (to round out Year One)

All real, beginner-friendly, and well-attested:

| Plant | Planet · Element | Powers |
|---|---|---|
| Chamomile (*Matricaria*) | Sun · Water | Sleep, calm, money, purification |
| Rosemary (*Salvia rosmarinus*) | Sun · Fire | Protection, memory, purification, love |
| Sage (*Salvia officinalis*) | Jupiter · Air | Wisdom, cleansing, longevity, protection |
| Yarrow (*Achillea*) | Venus · Water | Courage, love, psychic power, protection |
| Thyme (*Thymus*) | Venus · Water | Courage, health, restful sleep, purification |
| Calendula (*Calendula officinalis*) | Sun · Fire | Protection, prophetic dreams, comfort |

These pair naturally with the other classes (rosemary ↔ Kitchen Witchery, yarrow/
mugwort ↔ Divination, chamomile ↔ sleep/lunar work).

## Potions & Alchemy — the recipes (as implemented)

Each potion below maps to a real, citeable practice (sources at the bottom).
Heat matters: **warm gently** (preserve delicate florals), **steep** (just below
a boil — keeps volatile oils), **simmer hard** (decoctions of roots, and washes).

One craft per herb, spread across **forms** (tea to drink, oil to anoint/gift,
wash to clean a space) and across **distinct effects** — only one sleep item and
one dream item, no overlap.

| Craft | Form | Ingredients | Heat | Effect | Grounding |
|---|---|---|---|---|---|
| **Lavender Calm Tonic** | tea | spring water + lavender | steep | calm, restful **sleep** | Lavender tea is a documented calming/sleep infusion. |
| **Prosperity Oil** | oil | oil + basil | warm gently | money & luck (anoint) | Basil is a classic money/"draw custom" herb; anointing oils are standard. |
| **Mint Cleansing Wash** | wash | spring water + mint | simmer | purify a space/tool/self | Mint is a traditional purification/cleansing herb. |
| **Mugwort Dream Tea** | tea | spring water + mugwort | steep | vivid, prophetic **dreams** | The classic oneirogen dream tea (steep below boiling). |
| **Dandelion Seer's Tea** | tea | moon water + dandelion | simmer | **divination** & clear sight | Cunningham: dandelion-root tea for divination. |
| **Rose Love Oil** | oil | oil + rose | warm gently | love & comfort (anoint/gift) | Rose = love/Venus; rose-infused anointing oils are traditional. |
| **Witch's Bottle** | carried charm | salt + rosemary | seal/char | **protection** (+defense) | Real protective charm: salt + rosemary (often + iron pins) sealed in a bottle, carried or buried. |

*Rosemary is now a core (7th) plant. Protection moved off basil (basil = prosperity)
onto the salt-based Witch's Bottle. The bottle raises a **defense** stat — a hook for
a future light combat/encounter layer (a deliberate step beyond the original cozy
"no combat" pillar).*

Forms map to heat naturally: **warm gently** for oils (don't scorch), **steep**
(just below a boil) for teas, **simmer hard** for washes and root decoctions.

**Moon water** (a base that only appears at the Full Moon) gates the Seer's Tea
— a real practice (water charged under the full moon).

*Future forms (need a dry-crafting step, e.g. the mortar): incense to burn,
sachets/dream-pillows to carry, powders.*

Potions are sold in the Village, and are the hook for future use by other
classes (a dream tea before the observatory, etc.) and NPC gifts.

## Proposed data shape (for implementation)

```js
HERBS = {
  lavender: {
    name: "Lavender", botanical: "Lavandula angustifolia",
    gender: "Masculine", planet: "Mercury", element: "Air",
    powers: ["peace", "sleep", "purification", "love"],
    herbal: "Calming infusion; sleep pillow; cleansing incense.",
    safety: "",                       // optional warning line
    lore: "Pick lavender for a quiet mind...",
    forageGate: null,                 // e.g. {moon:"waxing"} or {season:"spring"} later
  },
  // ...one record per plant
}
```

Each `HERBS` record powers a Book of Shadows page (illustration + the fields
above) and the foraging/Potions systems. Per-plant art can be generated in
PixelLab later; until then the generic herb sprite stands in.

## Sources

Primary reference for the magical correspondences:
- Scott Cunningham, *Cunningham's Encyclopedia of Magical Herbs*, Llewellyn
  Publications, 1985 (ISBN 978-0875421223) — [publisher page](https://www.llewellyn.com/product.php?ean=9780875421223) ·
  [full text on the Internet Archive](https://archive.org/details/cunninghamsencyc00cunn_0)

Secondary corroboration (per-plant), used to cross-check the entries above:
- [LearnReligions herb correspondences](https://www.learnreligions.com/magical-herb-correspondences-4064512)
- Lavender — [Spells8](https://spells8.com/lessons/lavender-herbal-witchcraft/)
- Basil — [Flying the Hedge](https://www.flyingthehedge.com/2020/01/magical-uses-of-basil.html) · [Wiccanow](https://wiccanow.com/magickal-properties-of-basil/)
- Mint — [Flying the Hedge](https://www.flyingthehedge.com/2020/09/magical-and-medicinal-uses-of-mint.html) · [Eclectic Witchcraft](https://eclecticwitchcraft.com/magical-correspondences-of-mint/)
- Mugwort — [Grove and Grotto](https://www.groveandgrotto.com/blogs/articles/magickal-properties-of-mugwort) · [Alchemy Works](https://www.alchemy-works.com/herb_mugwort.html)
- Dandelion — [Wiccanow](https://wiccanow.com/magickal-properties-of-dandelion/) · [Crystal Vaults](https://www.crystalvaults.com/magical-herbs/dandelion/)
- Rose — [Curious Cauldron](https://curiouscauldron.com.au/blogs/sacred-space/the-magickal-properties-of-rose) · [Wiccanow](https://wiccanow.com/magickal-properties-of-rose/)

Potion practices:
- Lavender calm/sleep tea — [Healthline](https://www.healthline.com/nutrition/lavender-tea-benefits) · [Cleveland Clinic — teas for sleep](https://health.clevelandclinic.org/tea-for-sleep)
- Basil floor wash (cleansing/protection) — [Art of the Root](https://artoftheroot.com/blogs/spells-and-rituals/39475141-basil-in-hoodoo-voodoo-wiccan-pagan-rituals-folklore-and-spells) · [Lucky Mojo — baths & washes](https://www.luckymojo.com/baths.html)
- Mugwort dream tea (and mugwort + lavender blend) — [Mountain Rose Herbs](https://blog.mountainroseherbs.com/herbs-for-lucid-dreaming-dream-tea-recipe) · [Ascension Kitchen](https://ascensionkitchen.com/mugwort-tea-lucid-dreaming/)
- Mint + basil money/prosperity tea — [Eclectic Witchcraft — money tea](https://eclecticwitchcraft.com/cinnamon-money-tea/) · [Witchyhour — money herbs](https://witchyhour.com/blogs/herbal-magic/herbs-for-money-spells-attract-wealth-and-prosperity-with-natural-magic)
- Rosewater (making + love/cleansing magic) — [Sacred Wicca — rose water recipe](https://sacredwicca.com/rose-water-recipe) · [Moonlight Mysteries](https://www.moonlightmysteries.com/blog/unlock-the-magic-rose-water-in-your-craft/)
- Dandelion-root divination tea — [LearnReligions](https://www.learnreligions.com/dandelion-magic-and-folklore-4588986) · [Greenman Meadows](https://greenmanmeadows.com/dandelion-magic/)
- Moon water — [The Pagan Grimoire](https://www.pagangrimoire.com/moon-water/)
- Witch's bottle (salt + rosemary protection charm) — [The Pagan Grimoire — Witch's Bottle](https://www.pagangrimoire.com/witch-bottle/) · salt as protection: [Learn Religions](https://www.learnreligions.com/salt-in-magic-and-folklore-2562823)
- Rosemary (protection/memory/purification) — [LearnReligions — rosemary magic](https://www.learnreligions.com/rosemary-history-and-folklore-2562383)

