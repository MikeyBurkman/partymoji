# Partymoji

## App for Creating Animated Gifs

![Hello-Rainbow](./hellmo-rainbow.gif 'Hellmo Rainbow')

### Use it

https://mikeyburkman.github.io/partymoji/

### Develop it locally

1. `pnpm i` to install dependencies
2. `pnpm run start` to run a local debug version at `http://localhost:3000/partymoji`
3. `pnpm run test-prod` to run a prod build at `http://localhost:3000`

### TODO

- Custom bezier library -> more points?
  - Would be nice to have start and end points instead of always [0,0],[1,1]. For instance, support curves that start or end at [0,0.5]
- Bezier param does not detect mobile taps, only mouse clicks
- Greatly optimize palette reduction effect.
  - Probably also makes sense to just set the number of colors max, which needs to be a power of 2.
- Show tool tip in more places, that open help dialogs, instead of one big help section
- Alter how sliders how to allow for larger ranges
  - Maybe make them exponential -- lower values on the slider are easier to select, but as you move the slider right, it starts skipping values. (Lower values typically require more precision.)
  - Could also try increasing/decreasing the slider value based on how fast the cursor is moving?
- Rewrite (over time) the UI using styled-components, not Material UI, so we have more control over things
- Write a gif encoder in Rust/web assembly, so creating gifs is a lot faster
  - Ideally the gif encoder is a separate open source project that this app merely uses.
  - Extra credit - GIFs can be greatly optimized by having subsequent animation frames only overwrite part of the image. Would be really cool to figure out how to do that ourselves.

### Effect ideas

- Add movement/scaling/rotation/drop-shadow to text
- Spiraling out effect -- maybe applying opacity more as it progresses to the outer edge?
- Sierpinski triangle effect
- Give each pixel a randomized trajectory to give like a scatter effect? Maybe some sort of circular function that will ensure it returns to the starting point. Bezier curve to control the speed.
