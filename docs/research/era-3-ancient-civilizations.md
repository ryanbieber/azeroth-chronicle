# Era 3 Research Audit — Rise of the Ancient Civilizations

## Status and boundary

This era is implemented as a public research preview. It begins as life and troll societies flourish across the ordered world and ends with Azshara's accession near the height of prewar kaldorei power. The War of the Ancients, the Burning Legion's invasion, and the Sundering remain outside this slice and belong to Era 4.

The current guide follows the broad Chapter III sequence in the 2016 English edition of *World of Warcraft: Chronicle Volume 1*. The project has not yet completed human verification of every page range, date, narrator perspective, named participant, or map interpretation. No record in this slice has been promoted beyond `contentStatus: research`.

This first pass deliberately omits several valid future packets—including ancient human development, the full mantid cycle, the Zandalari invasion of post-mogu Pandaria, and individual troll successor histories—rather than reducing thousands of years to an overfilled tour. They should be added only when their own claims, visuals, and time states can be reviewed without obscuring the era's causal spine.

## Source ledger

| Source | Indexed location | Claims routed through it |
| --- | --- | --- |
| *World of Warcraft: Chronicle Volume 1* | Chapter III, “The Empire of Zul and the Awakening of the Aqir,” pp. 70–76 | early troll powers, Zuldazar, the Empire of Zul, aqir awakening, war, pursuit, and division |
| *World of Warcraft: Chronicle Volume 1* | Chapter III, “The Mogu Empire,” pp. 77–84 | divided mogu kingdoms, Lei Shen's rise, imperial unification, and southern conquest |
| *World of Warcraft: Chronicle Volume 1* | Chapter III, “The Pandaren Revolution,” working range pp. 85–90 | Kang's unarmed discipline, wider resistance, and the empire's fall |
| *World of Warcraft: Chronicle Volume 1* | Chapter III, “The Well of Eternity and the Rise of the Night Elves” and “Queen Azshara,” working range pp. 93–99 | dark troll settlement, transformation, kaldorei expansion, and Azshara's accession |
| Blizzard, “Patch 4.1: Rise of the Zandalari Trailer Revealed” | historical introduction | first-party corroboration that troll empires once extended broadly across ancient Kalimdor |
| Blizzard, “Know Thy Enemy: Portrait of a Thunder King” | “The First Emperor: Lei Shen” | first-party corroboration for Lei Shen's unification of the mogu and imperial conquest |

The Dark Horse official sample confirms the early Chapter III material through the first part of the southern history. Later working ranges were located through the project's secondary index and must be checked against the complete selected edition. Public narration is original paraphrase; no source scan, prose block, faction insignia, or published cartography ships with the application.

## Causal spine

The guide keeps causation distinct from chronology:

1. The ordered world provides the conditions in which early troll societies flourish; the relationship is recorded as `precedes`, not a simplistic one-event cause.
2. The aqir awakening directly causes the troll–aqir war.
3. The long troll pursuit causes the surviving aqir populations to divide between distant refuges.
4. The aqir aftermath precedes, but does not cause, the rise of Lei Shen in the southern lands.
5. Lei Shen's unification enables the mogu imperial conquests.
6. Mogu domination produces the conditions for the pandaren-led revolution; Kang participates through a repeatable unarmed discipline.
7. The southern revolution precedes, but does not cause, the dark troll migration toward the Well.
8. Long proximity to the Well transforms the dark troll people into the kaldorei.
9. Kaldorei expansion breaks the previous political balance and precedes Azshara's accession.
10. Azshara's accession is the explicit handoff to Era 4; the guide does not narrate the coming invasion as if it has already occurred.

The `causesEventIds` fields are used only for the supported causal portions of this chain. Mere temporal adjacency is carried by source-aware `precedes` relationships.

## Cartography decision

One timeless political map would misrepresent this era. The guide therefore selects among three discrete states over one inherited primordial landmass:

- `ancient-civilizations-early-map-research` frames the early troll powers and aqir pressure.
- `ancient-civilizations-southern-map-research` frames the mogu empire and the later revolution in the southern theater.
- `ancient-civilizations-map-research` frames the rise of the kaldorei around the Well and serves as the era's default after-state.

The terrain texture is an original transformation of the repository's Era 2 ordered-world painting. It preserves coastline and major terrain continuity while adding small, noncommittal signs of settlement and early roads. Each state changes the supported political emphasis through separate inferred GeoJSON regions. The regions are not hard borders; their dashed outlines, low opacity, notes, and `geographicCertainty: inferred` status all communicate that prose supports broad influence rather than surveyed frontiers.

The troll–aqir conflict has `geographicCertainty: unknown`. It therefore receives no battle marker or invented route. Its four dossier phases use camera and relationship changes to explain continental pressure, coalition, pursuit, and division without laundering narrative direction into exact geography.

## Visual representation audit

Original generated visuals provide deliberate, clickable representation for every key figure or embodied group introduced by the guide:

- the Empire of Zul coalition;
- the aqir;
- Lei Shen;
- Kang and, through a separately selectable dossier, the ancient pandaren community he represents;
- the dark trolls;
- the emerging kaldorei civilization; and
- Queen Azshara.

The mogu empire is communicated through the southern terrain, an inferred influence region, a labeled focus, and Lei Shen's contextual figure. Zuldazar and the Well are represented as accessible landscape sites. Figures appear only in their relevant story beats where `visualPresence: contextual` applies. Every dossier states when an image or placement is interpretive rather than geographic.

The generated art used text-only prompts except for the terrain transformation, which used the repository-owned Ordering texture as its sole edit target. Prompts expressly prohibited source scans, game assets, faction insignia, copied cartography, and imitation of published artwork. Asset paths and origins are recorded in `docs/audits/asset-origin.md`.

## Guided-history and interaction audit

- Twelve unnumbered panes move from the ordered-world handoff to Azshara's accession.
- Panes 1–5 use the early troll/aqir state; panes 6–9 use the southern state; panes 10–12 use the kaldorei state.
- Every pane has an explicit map state, camera pose, supported record references, deterministic actions, transcript text, and a 44–50 second timing budget.
- The continuous public guide contains no nested battle playback. The four strategic phases remain in the permanent Troll–Aqir War dossier.
- The final pane names the next danger without narrating Era 4 events prematurely.
- Existing previous/next, autoplay, reduced-motion, keyboard, session persistence, dossier, deep-link, and full-history handoff behavior is reused without an Era 3 conditional.

## Human review checklist

- Confirm the complete 2016 English edition and every page range, especially the working ranges after page 84.
- Review the approximate `-16000` and `-10000` boundaries and decide whether the UI should retain numeric values or only date labels.
- Review every causal edge independently from the prose chronology.
- Decide which omitted packets belong in this top-level era and which warrant optional dossiers or sub-periods.
- Compare the inferred regions and Zuldazar focus with licensed reference material without tracing it; record each intentional simplification.
- Review the shared Kang/pandaren visual treatment and all other actor art for clarity, originality, cultural tone, and interpretive labeling.
- Read all twelve transcripts aloud at the intended slow pace before voice recording.
- Promote records only after lore, citation, accessibility, visual, and cartographic review all pass.
