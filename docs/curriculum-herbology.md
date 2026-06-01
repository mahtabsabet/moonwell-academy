# Herbology Curriculum — Year One

> Design doc for the Herbology class and its companion, Potions & Alchemy.
> Correspondences are grounded in real folk-magic tradition (chiefly Scott
> Cunningham's *Encyclopedia of Magical Herbs*) and real herbalism. Sources at
> the bottom. This is the **content plan** — it drives the in-game Book of
> Shadows entries, the foraging table, and the Potions recipes.

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
- **Potion:** *Hearthguard Oil* (protection) or *Merchant's Draught* (prosperity).

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

## Potions & Alchemy tie-in

Potions class teaches **methods** (infusion, decoction, oil, sachet, bath) and
**recipes** that consume studied herbs. A natural progression:

1. **Infusions (tier 1):** single-herb teas/tonics — Lavender Calm Tonic, Clear-Mind
   Mint Tea, Dandelion Seer's Tea.
2. **Sachets & pillows:** Mugwort Dream-Pillow, Rose Heart's-Ease sachet.
3. **Oils & washes:** Basil Hearthguard Oil, Mint purifying wash.
4. **Combinations (tier 2):** 2–3 herb recipes once several plants are known —
   e.g. *Dreamer's Blend* (mugwort + rose + lavender) for vivid, gentle dreams.

Potions made here are used by **other classes** (dream-pillows boost Divination/
Astronomy), sold in the Village, or given as gifts to NPCs.

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

