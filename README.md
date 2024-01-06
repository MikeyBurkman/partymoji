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

1. Custom bezier library -> more points? Would be nice to have start and end points instead of always [0,0],[1,1]
2. Add movement/scaling/rotation/drop-shaodw to text
3. Use absolute import paths, IE `import foo from '~/domain/utils';`
4. Show a warning when an effect expects multiple frames, but there is only one
5. Optimize palette reduction effect. Probably makes sense to just set the number of colors max, which needs to be a power of 2 anyhow.
6. Make importing from a url string work with the new gif reader
7. Refactor imageImport to automatically handle gif vs other image types

### Effect ideas

- Spiraling out effect -- maybe applying opacity more as it progresses to the outer edge?
- Sierpinski triangle effect
- Give each pixel a randomized trajectory? (Maybe some sort of circular function that will ensure it returns to the starting point)
