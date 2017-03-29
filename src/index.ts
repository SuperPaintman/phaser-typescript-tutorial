'use strict';
/** Imports */
// Import global dependencies. (I remind you, webpack create separate chunk file for them).
require('pixi');    // Because Phaser use PIXI and p2 as global variables, they must be imported first.
require('p2');
require('phaser');  // So, in my case, TypeScript breaks if i import it as `import 'phaser';`. ¯\_(ツ)_/¯

import 'styles/style.styl'; // Registering styles for the page; They will automatically inject.

import BootState        from './states/boot.state';
import PreloaderState   from './states/preloader.state';
import MainState        from './states/main.state';


// The main class of our application
export default class App extends Phaser.Game {
  constructor(config: Phaser.IGameConfig) {
    super(config);

    this.state.add('boot', BootState);
    this.state.add('preloader', PreloaderState);
    this.state.add('main', MainState); // Add `main` state into game

    this.state.start('boot'); // Initialize and start `boot` state
  }
}


// Like python's `__name__ == "__main__"` checks whether the module is part
// of another program or it is executable.
if (!module.parent) {
  window.onload = () => {
    const config: Phaser.IGameConfig = {
      width:           800, // width of canvas
      height:          600, // height of canvas
      renderer:        Phaser.AUTO, // rendering context. The recommended parameter is Phaser.AUTO
      parent:          '',
      resolution:      1,
      forceSetTimeOut: false // tell Phaser to use `setTimeOut` even if `requestAnimationFrame` is available.
    };

    new App(config); // Initialize the application. It will automatically inject <canvas /> into <body />
  };
}
