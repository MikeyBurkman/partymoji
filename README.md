# Partymoji

## App for Creating Animated Gifs

![Hello-Rainbox](./hellmo-rainbow.gif 'Hellmo Rainbow')

### Use it

https://mikeyburkman.github.io/partymoji/

### Develop it locally

1. `yarn` to install dependencies
2. `yarn start` to run a local debug version at `http://localhost:3000/partymoji`
3. `yarn test-prod` to run a prod build at `http://localhost:3000`

### TODO

- Custom bezier library -> more points? Would be nice to have start and end points instead of always [0,0],[1,1]
- Add movement/scaling/rotation/drop-shadow to text
- Bezier param does not detect mobile taps, only mouse clicks
- Optimize palette reduction effect. Probably makes sense to just set the number of colors max, which needs to be a power of 2 anyhow.
- Make importing from a url string work with the new gif reader
- Refactor imageImport to automatically handle gif vs other image types
- Show tool tip in more places, that open help dialogs, instead of one big help section
- Exponential scale on sliders -- allows for a large max while being precise on lower values

### Effect ideas

- Spiraling out effect -- maybe applying opacity more as it progresses to the outer edge?
- Sierpinski triangle effect
- Give each pixel a randomized trajectory to give like a scatter effect? Maybe some sort of circular function that will ensure it returns to the starting point. Bezier curve to control the speed.
