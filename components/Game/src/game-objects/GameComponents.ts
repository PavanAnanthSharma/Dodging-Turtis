import { CAM_CENTER } from '../cfg/constants/design-constants';
import { TWEEN_EASING } from '../cfg/constants/static-constants';
import type { AbstractScene } from '../scenes/AbstractScene';
import { Water } from './Water';
import { ObstacleManager } from './Obstacles/ObstacleManager';
import { Overlay } from './Overlay';
import { Pawn } from './Pawn';
import { PawnParticleTrail } from './PawnParticleTrail';
import { BankManager } from './Banks/BankManager';
import { DEPTH } from '../cfg/constants/game-constants';

const SPEED_INCREASE_THRESHOLD = 5000;
const SPEED_INCREASE = 0.05;
const INIT_SPEED = 0.15;

export class GameComponents {
  scene: AbstractScene;


  grd: CanvasRenderingContext2D | null;
  scrollSpeedTween: Phaser.Tweens.Tween | null = null;
  water: Water;
  bankManager: BankManager;
  obstacleManager: ObstacleManager;
  pawn: Pawn;
  overlay: Overlay;


  scrollSpeed = INIT_SPEED;
  speedIncreaseThreshold = 5000;  // ms;
  scrollSpeedBeforeDeath = INIT_SPEED;


  constructor(scene: AbstractScene) {
    this.scene = scene;

    if (this.scene.sys.renderer.type === Phaser.WEBGL) {
      this.grd = this.scene.textures.createCanvas('grd').getContext();
    } else {
      this.grd = this.scene.sys.canvas.getContext('2d');
    }

    this.water = new Water(this.scene);
    this.bankManager = new BankManager(this.scene);
    this.obstacleManager = new ObstacleManager(this.scene);
    this.pawn = new Pawn(this.scene);
    this.overlay = new Overlay(this.scene).setDepth(DEPTH.overlay);
  }

  startGame() {
    this.obstacleManager.generateGroupsInitially();
  }

  handlePawnCollision() {
    this.overlay.showOverlay();
    this.stopScrollTween();
    this.scrollSpeedBeforeDeath = this.scrollSpeed * 0.75;
    this.speedIncreaseThreshold = SPEED_INCREASE_THRESHOLD;
    this.scrollSpeed = INIT_SPEED;
    this.pawn.playPawnCollidedTween();
    this.deathCameraEffects();
  }

  deathCameraEffects() {
    const currZoom = this.scene.cameras.main.zoom;
    this.scene.cameras.main.zoomTo(currZoom + 0.1, 500, TWEEN_EASING.SINE_EASE_IN);
    this.scene.cameras.main.pan(CAM_CENTER.x - (CAM_CENTER.x - this.pawn.turtle.x) * 0.2, CAM_CENTER.y, 500, TWEEN_EASING.SINE_EASE_IN);
    this.scene.cameras.main.shake(500, 0.005);
    window.navigator.vibrate(500);
  }

  resetCamera() {
    this.overlay.hideOverlay();
    const currZoom = this.scene.cameras.main.zoom;
    this.scene.cameras.main.zoomTo(currZoom - 0.1, 500, TWEEN_EASING.SINE_EASE_OUT);
    this.scene.cameras.main.pan(CAM_CENTER.x, CAM_CENTER.y, 500, TWEEN_EASING.SINE_EASE_OUT);
    this.scene.cameras.main.once('camerapancomplete', (camera: Phaser.Cameras.Scene2D.Camera) => {
      this.pawn.playPawnReviveTween();
    });
  }

  stopScrollTween() {
    if (this.scrollSpeedTween && this.scrollSpeedTween.isPlaying()) {
      this.scrollSpeedTween.stop();
      this.scrollSpeedTween = null;
    }
  }

  tweenScrollSpeedBackToUsual() {
    this.scene.tweens.add({
      targets: this,
      scrollSpeed: this.scrollSpeedBeforeDeath,
      duration: 4000,
      ease: TWEEN_EASING.SINE_EASE_OUT,
    })
  }

  increaseScrollSpeed() {
    this.scrollSpeedTween = this.scene.tweens.add({
      targets: this,
      scrollSpeed: `+=${SPEED_INCREASE}`,
      duration: 4000,
      ease: TWEEN_EASING.SINE_EASE_OUT,
    })
  }

  resizeAndRepositionElements() {
    this.water.resizeAndRepositionElements();
    this.pawn.resizeAndRepositionElements();
    this.overlay.resizeAndRepositionElements();
  }

  update(delta: number) {
    const scrollSpeed = delta * this.scrollSpeed
    this.pawn.update(delta, scrollSpeed);
    this.water.scroll(scrollSpeed);
    this.bankManager.scroll(scrollSpeed);
    this.obstacleManager.update(scrollSpeed);
    this.speedIncreaseThreshold -= delta;
    if (this.speedIncreaseThreshold <= 0) {
      this.speedIncreaseThreshold = SPEED_INCREASE_THRESHOLD;
      this.increaseScrollSpeed();
    }
  }
}
