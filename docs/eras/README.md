# Nine-Era Build Program

## Purpose and editorial status

This is the implementation and research backlog for the nine user-approved navigation eras. The era names and summaries are approved product taxonomy; every person, place, boundary, date, battle, route, outcome, and causal link listed below remains a **research candidate** until it has claim-level citations and human lore review.

Application records live in `data/eras`. Each era owns a separate record in `data/map-states`, because the atlas must not imply that Azeroth had one permanent geography. Reviewed people and factions will live in `data/entities`; events and battles in `data/events` and `data/battles`; time-aware placements in `data/spatial-states`; routes and source geometry in `data/routes` and `data/geometry`; narrated sequences in `data/stories`.

## Build order and current state

| Order | Era ID | Primary atlas problem | Current state |
| --- | --- | --- | --- |
| 1 | `black-empire` | Primordial Azeroth and cosmic-scale domains | Research vertical slice implemented; human review pending |
| 2 | `ordering-of-azeroth` | Titan-forged campaigns and planetary reordering | Era shell and empty map state |
| 3 | `ancient-civilizations` | Changing empires across primordial Kalimdor | Era shell and empty map state |
| 4 | `war-of-the-ancients` | A campaign ending in a world-changing rupture | Era shell and empty map state |
| 5 | `long-vigil-new-kingdoms` | Post-Sundering states, migrations, and borders | Era shell and empty map state |
| 6 | `rise-of-the-horde` | Two worlds, the Dark Portal, and two wars | Era shell and empty map state |
| 7 | `third-war-frozen-throne` | Multi-front collapse and the path to Icecrown | Era shell and empty map state |
| 8 | `age-of-adventurers` | Many campaigns and repeated map-state changes | Era shell and empty map state |
| 9 | `modern-cosmic-age` | Fourth War through the evolving Worldsoul Saga | Era shell and empty map state |

Build the eras in this order. Finish the publication gate for one era before beginning production terrain for the next; reusable engine improvements may continue across eras.

## Definition of done for every era

1. Record the exact editions used and produce a claim ledger with chapter/page or first-party game-source citations.
2. Resolve the era boundary, chronology, disputed accounts, and geography confidence through human review.
3. Create a terrain brief, one or more map states where geography materially changes, and source GeoJSON. Unknown locations receive no exact marker.
4. Add only cited characters, factions, locations, events, battles, phases, routes, outcomes, and causal relationships.
5. Author an original-paraphrase guided tour. Every node has transcript text, duration, camera framing, highlighted subjects, and deterministic visual actions.
6. Verify timed autoplay, previous/next, the visible chapter timer, manual exploration through optional dossiers, reduced motion, keyboard access, deep links, and WebGL fallback.
7. Pass lore validation, focused tests, `pnpm check`, `pnpm build`, and a human editorial review.

## Source strategy

Chronicle Volumes 1–4 are the backbone, but volume boundaries are not era boundaries. Volume 1's publisher announcement describes a span from the creation of the Warcraft universe through *Warcraft: Orcs & Humans*, which makes it the starting research source for eras 1–6. The [Warcraft Wiki Chronicle Volume 1 index](https://warcraft.wiki.gg/wiki/World_of_Warcraft:_Chronicle_Volume_1) supplies the project's working topic, chart, reference, and map index until the complete book is available. Volumes 2–4 must receive edition-specific chapter/page indexing before their coverage is assigned at claim level. Dark Horse describes Volume 4 as covering *Mists of Pandaria*, *Warlords of Draenor*, *Legion*, *Battle for Azeroth*, and *Shadowlands*.

