# Bug backlog

Known bugs deferred during performance work. Last reviewed November 2, 2026.
Keep entries here until fixed, then record the fix and its regression coverage.

## BUG-001 Inserting an identical first effect can stop processing

**Status:** Open; reproduced in the production browser check.

- **Reproduce:** Upload an image, compute the default Party effect, then click
  **Insert First Effect** again with the same default parameters.
- **Actual:** Processing fails with an assertion that the previous effect is not
  done computing. The new first effect has status `init`.
- **Cause:** `getStateDiff` compares effect names and parameters without identifying
  the inserted row. It treats the identical first row as unchanged and starts at
  index 1, whose predecessor is the newly inserted, uncomputed row.
- **Expected:** Compute the inserted effect and every dependent effect, preserving
  the order selected by the user.
- **Code:** [State comparison and computation](src/domain/computeGifs.ts),
  [effect insertion](src/components/ImageEffectList.tsx).
- **Fix verification:** Cover inserting identical effects at the beginning and
  between existing effects, and verify a valid final GIF is produced.

## BUG-002 Radiance Colors offsets can cause a TypeError

**Status:** Open; existing characterization test records the failure.

- **Reproduce:** Use the exact image, palette, and nonzero offsets in
  [the offset test](tests/effects/canvas.test.ts). In the UI, changing Offset X or
  Offset Y can move pixels far enough from the radiance center to trigger it.
- **Actual:** A negative palette index returns `undefined`, causing a `TypeError`
  during pixel mapping.
- **Cause:** JavaScript remainder preserves negative signs. Both palette-index
  calculations use `% colorList.length` without normalizing negative values.
- **Expected:** Valid offsets wrap through the palette and render all frames.
- **Code:** [Radiance Colors](src/effects/radiance-colors.ts).
- **Fix verification:** Replace the test that expects a throw with successful
  rendering assertions. Cover positive and negative offsets, multiple animation
  phases, and unchanged output for the existing zero-offset fixture.

## BUG-003 Party Shadow negative hues can produce invalid CSS colors

**Status:** Open underlying color bug; canvas filter carryover is already prevented.

- **Trigger:** Party Shadow computes `(startHue - hueSize * i) % 360`; some layers
  therefore pass negative hues to `colorFromHue`, including early animation phases.
- **Actual:** Some negative hues produce invalid CSS shadow colors, so the browser
  rejects the filter assignment and the intended shadow layer is missing.
- **Existing mitigation:** The effect resets `ctx.filter` to `none` before each
  assignment. This prevents a rejected assignment from retaining the previous
  layer's filter when reusing canvases; it does not correct the invalid color.
- **Expected:** Every shadow layer receives a valid color with hue wrapped into
  the supported range.
- **Code:** [Party Shadow](src/effects/party-shadow.ts),
  [hue conversion](src/domain/utils/color.ts).
- **Fix verification:** Cover negative hues and equivalent wrapped positive hues,
  then update affected Party Shadow pixel expectations intentionally. Preserve
  intermediate alpha rounding between layers.

## Other behavior to triage

[The effects test notes](tests/effects/README.md#what-the-tests-protect)
also record palette-reduction alpha/voting behavior and Hue Shift Pulse's easing
scale. Confirm intended behavior before treating these as separate fixes.
