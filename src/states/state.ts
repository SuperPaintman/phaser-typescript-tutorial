'use strict';
/** Imports */
import App from '..';

abstract class State extends Phaser.State {
  game: App; // It needs if we add property to `App` class
}

export default State;