Era 9 extends beyond Chronicle Volume 4. Dragonflight and Worldsoul Saga material therefore requires first-party Blizzard sources and in-game citations rather than being attributed to Chronicle. Useful first-party research entry points include Blizzard's [Dragonflight overview](https://worldofwarcraft.blizzard.com/en-us/news/23785116), [Dragon Aspects history](https://worldofwarcraft.blizzard.com/en-us/news/23876527), [Visions of N'Zoth overview](https://worldofwarcraft.blizzard.com/en-us/news/23237904), and [Worldsoul Saga announcement](https://worldofwarcraft.blizzard.com/en-us/news/24025826). These links seed research only; they are not substitutes for claim-level citations.

## Era 1 — Cosmic Origins and the Black Empire

**Historical question:** How did cosmic forces, Azeroth's world-soul, the elemental conflicts, and the Old Gods produce the world ruled by the Black Empire?

**Research packets:** cosmology terms and certainty; primordial Azeroth terrain; elemental powers and domains; Old Gods and Black Empire control; world-soul claims; sequence and causality. Candidate people/factions, named locations, conflicts, and boundaries must come from reviewed Volume 1 citations.

**Map production:** maintain the deliberately non-Earth, primordial Azeroth research terrain; reveal one contextual overlay, site, route, or conflict focus at a time instead of stacking every available layer; distinguish exact, approximate, inferred, and unknown geography; do not force cosmic locations onto the planetary map. The Chronicle maps indexed by Warcraft Wiki may guide reconstruction, but the application must use original simplified geometry rather than copied map art unless Blizzard grants explicit redistribution permission.

**Animated tour spine:** cosmic frame → Azeroth's formation → elemental world → escalation of conflict → arrival/rise of the Old Gods → Black Empire domains → condition of the world before the ordering. Camera moves should begin wide, descend to world scale, reveal domains in sequence, animate only cited campaign routes, and finish in the exact map state inherited by Era 2.

**Implemented research baseline:** 13 people/powers/places, four events, two supported conflict groupings, an original source-guided terrain state, claim-level provenance, and a ten-node tour. The detailed source and cartography audit is in `docs/research/era-1-black-empire.md`. Human review remains required before promotion.

## Era 2 — Ordering of Azeroth

**Historical question:** How did the Titan-forged campaign alter political control, containment, and the physical world?

**Research packets:** Titan-forged forces and command relationships; Old God confrontations and imprisonments; keeper facilities; Ulduar; the Well of Eternity; ordering works; before/after geography; consequences inherited by later civilizations.

**Map production:** preserve Era 1 as the before-state and create a distinct ordered-Azeroth after-state. The tour may switch between them; it must not morph continents unless later measurements justify that feature. Facility markers and campaign paths need explicit geography confidence.

**Animated tour spine:** inherited Black Empire map → Titan-forged arrival → campaign fronts → pivotal confrontations → containment network → reshaped world and facilities → Well of Eternity → handoff to emerging civilizations.

**Completion emphasis:** the final scene must make the causal transition to Era 3 visible, with source-backed relationships rather than narration alone.

## Era 3 — Rise of the Ancient Civilizations

**Historical question:** Where did ancient powers emerge, expand, split, and collide before the War of the Ancients?

**Research packets:** troll polities and successor empires; aqir wars and divisions; mogu and Pandaria; early human development; kaldorei ascent; migration and control changes; contested chronology and terminology.

**Map production:** a primordial Kalimdor political atlas with time slices when borders change materially. Use region polygons for influence only when supportable; otherwise use labeled centers, uncertain extents, and routes. Avoid implying precise borders from prose that supports only broad regions.

**Animated tour spine:** ordered world → first centers of power → troll expansion → aqir conflict fronts → southern/eastern civilizations → kaldorei ascent → concentration around the Well → tensions that lead into Era 4.

**Completion emphasis:** favor a small number of defensible map snapshots over one visually busy composite of thousands of years.

## Era 4 — The War of the Ancients and the Sundering

**Historical question:** How did political choices around the Well enable invasion, resistance, and the rupture of primordial Kalimdor?

**Research packets:** Queen Azshara and court; resistance and allied forces; Burning Legion command; invasion sequence; major engagements and routes; Well of Eternity; causal chain to the Sundering; survivors and migrations.

**Map production:** at minimum, create pre-invasion primordial Kalimdor and post-Sundering world map states. Add intermediate campaign states only when they make the narrative clearer. Treat the Sundering as a deterministic state change with reduced-motion skip, not a decorative looping effect.

**Animated tour spine:** kaldorei high point → decisions at the Well → invasion opens → fronts spread → resistance converges → final confrontation → Sundering transition → survivor routes and new continents.

**Completion emphasis:** this era is the reference implementation for major world change and must prove that stories can switch map states without losing transcript, selection, or tour progress.

## Era 5 — The Long Vigil and the New Kingdoms

**Historical question:** How did peoples resettle, establish kingdoms, and change control across the post-Sundering world?

**Research packets:** Long Vigil; Quel'Thalas; Arathor and successor kingdoms; Khaz Modan; migrations; political boundaries; alliances and conflicts; dates and boundary ambiguity.

**Map production:** use post-Sundering continental terrain with several political time slices instead of one timeless kingdom map. Animate migrations and territorial transitions only where routes can be defended. Keep Kalimdor and Eastern Kingdoms readable at atlas scale.

**Animated tour spine:** immediate post-Sundering world → Long Vigil → major migrations → founding centers → consolidation of kingdoms → fragmentation and new powers → geopolitical world inherited by the Horde's rise.

**Completion emphasis:** prove that one era can contain sub-period navigation while remaining one understandable top-level selection.

## Era 6 — The Rise of the Horde and the First Two Wars

**Historical question:** How did events on Draenor cause the Dark Portal invasion and reshape the Eastern Kingdoms through two wars?

**Research packets:** Draenor before corruption; clans and Legion influence; Horde formation; Dark Portal; First War campaigns and Stormwind; Second War fronts; Alliance response; outcomes and aftermath. Chronicle Volumes 1 and 2 are candidate starting sources, with exact division determined by the source index.

**Map production:** this era needs at least two worldspaces or clearly separated theater maps—Draenor and Azeroth—plus portal linkage. Campaign routes should be phase-aware. Never draw the portal transition as an ordinary geographic line between coordinate systems.

**Animated tour spine:** Draenor baseline → corruption and consolidation → portal opens → First War routes → Stormwind outcome → Alliance formation/response → Second War fronts → Alliance victory and consequences.

**Completion emphasis:** prove cross-world storytelling while preserving local atlas coordinates and meaningful back/forward navigation.

## Era 7 — The Third War and the Frozen Throne

**Historical question:** How did the Scourge crisis, Arthas's choices, and the Legion's return collapse kingdoms and establish a new power in Icecrown?

**Research packets:** plague and Scourge; Arthas's arc; Lordaeron and Quel'Thalas; Legion invasion; migrations to Kalimdor; Mount Hyjal; Northrend and Frozen Throne sequence; resulting factions and control.

**Map production:** build Eastern Kingdoms, Kalimdor, and Northrend theater states with a legible chronological progression. Use city-state changes and destruction states sparingly but clearly. Long-distance movements need route phases and source confidence.

**Animated tour spine:** northern crisis → Arthas's decisions → Lordaeron collapse → Quel'Thalas campaign → Legion return → westward convergence → Mount Hyjal → race to Icecrown → new order at the Frozen Throne.

**Completion emphasis:** this is the stress test for intertwined character, faction, battle, and causal stories without turning the atlas into tactical simulation.

## Era 8 — The Age of Adventurers

**Historical question:** How did successive campaigns transform Azeroth and its relationships from the opening of World of Warcraft through Legion?

**Research packets:** renewed faction conflict; Ahn'Qiraj; Outland; Northrend; Cataclysm; Pandaria; alternate Draenor; Legion. Establish a strict editorial boundary with Era 9 and a source ledger spanning Chronicle Volumes 3–4 plus first-party game records where needed.

**Map production:** treat this as a container era with selectable sub-periods and separate states for material geographic changes, especially pre-/post-Cataclysm. Outland, Northrend, Pandaria, alternate Draenor, and Legion theaters should lazy-load; do not combine them into one scene.

**Animated tour spine:** launch-era world → Ahn'Qiraj → Outland → Northrend → Cataclysm state change → Pandaria → alternate Draenor → Legion invasion and resolution → wounded-world handoff to Era 9.

**Completion emphasis:** define a sub-era data pattern before content production. The top selector remains nine eras; a secondary chapter control handles expansion-scale stories inside this era.

## Era 9 — The Modern Cosmic Age

**Historical question:** How do the Fourth War, N'Zoth, the Shadowlands, the Dragon Isles, and the Worldsoul Saga increasingly center Azeroth itself?

**Research packets:** Fourth War fronts; N'Zoth's release and assaults; Shadowlands theaters; Dragon Isles awakening; current Worldsoul Saga chapters; retcons and evolving claims. Chronicle Volume 4 is a candidate source through Shadowlands, while later claims require current first-party sources and in-game evidence.

**Map production:** use separate worldspaces for non-Azeroth realms and separate Azeroth states where control or geography changes. Dragon Isles terrain should load independently. Current-saga material needs a visible cutoff date/version so the atlas never presents an evolving storyline as complete.

**Animated tour spine:** Fourth War escalation → faction-war consequences → N'Zoth threat → Shadowlands transition → return to Azeroth → Dragon Isles awakening → world-soul focus → current Worldsoul chapter → explicit “ongoing record” ending.

**Completion emphasis:** add a source freshness review and an “ongoing” status before publication. Never infer unreleased outcomes.

## Story-animation authoring template

Each tour node should answer one narrative question and produce one visible change:

```text
setup narration
→ camera instruction
→ highlight the people/place/battle being discussed
→ animate a cited route, domain, or map-state change
→ hold long enough for transcript/voice-over
→ fill the visible chapter timer
→ settle into a deterministic final state
→ advance automatically when the timer fills
```

Recommended node fields are already supported: narration, explicit duration, camera pose, record references, visual actions, and previous/next links. The atlas presents only Previous and Next controls during a tour; source records remain available through separate permanent dossiers. Future voice-over attaches to these nodes; transcript text remains authoritative and accessible.

Default tour pacing targets a deliberate 90–100 spoken words per minute with roughly three seconds of additional settling time for map and camera changes. Explicit node durations may run longer when an embedded conflict has multiple animated phases.
