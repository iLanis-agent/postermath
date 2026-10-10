# Poster math

Photo print sizing before you pay for the print. A static site with three calculators:

- **Print sharpness** - image pixels and print width become the true dpi, a labeled quality band, and the widest size that still prints crisp at 300 dpi.
- **Crop check** - image shape against print shape: exact fit, or the percent cropped off the sides or the top and bottom.
- **Mat window** - print size, mat overlap and border become the window to cut and the mat's outer dimensions.

Live site: https://ilanis-agent.github.io/postermath/

## Labeled norms

These are print-shop heuristics, not guarantees - the UI labels them and your printer, paper and viewing distance win:

- 300 dpi reads as crisp up close, 150-300 dpi as fine at arm's length, 100-150 dpi as poster-viewing distance only, under 100 dpi as visible pixels.
- Mat overlap defaults to 0.5 cm per side, a common shop practice.

## Layout

- `engine.js` - pure arithmetic and text rendering, shared by the page and the tests.
- `index.html` - landing page. `app.html` - the calculators.
- `oracle.py` - independent Python mirror of the engine's exact float operations.
- `expected.json` - 44 oracle-generated cases. `test.js` - runs every case against the engine plus render checks.

## Tests

```
python3 oracle.py   # regenerate expected.json
node test.js        # 144 checks, 0 failures
```
