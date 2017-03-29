'use strict';
/** Imports */
import State from './state';

// The main state of the game
export default class MainState extends State {
  create(): void {
    this.game.add.sprite(0, 0, 'star');
  }
}
