# Domain utility tests and benchmarks

These tests were established before performance changes and characterize the
utilities' behavior. `baseline.json` retains results from the original
implementations. Tests and benchmarks
run in headless Chromium through Vitest Browser Mode and Playwright, using real
canvas rendering, image decoding, FileReader, and fetch. The worker test also
exercises the OffscreenCanvas branch in a real Web Worker.

## Setup and commands

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
# On Linux, if required browser libraries are missing (requires sudo):
pnpm exec playwright install-deps chromium

pnpm test
pnpm test:watch
pnpm bench
pnpm tsc
pnpm lint
```

The test framework and browser driver versions are pinned because Vitest's
benchmarking interface is experimental. Browser binaries are installed separately
and are not part of the repository.

### Missing Linux libraries on this host

If Chromium fails to launch with a missing-library error such as `libnspr4.so`,
run `pnpm exec playwright install-deps chromium` in an interactive terminal and
enter your sudo password. Then the plain test and benchmark commands above work.

For this host, the missing libraries have also been downloaded and extracted
under `/tmp/partymoji-browser-deps/root`. Until the system dependencies are
installed, enable that temporary workaround in each terminal before running tests
or capturing either benchmark report:

```sh
export LD_LIBRARY_PATH="/tmp/partymoji-browser-deps/root/usr/lib/x86_64-linux-gnu${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
pnpm bench --outputJson /tmp/partymoji-utils-before.json
```

The `/tmp` files may disappear after a reboot. A JSON file with empty `groups`
from a failed browser launch is not a usable baseline; rerun the capture after
resolving the launch error.

## Behavior covered

- Pixel indexing, out-of-bounds reads, input mutation, independent buffers, and
  frame-count resampling/reference sharing.
- Mapping order, retained callback arguments, frame metadata, precompute order,
  seeded random consumption, channel clamping, NaN/infinities, and half-to-even
  rounding into `Uint8ClampedArray`.
- Transparency thresholds at alpha 63/64 and 127/128, early exits, empty images,
  and matches in the last pixel of a later frame.
- Color parsing, conversion, interpolation, hue, brightness, saturation, contrast,
  and color distance; numeric and immutable array utilities.
- Linear, nonlinear, mirrored, and invalid Bézier curves. Changing the control
  point array must affect subsequently created evaluators without changing an
  evaluator already returned to the caller.
- Real canvas readback, transforms, alpha compositing, filter isolation,
  pre/post callback ordering, centered resize/crop/scale, and frame independence.
- Real GIF patch offsets, changing patch sizes, transparency, frame delays, and
  static PNG import from files/data URLs. GIF disposal-2 tests deliberately pin
  the current **clear before drawing the patch** behavior; they do not assert GIF
  specification compliance. Any disposal correction should be a separate change.
- Local binary URL conversion, missing content types, data URI round trips,
  debounced local/external values, and canvas mount/mouse callback behavior.

This is targeted regression coverage, not an assertion that every utility export
or malformed input is covered. OS clipboard permissions, mobile user-agent
detection, logger environment settings, other browser engines, and worker
performance are outside this suite.

## Comparing performance

`baseline.json` records 35 cases against the original utility implementations.
To compare a later implementation without overwriting this baseline:

```sh
pnpm bench --compare tests/domain-utils/baseline.json --outputJson /tmp/partymoji-utils-after.json
```

For a reliable comparison, first capture a fresh baseline on your own machine
before editing utility code:

```sh
pnpm bench --outputJson /tmp/partymoji-utils-before.json
# Make and test the optimization, then:
pnpm bench --compare /tmp/partymoji-utils-before.json --outputJson /tmp/partymoji-utils-after.json
```

Compare the same named case between revisions. Vitest also ranks unrelated
operations within each group; those rankings are not interchangeable-workload
comparisons. Preserve the benchmark names and order so Vitest can match IDs.

The image workloads use deterministic 32×32, 128×128, and 256×256 images with 12
frames. Cases include full scans and first/last-pixel transparency matches,
identity mapping, precomputed mapping, fractional channel mapping, resize, and
canvas filtering. Other cases measure repeated Bézier construction versus reuse,
a 64×64 GIF with 12 equal-size or varying-size patches, and conversion of a 256 KiB local binary
response. Input fixture creation is outside timed callbacks. Output allocation,
GIF decoding, FileReader work, canvas creation/readback, and local fetch remain
inside the timed operation where the public utility performs them. No external
network is used by the benchmarks.

Each case warms up for at least 200 ms / 5 iterations, then samples for at least
500 ms / 30 iterations. Timings are informational, with no pass/fail performance
threshold. Look at relative margin of error (`rme`) and repeat noisy cases;
sub-microsecond early exits approach browser timer resolution, and canvas timings
depend on the browser's renderer, available acceleration, and garbage collection.
The suite does not measure allocation counts or peak memory.

Recorded baseline environment (2026-11-02):

- Utility source revision: `3a33da112fb8ca06135b95425a5c968997d5a1e9`.
- Linux x64; Intel Core i7-1165G7 @ 2.80 GHz.
- Node 22.23.4, pnpm 11.5.1, Vite 6.3.2, Vitest 3.2.7, Playwright 1.64.1.
- Headless Chromium 156.0.8078.4 (Playwright revision 1248), default launch flags.
- This host lacked NSPR, NSS, and ALSA libraries and required a sudo password for
  system installation. Verification used Ubuntu packages extracted under
  `/tmp/partymoji-browser-deps/root`, with
  `LD_LIBRARY_PATH=/tmp/partymoji-browser-deps/root/usr/lib/x86_64-linux-gnu` set
  for the browser test commands. This temporary workaround is not needed on a
  host with Playwright's standard dependencies installed.

## Optimization results

The six optimizations preserve the exported interfaces: alpha-only scans,
typed-array channel clamping, per-frame source-reader closures, a bounded
value-based Bézier evaluator cache, local resize canvases, and a reusable GIF
patch canvas with direct `ImageData` wrapping. No global canvas pool is used.

Comparison against the fresh local baseline on the same host (2026-11-02):

| Workload                                                | Before (ms) | After (ms) | Before / after |
| ------------------------------------------------------- | ----------: | ---------: | -------------: |
| Opaque transparency scan, 256×256 / 12 frames           |      11.630 |      0.781 |         14.90× |
| Opaque partial-transparency scan, 256×256 / 12 frames   |      11.527 |      0.812 |         14.19× |
| Coordinate mapping, 256×256 / one frame                 |       4.504 |      0.543 |          8.29× |
| Precomputed mapping, 256×256 / 12 frames                |      69.123 |     38.783 |          1.78× |
| Identity mapping, 256×256 / 12 frames                   |      59.690 |     61.837 |          0.97× |
| Half-size resize, 256×256 / 12 frames                   |       6.445 |      2.288 |          2.82× |
| Repeated Bézier construction + evaluation, 16,384 calls |       2.933 |      1.737 |          1.69× |
| GIF import, 64×64 / 12 varying-size patches             |       4.403 |      3.216 |          1.37× |
| GIF import, 64×64 / 12 equal-size patches               |       4.412 |      3.570 |          1.24× |

These are individual utility timings, not overall application speedups. Gains
depend on the workload: identity mapping at the largest size did not improve in
the full suite, and tiny first-pixel exits approach timer resolution. The
targeted identity repeat was faster, so its result also depends on suite
composition and JIT warmup; the table uses the full-suite measurements.
Unchanged canvas-filter
and URL-conversion controls also varied between runs; the full after run's URL
case included a 4.9-second outlier and is not evidence of a code regression.
Repeat noisy cases before drawing conclusions.

The raw reports from this comparison are `/tmp/partymoji-utils-before.json` and
`/tmp/partymoji-utils-after.json`; `/tmp/partymoji-utils-controls.json` contains a
targeted repeat of identity mapping and the unchanged control cases. Copy these
files elsewhere if you want to keep them across reboots. The original checked-in
`baseline.json` has not been overwritten.
