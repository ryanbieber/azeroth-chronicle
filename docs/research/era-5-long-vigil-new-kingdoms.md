# Era 5 Research Audit — The Long Vigil and the New Kingdoms

Status: public `research` preview; human lore, citation, chronology, cartography, interpretation, and visual review required before promotion.

## Scope and release boundary

This slice begins with the post-Sundering survivors at Hyjal and ends with the late pre–Dark Portal political world: the kaldorei Long Vigil, Quel'Thalas and the Sunwell, the enduring Amani presence, the human successor kingdoms of Arathor, and the divided dwarven clans. The rise of the Horde on Draenor, the opening of the Dark Portal, and the First and Second Wars belong to Era 6.

The era spans millennia and several disconnected regional histories. Its guide is therefore a causal chronicle, not a claim that every event occurred in one generation or along one continuous military front. Dates remain working chronology until checked against a human-held edition of *World of Warcraft: Chronicle Volume 1*.

## Source ledger

| Source ID | Use in this preview | Review condition |
| --- | --- | --- |
| `warcraft-chronicle-volume-1` | Editorial backbone for the Second Well, Nordrassil, the Long Vigil, Highborne exile, Quel'Thalas, Arathor, the Troll Wars, the seven kingdoms, and the War of the Three Hammers | Verify every working page span against the registered edition before changing any record from `research` |
| `blizzard-burning-crusade-story-so-far` | First-party support for the Highborne journey, Quel'Thalas, the Sunwell, and the Amani conflict | Preserve the distinction between first-party summary and the more detailed Chronicle working sequence |
| `blizzard-stromkar-thoradin` | First-party support for Thoradin, Arathor, the alliance with the high elves, and the Troll Wars | Treat promotional artifact narration as a concise corroborating account rather than a complete campaign map |
| `blizzard-grim-batol-history` | First-party support for the dwarven civil war, Grim Batol, and the consequences of the Dark Iron summons | Do not infer exact fronts, roads, or the position of the final engagements from this overview |

Working Chronicle citations currently use these page ranges: 112–115 for the early Long Vigil, 116–121 for the Highborne exile, 126–136 for Arathor and the Troll Wars, 137–146 for the human successor kingdoms, and 153–156 for the War of the Three Hammers. These are indexing aids, not reviewed publication citations.

First-party research entry points:

