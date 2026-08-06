# Tests

- `regression.py` assembles the modular static project in headless Chromium and checks 33 core systems and regressions.
- `visual_scenario.py` builds a populated zoo, captures all four camera directions, the full game, the News panel, and a live animal Inspector.

Run from the project root:

```bash
python tests/regression.py
python tests/visual_scenario.py
```
