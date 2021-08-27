# Partymoji

## App for Creating Animated Gifs

### Use it

https://mikeyburkman.github.io/partymoji/

### Develop it locally

1. `yarn` to install dependencies
2. `yarn start` to run a local debug version
3. `yarn build` to create a new prod build ,and store in the `docs` folder, so it can be run through GH Pages.

##### TODO

- Add FPS to global state so it can imported/exported
- MUI all the things
- Componentize common things in parameters
- Make button widths smaller
- Variable length params -- what to do if the default value is not valid?
  - Means that our array has holes in it...
- Make resize-background crop the image if smaller than original
