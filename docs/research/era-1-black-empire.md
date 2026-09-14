# Era 1 Research Ledger — Primordial Azeroth and the Black Empire

## Status

The Era 1 vertical slice is implemented as `contentStatus: research`. It is usable for product iteration but is not approved for a published-only build. A human reviewer must confirm the complete Chronicle pagination, wording, and map interpretation before any record is promoted to `reviewed` or `published`.

Research cutoff: 2026-09-13.

## Source set

| Source | Role | Material used |
| --- | --- | --- |
| *World of Warcraft: Chronicle Volume 1*, English 2016 pagination | Primary source backbone | Foreword: Cosmology, pp. 9–10; Chapter II, “Reign of the Elements,” pp. 28–29; “Coming of the Old Gods,” p. 29 |
| [Official Dark Horse Chronicle preview](https://images.darkhorse.com/darkhorse/newsletter/2016blasts/WoWChronicleSample.pdf) | Accessible primary-source excerpt | Confirms the cited passages and print pagination available to the project |
| [Warcraft Wiki: Chronicle Volume 1](https://warcraft.wiki.gg/wiki/World_of_Warcraft:_Chronicle_Volume_1) | User-selected secondary research index | Topic, chart, reference, and map discovery while the complete book is unavailable |
| [Warcraft Wiki: Black Empire](https://warcraft.wiki.gg/wiki/Black_Empire) | Secondary synthesis | Chronicle-attributed continuation: elemental defeat/enslavement and empire-wide dominion; exact Chronicle pages still need confirmation |
| [Blizzard: The Story So Far — Dragon Aspects](https://worldofwarcraft.blizzard.com/en-us/news/23876527) | First-party corroboration and handoff | Confirms the world-soul risk, Black Empire, and transition into the Titan-forged campaign |

The wiki is not treated as equivalent to Chronicle. Records depending on its synthesis use `strongly_supported` rather than `explicit` confidence and carry an editor note requiring confirmation against the underlying book.

## Scope boundary

Era 1 begins with the cosmic frame needed to understand Azeroth and ends with the Black Empire in control before the Pantheon's ordering campaign. Titan-forged battles, Y'Shaarj's removal, the Old Gods' prisons, the Well of Eternity, and keeper facilities belong to Era 2.

Later Black Empire material—such as conflicts among individual Old Gods, Xal'atath, Ny'alotha's modern manifestation, and the Fourth War—is intentionally excluded from this baseline until its own source packets are reviewed.

## Implemented historical chain

```text
Azeroth's world-soul consumes much Spirit
→ elemental imbalance
→ prolonged wars among four Elemental Lords
→ Old Gods arrive independently of that conflict
→ n'raqi and aqir raise Old God cities
→ Black Empire expands
→ elemental rivals unite against it
→ their resistance fails and the Elemental Lords are enslaved
→ Black Empire dominion becomes the crisis inherited by the Ordering
```

The arrow from the Elemental Wars to the Old Gods' arrival is stored as `precedes`, not `causes`. This prevents the visualization from inventing a causal relationship the sources do not claim.

## Cartography decision

The terrain is the stable map base. Contextual regions, sites, routes, and conflict markers replace one another as the user selects records or the tour advances; they are not displayed as a permanently stacked composite.

Chronicle Volume 1, pp. 34–35 is the visual reference for Azeroth under Black Empire control, as indexed by Warcraft Wiki. Its book artwork remains external reference material: this repository ships original procedural terrain and simplified uncertainty-labeled vectors, not a copied, traced, or hotlinked scan.

The sources support these geographic statements:

- Azeroth had a largest primordial continent.
- Y'Shaarj's greatest bastion stood near its center.
- Old God domains expanded broadly across the world.
- The elemental conflicts were world-spanning and did not retain stable fronts.

They do not supply survey-grade coastlines, exact borders, exact arrival sites, or campaign routes in the accessible text. Therefore:

- `primordial-kalimdor-landmass-research` is an original simplified inferred landmass.
- `black-empire-influence-research` is a broad inferred influence overlay with a dashed boundary.
- `yshaarj-central-bastion-research` is an approximate point near the map center.
- The four Elemental Lords have separate inferred focus points, reconstructed loosely from the Chronicle map only so each narrated beat can place one named power on the terrain. They are explicitly approximate and are never presented as surveyed locations.
- Both conflicts use `geographicCertainty: unknown`; no false battle marker or route is drawn.
- The terrain GLB is procedurally generated from repository-owned code. Its original color-relief and height textures were generated for this project, then applied as a displaced surface to give the atlas restrained physical weight. No copied map image or game asset is shipped.

## Implemented records

- 1 era and 1 dedicated map state
- 13 people, powers, peoples, and places
- 7 spatial states with visible uncertainty notes
- 4 historical events
- 2 campaign groupings
- 2 conflict dossiers with 9 total playback phases
- 23 claim records and 6 source-aware relationship edges
- 5 citation records across Chronicle, Warcraft Wiki, and Blizzard sources
- 1 unnumbered, ten-node autoplaying guided history paced at roughly 82 spoken words per minute with a dramatic settling beat, with only Previous and Next controls, a visible countdown bar, no embedded sub-stories, original character figures, one contextual map emphasis at a time, transcript text, and reduced-motion camera skipping

## Human review checklist

Before promotion:

1. Compare pp. 9–10 and 28–30 against the selected complete Chronicle edition.
2. Replace the Warcraft Wiki-only outcome citation with the exact Chronicle page range if available.
3. Compare the original inferred coastline and influence overlay against the Chronicle map indexed by Warcraft Wiki; record every deliberate simplification.
4. Confirm the editorial labels “The Primordial Imbalance,” “The Elemental Assault on the Black Empire,” “Black Empire Dominion,” and “Y'Shaarj's Central Bastion” do not imply official event or place names.
5. Review every paraphrase for accuracy and independence from source wording.
6. Decide whether later first-party accounts materially revise the Chronicle framing; if so, add separate disputed or superseded claims rather than overwriting it.
7. Run the repository citation checklist and promote records only after sign-off.
