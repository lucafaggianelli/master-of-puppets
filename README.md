# Sibilla [![](https://travis-ci.org/lucafaggianelli/sibilla.svg?branch=master)](https://travis-ci.org/lucafaggianelli/sibilla)

Organize your shared drives

Sibilla is an app that helps you manage folders and shared drives organizing and categorizing files and folders.
It is based on [Electron](http://electron.atom.io/) and [AngularJS](https://angularjs.org/).

## Install

```
# Install dependencies and build JS
npm install

# Run electron
npm start
```


## Build

App building is done with [electron-packager](https://github.com/electron-userland/electron-packager), there is a grunt task for it
```
grunt pack
```


## Test

Tests are based on [Mocha](https://mochajs.org/)
```
npm test
```
