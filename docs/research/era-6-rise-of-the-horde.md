# Era 6 Research Audit — The Rise of the Horde and the First Two Wars

Status: public `research` preview implemented; human lore, citation, chronology, cartography, interpretation, and visual review required before promotion.

## Scope and release boundary

The slice begins on intact Draenor before Kil'jaeden's campaign against Velen's exiles and ends when the Alliance defeats the Old Horde and destroys the original Dark Portal at the close of the Second War. The later Alliance expedition to Draenor, Ner'zhul's additional portals, Draenor's shattering, the internment-camp era, and Thrall's formation of the New Horde belong to later historical treatment and the handoff toward Era 7.

This era joins two worlds. Draenor and Azeroth have independent local `0..10000` atlas coordinate systems. The Dark Portal is represented as corresponding anchors and a deterministic story transition; no line, distance, or shared projection is invented between planets.

## Source ledger

| Source ID | Use | Review condition |
| --- | --- | --- |
| `warcraft-chronicle-volume-2` | Backbone for the Rise of the Horde, First War, and Second War | Verify all working page spans against the English 2017 hardcover before promotion |
| `blizzard-chronicle-volume-2-overview` | First-party confirmation of the official source volume | Overview only; never substitute it for claim pages |
| `blizzard-rise-of-the-horde-library` | First-party broad account of Legion manipulation, Mannoroth's blood, the Horde, and devastation on Draenor | Use for broad corroboration, not details absent from the article |
| `blizzard-burning-crusade-draenor-history` | First-party account of the draenei on Draenor, Kil'jaeden, Ner'zhul, Gul'dan, the draenei war, and the Dark Portal | Preserve its perspective and compression explicitly |
| `blizzard-tides-of-darkness-library` | First-party account of Stormwind's fall, the Alliance of Lordaeron, and the Second War | Its short promotional summary compresses First War leadership; Chronicle review governs detailed sequencing |

Working Chronicle chapter spans are pages 62–103 for **Rise of the Horde**, 104–145 for **The First War**, and 146–181 for **The Second War**. These broad spans are indexing aids until a human verifies exact claim pages.

First-party entry points:

- [World of Warcraft Chronicle Volume II](https://worldofwarcraft.blizzard.com/en-us/media/book/world-of-warcraft-chronicle-vol-2)
- [The Library — Rise of the Horde](https://worldofwarcraft.blizzard.com/en-gb/news/10001380/the-library-rise-of-the-horde)
- [Burning Crusade Classic — The Story So Far](https://worldofwarcraft.blizzard.com/en-us/news/23679744/burning-crusade-classic-the-story-so-far)
- [The Library — Tides of Darkness](https://worldofwarcraft.blizzard.com/en-gb/news/9979033/the-library-tides-of-darkness)

## Guided-history spine

The fifteen-pane guide, **The Road That Crossed the Stars**, follows:

1. Orc clans and draenei communities on intact Draenor.
2. Kil'jaeden finds the draenei and chooses the orcs as his instrument.
3. Ner'zhul is deceived and later resists the Legion's course.
4. Gul'dan forms the Shadow Council behind Blackhand's visible rule.
5. Many clans accept Mannoroth's blood while Durotan keeps the Frostwolves from it.
6. Shattrath falls; draenei survivors endure; Draenor sickens.
7. Gul'dan and Medivh open the Dark Portal; the atlas changes worldspace.
8. The First War widens between the Horde and Stormwind.
9. Orgrim replaces Blackhand and attacks the Shadow Council's power.
10. Stormwind falls and Lothar carries survivors north.
11. The Alliance of Lordaeron forms.
12. The Second War spreads across multiple theaters.
13. Gul'dan abandons Orgrim's campaign and weakens the Horde.
14. Lothar falls near Blackrock; Turalyon rallies the Alliance.
15. The Alliance drives the Horde to the portal and destroys the gateway.

Battle phases live in the two permanent dossiers instead of interrupting the unnumbered guide. Narration is original and paced for approximately 82 words per minute plus visual settling time.

## Causality and ambiguity audit

The graph asserts the supported causal spine from Kil'jaeden's revenge through Ner'zhul's deception, the Shadow Council and blood pact, the Dark Portal and First War, Stormwind's fall and the Alliance's formation, then Gul'dan's defection and Turalyon's rally as material contributors to the Horde's defeat.

Several relationships remain chronology rather than causation: Ner'zhul's deception precedes Gul'dan's council; the blood pact precedes Shattrath's fall; the fall precedes the Dark Portal; Alliance formation precedes the Second War. Orgrim's succession before Stormwind's final fall is currently marked `inferred` pending exact Chronicle page review because Blizzard's short *Tides of Darkness* overview compresses Blackhand's role.

The guide does not present all orcs as willing participants in one choice, does not erase draenei survivors after Shattrath, and does not treat the Old Horde as identical to later Horde polities.

## Cartography audit

Four map states carry the era:

- `rise-of-the-horde-draenor-before-map-research`: original intact Draenor and broad coexistence;
- `rise-of-the-horde-draenor-corrupted-map-research`: same intact landforms with restrained war and fel decline;
- `rise-of-the-horde-first-war-map-research`: inherited post-Sundering Azeroth with southern First War pressure;
- `rise-of-the-horde-second-war-map-research`: the northern coalition, broad Horde offensive, Blackrock turning point, and counteroffensive.

All four campaign routes are inferred strategic diagrams. Neither war receives a single exact battlefield marker. Shattrath, Stormwind, Lordaeron, Blackrock Spire, and both portal anchors are approximate atlas-scale centers, not reproduced coordinates or settlement footprints. Political regions are broad influence reconstructions, not surveyed borders.

## Visual and interaction acceptance

- Starting the guide must show intact Draenor.
- The Ner'zhul pane must change to the scarred Draenor state without changing coastline or terrain geometry.
- The Dark Portal pane must switch from `draenor` to `azeroth`; no route may bridge the two coordinate systems.
- The Stormwind pane must preserve First War progress and the inferred southern route.
- The Alliance pane must switch to the Second War state.
- Previous/Next across the portal must restore the correct worldspace and map state deterministically.
- Detailed battle playback must stay outside the continuous guide.
- Every key named figure and embodied group requires an original clickable visual; markers alone are insufficient.
- Reduced motion, skip, keyboard access, dossiers, URL restoration, and WebGL fallback remain part of the reusable acceptance contract.

## Human-review checklist

- [ ] Verify exact Chronicle page citations and 2017 hardcover pagination.
- [ ] Review the working year labels, especially the opening span and Year 6 endpoint.
- [ ] Reconcile Blackhand/Orgrim wording with the exact First War sequence and the compressed Blizzard web overview.
- [ ] Review Ner'zhul, Gul'dan, Durotan, Mannoroth, and clan agency language for perspective and overgeneralization.
- [ ] Review draenei language so devastation never implies extinction or a history defined only by victimhood.
- [ ] Review First and Second War strategic phases against Chronicle without importing unsupported RTS mission order.
- [ ] Review all Draenor and Azeroth regions, routes, and approximate site anchors.
- [ ] Confirm the portal transition never implies physical distance between worldspaces.
- [ ] Review original terrain and character/group figures for source-awareness, originality, accessibility, and cultural coding.
- [ ] Run `pnpm check`, `pnpm build`, the full Playwright suite, and a desktop visual audit before commit and push.
