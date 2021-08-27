# Partymoji

## App for Creating Animated Gifs

### Use it

https://mikeyburkman.github.io/partymoji/

### Example

- Copy the contents of this file to the clipboard, and then click the `Import from Clipboard` button at the bottom of the page.
- https://raw.githubusercontent.com/MikeyBurkman/partymoji/main/example-export

### Develop it locally

1. `yarn` to install dependencies
2. `yarn start` to run a local debug version
3. `yarn build` to create a new prod build ,and store in the `docs` folder, so it can be run through GH Pages.

##### TODO

- Add FPS to global state so it can imported/exported
- Componentize common things in parameters
- Variable length params -- what to do if the default value is not valid?
  - Means that our array has holes in it...
