import { TowerDefinitions } from '../entities/TowerTypes';
import { Tower } from '../entities/Tower';
import { Maps } from '../maps/MapDefinitions';

export class UIManager {

  public selectedTowerIndex: number = -1;
  public selectedBuiltTower: Tower | null = null;
  public hoveredMapIndex: number = -1;
  public isHoveringNextWave: boolean = false;

  constructor(public canvasWidth: number, public canvasHeight: number) {}

  public resize(w: number, h: number) {
    this.canvasWidth = w;
    this.canvasHeight = h;
  }

  public drawMenu(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText('Chroma Defenders', this.canvasWidth / 2, this.canvasHeight / 2 - 50);

    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(this.canvasWidth / 2 - 100, this.canvasHeight / 2 + 20, 200, 50);
    ctx.fillStyle = '#fff';
    ctx.fillText('Play Game', this.canvasWidth / 2, this.canvasHeight / 2 + 53);
  }

  public drawMapSelect(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('Select Map', this.canvasWidth / 2, 80);

    const mapWidth = 200;
    const mapHeight = 150;
    const gap = 40;
    const startX = this.canvasWidth / 2 - (Maps.length * mapWidth + (Maps.length - 1) * gap) / 2;
    const y = this.canvasHeight / 2 - mapHeight / 2;

    for (let i = 0; i < Maps.length; i++) {
      const x = startX + i * (mapWidth + gap);

      if (this.hoveredMapIndex === i) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.strokeRect(x - 2, y - 2, mapWidth + 4, mapHeight + 4);
      }

      ctx.fillStyle = Maps[i].themeColor;
      ctx.fillRect(x, y, mapWidth, mapHeight);

      ctx.fillStyle = '#fff';
      ctx.font = '20px sans-serif';
      ctx.fillText(Maps[i].name, x + mapWidth / 2, y + mapHeight + 30);
    }
  }

  public drawHUD(
    ctx: CanvasRenderingContext2D,
    lives: number,
    cash: number,
    round: number,
    mouseX: number,
    mouseY: number,
    isRoundActive: boolean,
    playSpeed: number
  ) {
    // Top bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.canvasWidth, 40);

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Lives: ${lives}`, 20, 28);
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`Cash: $${cash}`, 150, 28);
    ctx.fillStyle = '#fff';
    ctx.fillText(`Round: ${round}/100`, 300, 28);

    // Speed controls
    ctx.fillStyle = playSpeed === 1 ? '#4caf50' : '#888';
    ctx.fillRect(450, 5, 40, 30);
    ctx.fillStyle = '#fff';
    ctx.fillText('1x', 458, 26);

    ctx.fillStyle = playSpeed === 2 ? '#4caf50' : '#888';
    ctx.fillRect(500, 5, 40, 30);
    ctx.fillStyle = '#fff';
    ctx.fillText('2x', 508, 26);

    // Right panel (Tower selection)
    const panelW = 220;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(this.canvasWidth - panelW, 0, panelW, this.canvasHeight);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Towers', this.canvasWidth - panelW / 2, 30);

    const startY = 60;
    for (let i = 0; i < TowerDefinitions.length; i++) {
      const def = TowerDefinitions[i];
      const ty = startY + i * 55;

      // bg
      ctx.fillStyle = this.selectedTowerIndex === i ? '#555' : '#333';
      ctx.fillRect(this.canvasWidth - panelW + 10, ty, panelW - 20, 50);

      // icon
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(this.canvasWidth - panelW + 30, ty + 25, 12, 0, Math.PI * 2);
      ctx.fill();

      // text
      ctx.textAlign = 'left';
      ctx.fillStyle = cash >= def.cost ? '#fff' : '#aaa';
      ctx.font = '16px sans-serif';
      ctx.fillText(def.name, this.canvasWidth - panelW + 50, ty + 20);
      ctx.fillStyle = '#ffd700';
      ctx.font = '14px sans-serif';
      ctx.fillText(`$${def.cost}`, this.canvasWidth - panelW + 50, ty + 40);
    }

    // Selected built tower info (Upgrade / Sell)
    if (this.selectedBuiltTower) {
      const t = this.selectedBuiltTower;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(this.canvasWidth - panelW, this.canvasHeight - 200, panelW, 200);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(t.name, this.canvasWidth - panelW / 2, this.canvasHeight - 170);

      const nextUpg = t.getNextUpgrade();
      if (nextUpg) {
        ctx.fillStyle = cash >= nextUpg.cost ? '#2196f3' : '#555';
        ctx.fillRect(this.canvasWidth - panelW + 20, this.canvasHeight - 140, panelW - 40, 40);
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.fillText(`Upgrade: ${nextUpg.name}`, this.canvasWidth - panelW / 2, this.canvasHeight - 125);
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`$${nextUpg.cost}`, this.canvasWidth - panelW / 2, this.canvasHeight - 105);
      } else {
        ctx.fillStyle = '#888';
        ctx.fillText('MAX LEVEL', this.canvasWidth - panelW / 2, this.canvasHeight - 125);
      }

      ctx.fillStyle = '#f44336';
      ctx.fillRect(this.canvasWidth - panelW + 20, this.canvasHeight - 80, panelW - 40, 40);
      ctx.fillStyle = '#fff';
      ctx.fillText(`Sell for $${t.getSellValue()}`, this.canvasWidth - panelW / 2, this.canvasHeight - 55);

      // Targeting mode
      ctx.fillStyle = '#607d8b';
      ctx.fillRect(this.canvasWidth - panelW + 20, this.canvasHeight - 30, panelW - 40, 20);
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.fillText(`Targeting: ${t.targetingMode}`, this.canvasWidth - panelW / 2, this.canvasHeight - 15);
    } else if (!isRoundActive) {
      // Next wave button
      this.isHoveringNextWave = mouseX > this.canvasWidth - panelW + 20 && mouseX < this.canvasWidth - 20 &&
                                mouseY > this.canvasHeight - 60 && mouseY < this.canvasHeight - 20;

      ctx.fillStyle = this.isHoveringNextWave ? '#45a049' : '#4caf50';
      ctx.fillRect(this.canvasWidth - panelW + 20, this.canvasHeight - 60, panelW - 40, 40);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('START WAVE', this.canvasWidth - panelW / 2, this.canvasHeight - 35);
    }

    // Floating placement indicator
    if (this.selectedTowerIndex >= 0 && mouseX < this.canvasWidth - panelW) {
      const def = TowerDefinitions[this.selectedTowerIndex];

      ctx.globalAlpha = 0.5;
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 15, 0, Math.PI * 2);
      ctx.fill();

      // Show range (approximate base range, would need to know exact range, we can hardcode fallback)
      // const mockTower = { range: 120 }; // placeholder
      // We will look up range from a temporary instantiation in Game.ts, but for UI just draw an arc
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // just draw a static 150 radius for now as a guide
      ctx.arc(mouseX, mouseY, 150, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 1.0;
    }

    // Draw selected tower range
    if (this.selectedBuiltTower) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.selectedBuiltTower.x, this.selectedBuiltTower.y, this.selectedBuiltTower.range, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  public drawGameOver(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    ctx.fillStyle = '#f44336';
    ctx.textAlign = 'center';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('GAME OVER', this.canvasWidth / 2, this.canvasHeight / 2 - 20);

    ctx.fillStyle = '#fff';
    ctx.font = '24px sans-serif';
    ctx.fillText('Click anywhere to restart', this.canvasWidth / 2, this.canvasHeight / 2 + 30);
  }

  public drawVictory(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    ctx.fillStyle = '#ffeb3b';
    ctx.textAlign = 'center';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('VICTORY!', this.canvasWidth / 2, this.canvasHeight / 2 - 20);

    ctx.fillStyle = '#fff';
    ctx.font = '24px sans-serif';
    ctx.fillText('You survived all 100 rounds!', this.canvasWidth / 2, this.canvasHeight / 2 + 30);
    ctx.fillText('Click anywhere to play again', this.canvasWidth / 2, this.canvasHeight / 2 + 70);
  }

  // Helper for clicking UI elements
  public handleHUDClick(x: number, y: number, cash: number, _playSpeed: number, setSpeed: (s:number)=>void, onUpgrade: ()=>void, onSell: ()=>void, onTargetToggle: ()=>void): boolean {
    const panelW = 220;

    // Check speed controls
    if (y >= 5 && y <= 35) {
      if (x >= 450 && x <= 490) { setSpeed(1); return true; }
      if (x >= 500 && x <= 540) { setSpeed(2); return true; }
    }

    if (x > this.canvasWidth - panelW) {
      // Clicked in panel
      const startY = 60;
      for (let i = 0; i < TowerDefinitions.length; i++) {
        const ty = startY + i * 55;
        if (y >= ty && y <= ty + 50) {
          if (cash >= TowerDefinitions[i].cost) {
            this.selectedTowerIndex = i;
            this.selectedBuiltTower = null; // deselect built tower
          }
          return true;
        }
      }

      if (this.selectedBuiltTower) {
        // Upgrade btn
        if (y >= this.canvasHeight - 140 && y <= this.canvasHeight - 100) {
          onUpgrade();
          return true;
        }
        // Sell btn
        if (y >= this.canvasHeight - 80 && y <= this.canvasHeight - 40) {
          onSell();
          return true;
        }
        // Target toggle
        if (y >= this.canvasHeight - 30 && y <= this.canvasHeight - 10) {
          onTargetToggle();
          return true;
        }
      }

      return true; // Clicked UI area
    }
    return false; // Clicked game area
  }
}