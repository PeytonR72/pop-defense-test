import './style.css';
import { Game } from './engine/Game';
import { Input } from './engine/Input';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (game) {
    game.resize(canvas.width, canvas.height);
  }
}

const input = new Input(canvas);
const game = new Game(canvas, ctx!, input);

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let lastTime = 0;

function gameLoop(time: number) {
  const dt = time - lastTime;
  lastTime = time;

  game.update(dt);
  game.draw();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);