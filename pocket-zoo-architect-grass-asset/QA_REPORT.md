# Quality assurance report

The Living Zoo release passed **33 of 33 automated browser regression checks**.

## Verified behavior

1. Startup completes without JavaScript errors.
2. All catalog references validate.
3. Animal, foliage, path, education, fence, habitat, and expansion variety remain present.
4. Aquatic species and freshwater/saltwater terrain remain available.
5. 2.5D screen/world conversion is accurate in all four camera directions.
6. Visible rotate controls work beside zoom controls.
7. Camera rotation persists in saves.
8. Construction targets the correct tile after camera rotation.
9. The left menu is an icon-only rail.
10. Only one feature panel opens and it closes with X.
11. Inspect and Bulldoze remain independent one-click tools.
12. The map hover-information window is absent.
13. Paths can be placed, upgraded, and removed.
14. Gates replace fences correctly.
15. Foliage obeys terrain restrictions.
16. Staff hiring, dismissal, counters, and salaries work.
17. Calendar and accounting roll over monthly.
18. Finance forecasts, graph data, and history render.
19. Guides lead paid groups.
20. Bins and janitors keep public litter manageable.
21. Land expansions can be purchased.
22. Catalog items use SVG/Canvas art without emoji fallbacks.
23. Animal happiness is visible as a zoo condition.
24. Animals create waste, lose hygiene/grooming, and can become ill.
25. Keepers prioritise treatment, habitat cleaning, washing, and grooming.
26. A medium habitat remains sustainable over 60 simulated days with appropriate keeper staffing.
27. Inspection updates live when animal care changes.
28. Zoo news is limited to a few events per day while urgent events are preserved.
29. The compact Zoo pulse renders recent events.
30. Annual financial results create a news event.
31. Healthy compatible animals can have babies and generate a birth event.
32. Older saves migrate to care, event, camera, and panel state.
33. New Zoo clears current and legacy saves.

## Additional verification

- All 31 JavaScript files pass `node --check`.
- Every linked script and stylesheet exists.
- Movement was hardened against overshoot after long frames or accelerated simulation ticks.
- A populated zoo was visually checked from all four camera directions.
- Separate visual checks cover the News panel, live sick-animal Inspector, and a 390 px mobile layout without horizontal page overflow.
- The project runs without a bundler or third-party runtime library.

## Test artifacts

- `tests/regression-screenshot.png`
- `tests/world-2_5d-screenshot.png`
- `tests/camera-directions.png`
- `tests/living-zoo-events.png`
- `tests/living-zoo-inspector.png`
- `tests/mobile-interface.png`

## Running tests

```bash
python -m pip install playwright pillow
python -m playwright install chromium
python tests/regression.py
python tests/visual_scenario.py
```
