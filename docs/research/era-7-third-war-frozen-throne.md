# Era 7 Research Audit — The Third War and the Frozen Throne

Status: public `research` preview implemented; human lore, citation, chronology, cartography, interpretation, and visual review required before promotion.

## Scope and release boundary

The slice opens in the consequences of the Second War, with Thrall's liberation of interned orcs and the plague crisis in Lordaeron. It ends after Illidan's Outland campaign, the contest at Icecrown, and Arthas's ascent at the Frozen Throne. The later founding and development of player-era capitals, campaigns experienced in *World of Warcraft*, and the eventual Northrend war belong to Era 8.

The era deliberately intertwines several histories without reducing them to one tactical campaign: Arthas and the northern kingdoms, Thrall and the New Horde, the Legion's return and the Hyjal coalition, Sylvanas and the Forsaken, and Illidan's movement through Outland to Icecrown. Outland and Azeroth retain independent `0..10000` atlas coordinate systems. The guide changes map states at the world transition; it never draws a geographic line between them.

## Source ledger

| Source ID | Use | Review condition |
| --- | --- | --- |
| `warcraft-chronicle-volume-3` | Backbone candidate for the Third War, Hyjal, Outland, and Frozen Throne sequence | Record exact English edition, chapter, and page locations for every active claim before promotion |
| `blizzard-warcraft-iii-story-so-far` | Broad first-party chronology for the Lordaeron plague, Arthas, Thrall, Scourge, Legion, and night elves | Do not infer mission-level events, dialogue, or route geometry from the overview |
| `blizzard-warcraft-iii-reforged-overview` | First-party confirmation of the campaign's broad geographic scope and historical outcomes | Promotional overview only; use Chronicle or in-game evidence for detail |
| `blizzard-mount-hyjal-history` | First-party support for Malfurion using Nordrassil's power to destroy Archimonde and repel the Legion and Scourge | Review coalition composition, perspective, and compressed battle sequence against Chronicle and game sources |
| `blizzard-burning-crusade-story-so-far` | Broad first-party support for Illidan's Outland and Icecrown sequence | Keep Era 5 founding claims separate from Era 7 material; verify every later claim against its exact section |

`chronicle-v3-third-war-research` is intentionally a working citation with no page numbers. Its note explicitly blocks promotion until a human researcher supplies edition-specific locations. The web citations identify sections and support only the broad claims actually stated by those sources.

First-party entry points:

