# Effect tests and benchmarks

Characterization coverage for the 14 effects identified in the performance review:
Reduce Color Palette, Hue Shift Pulse, Ripple, Hue Wave, Grid, Roxbury, Trails,
Party Shadow, Pinwheel Colors, Radiance Colors, and the foreground/background
Pinwheel Rainbow and Radiance Rainbow variants. Tests were established before
optimization; their original pixel snapshots remain the expected results.

## Run

Uses the existing Vitest Browser Mode / Playwright Chromium setup. See
[the utility suite setup](../domain-utils/README.md#setup-and-commands) for browser
installation and this host's temporary Linux library workaround.

```sh
pnpm test tests/effects
pnpm test                 # effects and existing utility tests
pnpm tsc
pnpm exec eslint tests/effects src/effects vitest.config.ts

pnpm bench tests/effects --outputJson /tmp/partymoji-effects-before.json
# Compare with the saved original baseline:
pnpm bench tests/effects --compare tests/effects/baseline.json --outputJson /tmp/partymoji-effects-after.json
```

On this host, prefix browser commands with:

```sh
LD_LIBRARY_PATH=/tmp/partymoji-browser-deps/root/usr/lib/x86_64-linux-gnu pnpm test tests/effects
LD_LIBRARY_PATH=/tmp/partymoji-browser-deps/root/usr/lib/x86_64-linux-gnu pnpm bench tests/effects --outputJson /tmp/partymoji-effects-before.json
```

## What the tests protect

- Hand-checked palette selection across frames, stable ranking and nearest-color
  ties, one-color input, and zero/full reduction.
- Ripple's row displacement, rounding, out-of-bounds transparency and identity at
  zero amplitude; axis-aligned Grid lines and desaturation; Roxbury freeze phases;
  Hue Wave's row-wise shifts; Hue Shift Pulse's mirrored progress and alpha.
- Real canvas shadow offset, foreground opacity and early Trails history.
- Exact RGBA snapshots for 23 configurations: a 7×5 image with eight animation
  phases, plus a single 3×2 frame at progress zero. The fixture includes varied
  RGB and alpha 0, 63, 64, 127, 128, and 255. Variants exercise zero amplitude,
  axis alignment, one/many layers, blur, and foreground opacity 0/60/100.
- Input immutability, independent output frame buffers, retained results after
  another invocation, changing dimensions/frame counts between invocations,
  repeatability, and empty animations.

Snapshots contain full hexadecimal RGBA bytes, not hashes. They were captured
from the current implementation, so they supplement the literal/behavioral
assertions; they are not an independent proof that the effects are correct.
Review changes to snapshot pixels instead of regenerating snapshots as part of
an optimization. Only intentionally recapture with:

```sh
pnpm test tests/effects/effects.test.ts --update
```

These tests deliberately preserve existing behavior, including quirks:

- Palette reduction ignores source alpha when collecting RGB colors and makes
  output opaque even at 0% reduction. Ranking omits the first color's vote.
- Hue Shift Pulse currently passes the easing result multiplied by **360** to
  `shiftTowardsHue`; this suite does not change that amount to 100.
- Trails clamps early history to the first frame rather than wrapping. Chromium
  quantizes 50% filter opacity to alpha 127 before subsequent compositing.
- Roxbury's zero-angle phase still shifts the sampled row by eight pixels.
- Radiance Colors can throw `TypeError` when an offset creates a negative palette
  index. A separate test records this failure; successful benchmarks use zero
  offsets for this effect. A behavior correction should be a separate change.

Snapshots involving canvas filters and partial-alpha rounding are tied to the
recorded Chromium environment. Other browser engines/renderers may differ.
There is no effect-specific worker or UI coverage, exhaustive parameter search,
or assertion of sensible behavior for malformed/out-of-range parameters.

## Benchmark workloads

Each timed operation calls the public effect function for the entire animation,
including output allocation, canvas uploads, compositing and readback. Fixtures
and seeded PRNGs are allocated outside timed callbacks; these effects do not use
the PRNG. Results remain observable. No rendering functions or color helpers are
mocked. There are no pass/fail timing thresholds.

48 cases cover:

- All 14 effects at 32×32 and 128×128 with 12 frames, 32 unique RGB colors and
  mixed alpha.
- Palette reduction at 32×32, 1/12 frames, 32/256 unique RGB colors and 0/70/100%
  reduction. This exposes whole-animation setup repeated per frame and palette
  size costs without making the baseline prohibitively expensive.
- Trails and Party Shadow at 128×128 / 12 frames and 1/10 layers. Trails
  uses blur 0/100 (a dimension-scaled percentage); Party Shadow uses blur 0/10
  pixels. At 128×128 even one trail has a nonzero blur radius at blur 100.

Each case warms up for at least 200 ms / 3 iterations, then measures at least
500 ms / 10 iterations. Slow palette cases can exceed those time budgets to meet
the minimum sample count. Compare the same case between revisions; Vitest's
rankings of different effects are not before/after comparisons. Rerun noisy cases
and inspect relative margin of error (`rme`). Do not run other tests or CPU-heavy
work during benchmark collection. These timings do not measure overall export
latency, encoding, allocation counts, peak memory, or large photographic palettes.

## Checked-in baseline

`baseline.json` records the unchanged effects at source revision
`3a33da112fb8ca06135b95425a5c968997d5a1e9`, using the working tree's previously
optimized domain utilities. Thus this is an effects baseline, not a repeat of the
original utility baseline. Keep it intact and capture a fresh local baseline
before changing an effect.

Environment: 2026-11-02, Linux x64, Node 22.23.4, pnpm 11.5.1, Vitest 3.2.7,
Playwright 1.64.1, headless Chromium 156.0.8078.4, with the Linux libraries from
`/tmp/partymoji-browser-deps/root`. Browser timings can be noisy; the report retains
summary statistics and margins of error rather than presenting them as guaranteed
performance. Seven of the 48 cases in this capture have RME above 20%, including
Radiance Colors and several canvas layer cases; repeat those cases before making
speedup claims. Vitest omits individual samples from the JSON report.

## Implemented optimizations

Thirteen effects preserve their existing interfaces and pixel output:

- Reduce Color Palette builds the whole-animation palette once per invocation,
  scans RGBA buffers without discarded output images, uses packed RGB keys in
  encounter order, and selects the nearest palette color once per unique RGB.
  Alpha handling, stable ties, the first-color voting omission, and color-distance
  calculations are unchanged. Ranking remains quadratic in unique color count;
  large photographic palettes can still be expensive.
- Hue Shift Pulse evaluates easing once per frame. Ripple and Hue Wave compute
  sine-based amounts once per row per frame. Roxbury hoists its remaining
  frame-invariant trigonometry.
- Grid computes its mask once per invocation. Pinwheel foreground/background and
  radiance color/rainbow backgrounds cache their geometry across frames using
  Float64 values to preserve calculation precision. Each scalar map uses eight
  bytes per pixel and is released with that invocation.
- The four generated backgrounds reuse invocation-local source, filtered and
  destination canvases. Intermediate alpha readback/upload is retained.
- Trails reuses its output canvas and uploads each source frame once; retained
  source canvases are bounded by the requested history window.
- Party Shadow reuses two canvases and retains intermediate layer readback/upload.
  Each layer resets the filter before assigning it: negative hues can produce an
  invalid CSS shadow color, and a rejected assignment must leave the original
  fresh-canvas default instead of reusing the previous layer's shadow.

No global image/canvas caches, parameter changes, or dependency changes were
introduced. Foreground Radiance Rainbow remains unchanged: the geometry-cache
experiment showed no convincing gain (its first run was about 4–7% slower)
and was removed. Its benchmark remains an unchanged control.

The existing 168 tests pass without updating snapshots. An additional temporary
comparison ran all 23 configurations against frozen original implementations on
32×24 / 12 frames, 8×9 / 8 frames / 256 colors, and 1×1 / one frame; all pixels
matched. The temporary copies/comparison were local validation, not added as a
second maintained implementation in the test suite.

## Recorded results after optimization

`optimized.json` preserves the final full 48-case capture using the same benchmark
names, parameters, browser and hardware as `baseline.json`. The baseline and
snapshots were not overwritten. These are individual effect invocation timings,
not end-to-end application/export speedups.

Representative 128×128 / 12-frame results (mean milliseconds):

| Effect                               |  Before |  After | Before / after |
| ------------------------------------ | ------: | -----: | -------------: |
| Reduce Color Palette                 | 871.680 |  6.419 |        135.79× |
| Hue Shift Pulse                      |  56.990 | 44.933 |          1.27× |
| Ripple                               |  21.865 | 12.555 |          1.74× |
| Hue Wave                             |  55.490 | 48.518 |          1.14× |
| Grid †                               |  53.910 | 34.867 |          1.55× |
| Roxbury †                            |  26.040 | 25.865 |          1.01× |
| Trails                               |  20.068 | 14.829 |          1.35× |
| Party Shadow                         |  27.453 | 14.654 |          1.87× |
| Pinwheel Colors                      |  36.364 | 16.571 |          2.19× |
| Radiance Colors †                    |  32.988 | 14.067 |          2.35× |
| Pinwheel Rainbow                     |  68.580 | 56.900 |          1.21× |
| Radiance Rainbow (unchanged control) |  49.564 | 56.630 |          0.88× |
| Pinwheel Rainbow Background          |  50.045 | 32.925 |          1.52× |
| Radiance Rainbow Background          |  39.800 | 31.053 |          1.28× |

† At least one capture has RME above 20%; the ratio is not a precise speedup
estimate. The unchanged Radiance Rainbow control also varied between captures,
so small differences should not be attributed to code alone. The final full run
had one-trail blurred Trails at 11.189 ms versus 10.349 ms before; the earlier
after run measured 7.599 ms for that same case. Canvas results vary with renderer
state and garbage collection. No claim of uniform improvement across every
parameter configuration is made.

`repeat.json` retains a targeted seven-case repeat of Grid, Roxbury, the unchanged
Radiance Rainbow control, and one-trail blurred Trails. At 128×128 it measured
Grid at 18.136 ms, Roxbury at 13.133 ms, the control at 56.520 ms, and blurred
Trails at 9.462 ms (RME 11.43%). These repeats expose sensitivity to suite
composition/JIT warmup as well as canvas variability; they do not replace the
full-run table with selectively faster numbers. Use a fresh baseline and after
capture with identical case filters for a controlled comparison.
