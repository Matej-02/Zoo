# Quality assurance report

The rotatable 2.5D release passed **27 of 27 automated browser regression checks**.

## Verified behavior

1. Startup completes without JavaScript errors.
2. All catalog references validate.
3. At least 20 animal species are available.
4. At least 30 foliage choices are available.
5. Six path types are available.
6. Specialist educational attractions are present.
7. Five land expansions are purchasable.
8. Aquatic species are included.
9. Isometric screen/world coordinate conversion is accurate in all four rotations.
10. Camera controls rotate through four directions and update the compass label.
11. Camera direction persists in saves.
12. Construction targets the correct world tile after camera rotation.
13. Catalog data contains no emoji artwork fallbacks.
14. Paths can be placed, upgraded, and removed.
15. Gates replace existing fences correctly.
16. Foliage obeys logical terrain restrictions.
17. Staff can be hired and dismissed; counters and salaries update.
18. The inspector updates live after habitat changes.
19. Management sections collapse independently.
20. Calendar and finance ledgers roll over monthly.
21. Finance graphs, breakdowns, and forecast values render.
22. Tour guides lead paid groups.
23. Janitors and bins keep litter manageable.
24. Land expansions unlock correctly.
25. Every construction item has SVG catalog artwork.
26. Every construction item has hover information.
27. New Zoo clears current and legacy save keys.

## Additional checks

- Every JavaScript file passes `node --check`.
- Version 6 and older save keys are recognized and migrated.
- The project runs without a bundler or third-party runtime library.
- The 2.5D world was visually inspected with two habitats, aquatic terrain, several foliage types, shops, education buildings, guests, animals, and all three staff roles.
- Average empty-world draw time in headless Chromium was approximately 9 ms per frame during testing.

## Running the regression suite

The test requires Python, Playwright, and Chromium:

```bash
python -m pip install playwright
python -m playwright install chromium
python tests/regression.py
```

The suite assembles the static project in a headless browser and saves `tests/regression-screenshot.png`. The repeatable visual scenario (`tests/visual_scenario.py`) creates `tests/world-2_5d-screenshot.png` and the four-direction comparison `tests/camera-directions.png`.