- [Warcraft III: The Story So Far](https://news.blizzard.com/en-gb/article/23229617/warcraft-iii-the-story-so-far)
- [Warcraft III: Reforged overview](https://news.blizzard.com/en-us/article/23290205/play-warcraft-iii-reforged-and-relive-the-beginnings-of-world-of-warcraftnow-live)
- [Mount Hyjal: In Defense of Nordrassil](https://worldofwarcraft.blizzard.com/en-gb/news/9997945)
- [Burning Crusade Classic: The Story So Far](https://worldofwarcraft.blizzard.com/en-us/news/23679744/burning-crusade-classic-the-story-so-far)

## Guided-history spine

The fifteen-pane guide, **When the Northern Lamps Went Dark**, follows:

1. Thrall liberates interned orcs and gathers the New Horde.
2. The plague enters Lordaeron through ordinary life.
3. Arthas orders the purge of Stratholme and parts from Jaina's course.
4. Arthas pursues the crisis to Northrend and claims Frostmourne.
5. He returns in the Scourge's service and Lordaeron falls.
6. Quel'Thalas and the Sunwell fall; Sylvanas is transformed.
7. The Scourge campaign enables the Legion's return.
8. Thrall leads the New Horde west to Kalimdor.
9. Grom dies breaking Mannoroth's immediate bond.
10. Night elves, Horde forces, and Alliance survivors accept a temporary common defense.
11. The defense of Mount Hyjal buys time for Archimonde's destruction.
12. Sylvanas and other free-willed undead establish the Forsaken in fallen Lordaeron.
13. Illidan and his coalition close portals and seize power in Outland.
14. The map returns to Azeroth for the contest at Icecrown.
15. Arthas ascends at the Frozen Throne and hands the archive to the Age of Adventurers.

The guide remains one unnumbered reader-facing sequence. It never starts conflict playback. The five phases of each strategic conflict remain in the permanent battle dossiers. Narration is original and paced for approximately 82 words per minute plus visual settling time.

## Causality and ambiguity audit

The causal graph follows the plague into the Stratholme crisis, Arthas's northern pursuit and fall, the destruction of Lordaeron and Quel'Thalas, and the Scourge's role in enabling the Legion's return. A second chain follows Thrall's liberation and westward migration into Grom's final confrontation and the Hyjal coalition. The Hyjal outcome then precedes the Forsaken's emergence and Illidan's Outland campaign; Outland precedes the Icecrown assault, Arthas's victory, and his ascent.

Edges marked `precedes` preserve chronology where the current broad sources do not justify a direct causal claim. The atlas does not treat the New Horde as identical to the Old Horde, the Hyjal coalition as a permanent unified faction, or the Forsaken as interchangeable with the Scourge. The Arthas and Sylvanas portraits use split-state visual interpretations; their records explicitly say that successive appearances are not simultaneous.

## Cartography audit

Four map states carry the era:

- `third-war-northern-crisis-map-research`: plague pressure, Lordaeron, Stratholme, Quel'Thalas, the Sunwell, and Arthas's inferred northern expedition;
- `third-war-hyjal-map-research`: the westward passage, Kalimdor, Grom and Mannoroth, the Legion's inferred advance, and the coalition's convergence at Hyjal;
- `third-war-outland-map-research`: a separate Outland worldspace for portal closures and Illidan's coalition;
- `third-war-frozen-throne-map-research`: the approximate Icecrown focus and an inferred local diagram of the final contest.

The three Azeroth states reuse the original post-Sundering terrain plate established for Era 6; political and story meaning changes through state-specific geometry rather than pretending the land itself changed. The Outland state uses its own original interpretive terrain and height map. All seven routes are inferred strategic diagrams with editor notes. The two conflict dossiers have `unknown` battle geography and no exact battle markers. Actor anchors are relational, contextual story foci rather than permanent coordinates.

## Visual and interaction acceptance

- Starting the guide must select the northern-crisis state.
- The westward-crossing pane must switch to the Hyjal state and show only an inferred local route.
- The Forsaken pane must return to the northern state without losing guide progress.
- The Outland pane must switch worldspace without drawing a cross-world route.
- The Icecrown pane must return to Azeroth and settle on the Frozen Throne state.
- Previous and Next across both world transitions must restore deterministic state.
- Detailed conflict playback must remain outside the continuous guide.
- Arthas, Jaina, Kel'Thuzad, Sylvanas, Thrall, Grom, Archimonde, Illidan, Mannoroth, and the key embodied groups have deliberate clickable visual representation.
- The Scourge, New Horde, Hyjal defenders, Forsaken, and Illidan's Outland coalition use original interpretive group images rather than generic markers.
- Reduced motion, skip, keyboard access, dossiers, URL restoration, and WebGL fallback remain part of the reusable acceptance contract.

## Human-review checklist

- [ ] Record the exact Chronicle Volume 3 edition, chapters, and page spans for all claims and relationships.
- [ ] Verify the working Year 20–22 boundary and all relative chronology labels.
- [ ] Review Arthas's agency, Stratholme wording, Frostmourne causality, and the distinction between intention and outcome.
- [ ] Review Quel'Thalas, the Sunwell, Sylvanas, and Forsaken language for perspective and compressed chronology.
- [ ] Review the New Horde wording so liberation and reform do not erase prior victims or imply uniform motives.
- [ ] Review Grom and Mannoroth language so one confrontation is not made to settle every later question of corruption or responsibility.
- [ ] Review the Hyjal coalition and battle phases without importing unsupported RTS mission geography.
- [ ] Review Illidan's coalition, Outland sequence, and Icecrown outcome against exact sources.
- [ ] Review all four map states, seven inferred routes, approximate locations, and relational actor anchors.
- [ ] Confirm the Outland/Azeroth transitions never imply shared coordinates or physical distance.
- [ ] Confirm provenance and originality of all pre-existing Era 7 character and Outland terrain assets before promotion.
- [ ] Review every generated group illustration for accessibility, originality, cultural coding, and its interpretive label.
- [ ] Run `pnpm check`, `pnpm build`, the full Playwright suite, and a desktop visual audit before commit and push.
