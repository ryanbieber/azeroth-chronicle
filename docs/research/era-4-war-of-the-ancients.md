# Era 4 Research Audit — The War of the Ancients and the Sundering

## Status and boundary

This era is implemented as a public research preview. It begins with the intact kaldorei empire inherited from Era 3, follows the Highborne portal and Burning Legion invasion, and ends when survivors reach the lands around Mount Hyjal after the Great Sundering. The second Well, Nordrassil, Illidan's imprisonment, Highborne exile, and the institutions of the Long Vigil remain outside this slice and belong to Era 5.

The guide follows the broad end-of-Chapter-III sequence in the 2016 English edition of *World of Warcraft: Chronicle Volume 1*. The project has not completed human verification of the working page ranges, every named participant, the ordering of simultaneous fronts, or the relationship between Chronicle's condensed account and earlier narrative versions. No record in this slice has been promoted beyond `contentStatus: research`.

The War of the Ancients novels contain a time-travel narrative and a more detailed participant sequence. They have not been silently blended into this first pass. If that trilogy is later added as a source, its account, edition, and tensions with the Chronicle framing must be indexed at claim level rather than summarized from memory.

## Source ledger

| Source | Indexed location | Claims routed through it |
| --- | --- | --- |
| *World of Warcraft: Chronicle Volume 1* | Chapter III, “The War of the Ancients — opening,” working pp. 99–101 | Azshara's court, Highborne ritual, Sargeras as intended entrant, and the Legion's arrival |
| *World of Warcraft: Chronicle Volume 1* | Chapter III, “The War of the Ancients — resistance and allies,” working pp. 101–103 | resistance formation; roles of Malfurion, Tyrande, Illidan, and Cenarius; wider alliance |
| *World of Warcraft: Chronicle Volume 1* | Chapter III, Dragon Soul and betrayal, working pp. 103–104 | empowerment of the Dragon Soul and Neltharion's betrayal |
| *World of Warcraft: Chronicle Volume 1* | Chapter III, Sundering and aftermath, working pp. 104–106 | final convergence, failed entry of Sargeras, collapse of the Well, Sundering, Maelstrom, and movement toward Hyjal |
| Blizzard, “Patch 4.3 Dungeons Preview, Part Two: Well of Eternity” | “Well of Eternity” | first-party corroboration for Zin-Azshari, the Highborne portal, Azshara's role, the final struggle, Sundering, and Maelstrom |
| Blizzard, “Warbringers: Azshara” | official synopsis and cinematic | first-party corroboration for the continents breaking and Azshara and followers surviving beneath the sea through transformation |
| Blizzard, “The Story So Far: Take Wing Through Time with the Dragon Aspects” | “The Betrayal of Neltharion” | first-party corroboration for the artifact later called the Demon Soul and Neltharion's attack upon the other dragonflights |

The working Chronicle spans after page 99 must be checked against the complete selected edition before publication. Public narration is original paraphrase. No Chronicle scan, dungeon art, cinematic frame, game model, faction emblem, or published map is shipped with the application.

## Causal spine

The guide distinguishes source-backed causation from sequence:

1. Azshara's accession and centralized court precede the war; accession alone is not treated as sufficient cause.
2. Azshara participates in the Highborne decision to use the Well as a gateway.
3. The Highborne ritual directly enables the Legion invasion.
4. The invasion causes the continent-spanning War of the Ancients and prompts organized resistance.
5. Malfurion, Tyrande, Illidan, and Cenarius participate in or ally with the resistance; their distinct roles are not reduced to one hero causing the coalition.
6. The Dragon Soul is part of the war, and Neltharion controls it during his betrayal.
7. The betrayal precedes the final convergence but is not recorded as the cause of the defenders reaching the Well.
8. The struggle at the gateway causes its collapse before Sargeras enters.
9. The portal and Well collapse causes the Great Sundering.
10. The Sundering produces the Maelstrom and forces survivor movement.
11. Arrival around Mount Hyjal precedes the Long Vigil without pre-authoring Era 5's later institutions.

The duplicated event `causedByEventIds`/`causesEventIds` and relationship edges point in the same direction and remain acyclic under build validation.

## Cartography decision

The era uses three discrete terrain states because one texture cannot truthfully represent the world before, during, and after the catastrophe:

- `war-of-the-ancients-prewar-map-research` inherits Era 3's intact landmass and terrain. It adds only source-aware focuses for the Well, Zin-Azshari, Azshara, the Highborne, the kaldorei empire, and the remote intended entrant at the portal.
- `war-of-the-ancients-invasion-map-research` preserves the same coastline and height field while changing the environmental surface to a scarred wartime condition. A dashed influence polygon communicates broad Legion pressure. A single inferred line communicates resistance convergence toward the Well; it is not a tactical campaign reconstruction.
- `war-of-the-ancients-map-research` replaces the old terrain with an original post-Sundering composition of separated landmasses, islands, open sea, and a central Maelstrom. It does not morph the previous mesh and does not claim exact continent outlines.

The story selects a complete map state on every node. The generic `set_map_state` action resets the terrain and relevant geometry while the story store retains the guide and node. Reduced-motion users receive the same deterministic final state without camera interpolation.

The battle has `geographicCertainty: unknown` and therefore no battle marker or exact geometry. Its five dossier phases use map state, broad region, relationship, focus, and inferred-route actions to explain the strategic sequence without turning the atlas into unit simulation.

The post-Sundering survivor route is explicitly inferred. It represents a destination and historical handoff, not one ship track, one company, or a claim that all survivors moved together.

## Visual representation audit

Every key figure or embodied group introduced by the guide has a deliberate clickable representation:

- Queen Azshara reuses the original Era 3 portrait to preserve visual continuity.
- The Highborne court, Burning Legion, night elf resistance, and kaldorei empire have collective map visuals.
- Malfurion, Tyrande, Illidan, Cenarius, Neltharion, and Sargeras have contextual figures.
- The Dragon Soul is represented through Neltharion's carried artifact and a separate text-first dossier rather than an unsupported permanent marker.
- Zin-Azshari, the Well, Maelstrom, and Mount Hyjal are landscape/site subjects with accessible labels and dossiers.

Sargeras receives relational placement because he does not physically arrive. Character and collective figures use `visualPresence: contextual`, appearing only when their story node highlights them or a reader selects them. Every dossier and spatial state says when the composition is interpretive rather than geographic.

The two terrain states were generated by editing the repository-owned Era 3 texture. The actor assets used text-only prompts. Prompts prohibited source scans, game assets, emblems, copied cartography, published costume designs, and imitation of existing artwork. Asset paths and origin summaries are recorded in `docs/audits/asset-origin.md`.

## Guided-history and interaction audit

- Twelve unnumbered panes move from the inherited empire to survivor refuge.
- Panes 1–3 use the intact pre-invasion state; panes 4–9 use the invasion state; panes 10–12 use the post-Sundering state.
- Every pane has an explicit map state, camera pose, record references, deterministic actions, transcript text, and a duration calculated for the project's slow narration target.
- The public guide contains no nested conflict playback. Five strategic phases remain in the permanent War of the Ancients conflict dossier.
- The transition into the post-Sundering state retains the current node, selection, Previous/Next controls, visible timer, and session-persisted guide state.
- Moving Previous from the Sundering returns to the invasion texture, and moving Next reapplies the same post-Sundering result.
- The final pane stops at the causal threshold of Era 5.

## Human review checklist

- Confirm the complete 2016 English edition and every working page range from page 99 through page 106.
- Compare Chronicle's condensed account with the earlier War of the Ancients narrative sources and record conflicts, additions, or perspective differences as separate claims.
- Review whether `-10000` should remain a shared approximate boundary or whether the UI should display only the relative label.
- Verify the naming chronology for “Dragon Soul” and “Demon Soul.”
- Review each causal edge independently from the narrative sequence.
- Compare Zin-Azshari, the Well, Mount Hyjal, and the post-Sundering continental composition with licensed reference material without tracing it.
- Review the inferred Legion pressure polygon and both route lines; retain `unknown` for the conflict if source detail remains inadequate.
- Review all actor art for originality, ancient-period readability, accessibility, cultural tone, and accidental resemblance to licensed compositions.
- Read all twelve transcripts aloud at the intended pace before voice recording.
- Promote records only after lore, citation, accessibility, visual, and cartographic review all pass.
