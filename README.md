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

1. Automatically detect if rendered gif has transparent pixels, and show default transparent grid background and tooltip
2. Custom bezier library -> more points? Would be nice to have start and end points instead of always [0,0],[1,1]
3. Add movement/scaling/rotation/drop-shaodw to text
4. Use absolute import paths, IE `import foo from '~/domain/utils';`
