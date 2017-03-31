'use strict';
/** Imports */
import State from './state';

// The main state of the game
export default class MainState extends State {
  sky: Phaser.Sprite; // Reference to background sprite

  platforms: Phaser.Group; // Reference to the group of platform's sprites

  create(): void {
    // Phaser supports some physical engines (p2, box2d, ninja and arcate).
    // For our game, we don't need a strong physical simulation, so we'll choose
    // `arcade` model.
    this.game.physics.startSystem(Phaser.Physics.ARCADE);


    // Add a simple background
    this.sky = this.game.add.sprite(0, 0, 'sky');


    // Also we create a group for platforms
    this.platforms = this.game.add.group();

    // and enable physics for any object that is created in this group
    this.platforms.enableBody = true;


    // Create the ground
    const ground = this.platforms.create(
      0,
      this.game.world.height - 64,
      'platform'
    );

    // and scale it to fit the width of the game (the original sprite
    // size - 400x32, width of the game - 800)
    ground.scale.setTo(2, 2);

    // And make it immovable (Otherwise it will fall when we jump on it).
    ground.body.immovable = true;

    // Also add two ledges
    const ledge1 = this.platforms.create(400, 400, 'platform');
    ledge1.body.immovable = true;

    const ledge2 = this.platforms.create(-150, 250, 'platform');
    ledge2.body.immovable = true;
  }
}
