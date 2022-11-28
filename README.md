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

1. Changing things while stuff is being computed can lead to undefined behavior
2. Flickering when adding a new effect on prod
3. Change all of our hue stuff to use canvas when possible
4. Add movement/scaling/rotation to text
5. Effect previews? Could reduce image to a really small thumbnail and reduce the number of frames to a max of like 5 before running each effect.
