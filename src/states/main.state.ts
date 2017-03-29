'use strict';
/** Imports */
import State from './state';

// The main state of the game
export default class MainState extends State {
  create(): void {
    const map = [
      ' XXX  XXX XXXXX X  X X   X XXXX ',
      'X      X    X   X  X X   X X   X',
      'X  XX  X    X   XXXX X   X XXXX ',
      'X   X  X    X   X  X X   X X   X',
      ' XXX  XXX   X   X  X  XXX  XXXX '
    ].map((line) => line.split(''));

    map.forEach((line, y) => line.forEach((char, x) => {
      if (char !== 'X') {
        return;
      }

      this.game.add.sprite(x * 24, y * 22, 'star');
    }));
  }
}
