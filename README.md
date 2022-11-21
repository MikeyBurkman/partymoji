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
3. Insert effects before/after current effect. (Can ditch current Add button)
4. CheckboxParam doesn't seem to work?
5. Change all of our resizing/hue stuff to use canvas when possible
6. Add movement/scaling/rotation to background image and text
7. Add rotate/mirror effect
8. Split frame count from brightness/etc. "Set Animation Length" to change number of frames
9. Detect mobile and either show error, or maybe fall back to non-worker version of code