- [Burning Crusade Classic: The Story So Far](https://worldofwarcraft.blizzard.com/en-us/news/23679744/burning-crusade-classic-the-story-so-far)
- [Legion artifact history: Stromkar, the Warbreaker](https://worldofwarcraft.blizzard.com/en-gb/news/19942707)
- [Cataclysm zone history: Grim Batol](https://worldofwarcraft.blizzard.com/en-gb/news/10002188)

## Authored historical spine

The fourteen-pane guide, **The Shores That Learned New Names**, follows this sequence:

1. The shattered world and the survivors at Hyjal.
2. Illidan creates a second Well of Eternity.
3. Nordrassil is planted above the new Well.
4. The Long Vigil begins.
5. Conflict over arcane practice ends in Highborne exile.
6. Dath'Remar's people cross the new sea toward the east.
7. Quel'Thalas and the Sunwell rise within land also claimed by the Amani.
8. Thoradin unites Arathor around Strom.
9. Amani pressure brings Quel'Thalas and Arathor into a wartime alliance.
10. The allies defeat the immediate Amani offensive without erasing the Amani people or their claim.
11. Arathor gradually gives way to seven sovereign kingdoms.
12. The dwarven succession crisis divides Ironforge's three clans.
13. Ragnaros returns during the war's southern catastrophe.
14. Several distinct powers stand in the world before the Dark Portal opens.

Narration is original prose, paced at approximately 82 words per minute with at least five seconds for visual settling. The guide does not play tactical battle phases inline; the detailed strategic sequences remain in the permanent Troll Wars and War of the Three Hammers dossiers.

## Causality audit

The data asserts only the causal links needed for supported consequences. In particular:

- the second Well leads to the planting of Nordrassil;
- Nordrassil precedes the formal Long Vigil;
- exile leads to the eastward Highborne settlement and founding of Quel'Thalas;
- Amani military pressure leads to the high-elven–Arathorian alliance;
- the Troll Wars lead to the defeat of the immediate Amani campaign;
- the dwarven succession crisis leads to the War of the Three Hammers;
- the war's disastrous final phase leads to Ragnaros's return.

Temporal proximity is not silently converted into causation. The Long Vigil merely precedes the Highborne exile in the graph; the Troll Wars victory merely precedes the much later fragmentation of Arathor; Thoradin's unification precedes the wartime alliance; and the alliance is modeled as part of the Troll Wars rather than as the cause of the war itself.

## Cartography and uncertainty

Three map states reuse the separate post-Sundering terrain created for Era 4:

- `long-vigil-new-kingdoms-early-map-research` — Hyjal, the second Well, Nordrassil, and the Long Vigil;
- `long-vigil-new-kingdoms-founding-map-research` — Highborne migration, Quel'Thalas/Amani overlap, Strom, and Arathor;
- `long-vigil-new-kingdoms-map-research` — the late plurality of human realms and divided dwarven centers.

The geometry is an original atlas reconstruction in worldspace-local coordinates. It deliberately encodes the following limits:

- the Highborne sea crossing is an inferred directional route, not a surveyed voyage;
- the Amani and Quel'Thalas influence areas overlap to communicate incompatible claims instead of presenting a false clean border;
- Arathor and the later seven kingdoms use broad influence areas rather than precise borders frozen to one year;
- the dwarven dispersal line is a diagram of division between Ironforge, Grim Batol, and the southern Dark Iron realm, not one literal march;
- the Troll Wars and War of the Three Hammers have `unknown` geographic certainty and no exact battle marker;
- actor and embodied-group placements are relational story composition with explicit editor notes, never claims of a person's measured coordinates.

## Visual representation audit

Seven original, transparent-background atlas cutouts were generated for this era: the Long Vigil kaldorei, Highborne exiles, Amani, Arathor, Dath'Remar, Thoradin, and the three dwarven clans. Returning Era 4 figures represent Illidan, Malfurion, and Tyrande; the existing Ragnaros figure returns only for his relevant late story beat. Realms, the Sunwell, Nordrassil, and settlement centers are represented through terrain, regions, or accessible labeled markers where that communicates them more honestly than a personified portrait.

All new figure prompts were text-only and prohibited logos, text, watermarks, copied game models, published character likenesses, faction heraldry, and signature costume or weapon designs. Their composition is interpretive and must receive human visual review for source-awareness, readability, unintended cultural coding, and adequate distinction at atlas scale.

## Interaction acceptance

The implementation is expected to preserve these behaviors:

- direct navigation to `/map?era=long-vigil-new-kingdoms` restores the late-era map state;
- starting the guide deterministically switches to the early Long Vigil state;
- advancing to the exile switches to the founding-kingdoms state and reveals the inferred migration;
- the Quel'Thalas pane can show overlapping northern claims without implying an exact boundary;
- advancing to the seven kingdoms switches to the late political state;
- battle phases do not interrupt the unnumbered Previous/Next guide;
- every key embodied actor in a pane receives a deliberate clickable visual and accessible text counterpart;
- the final pane continues the full-history tour to Era 6 only after Era 6 has a completed guide; until then it marks the current edge of the chronicle.

## Human-review checklist

- [ ] Verify all Chronicle page ranges against the exact registered edition.
- [ ] Review the approximate year labels and the span between the Troll Wars, Arathor's fragmentation, and the dwarven war.
- [ ] Confirm that the guide clearly distinguishes Highborne, later high-elven, kaldorei, human, Amani, and dwarven perspectives.
- [ ] Review whether “seven kingdoms” needs a more explicit enumerated dossier before publication.
- [ ] Review the Amani/Quel'Thalas overlap language for historical perspective and avoid framing survival as disappearance.
- [ ] Review strategic battle phases; reject any phase that implies unsupported tactics, front lines, or commanders.
- [ ] Review every relationship type, especially the causal links around the Troll Wars and Ragnaros's return.
- [ ] Review all region extents, settlement centers, routes, and actor scales in the live 3D scene.
- [ ] Review generated figures for originality, accessibility, cultural coding, and visual clarity.
- [ ] Verify keyboard navigation, reduced motion, skip-to-final-state behavior, URL restoration, WebGL fallback, and the complete full-history handoff.

