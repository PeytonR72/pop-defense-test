import type { MapDefinition } from './Map';

export const Maps: MapDefinition[] = [
  {
    name: 'Verdant Valley',
    themeColor: '#2e7d32',
    pathColor: '#8d6e63',
    waypoints: [
      { x: 0, y: 0.2 },
      { x: 0.3, y: 0.2 },
      { x: 0.3, y: 0.7 },
      { x: 0.7, y: 0.7 },
      { x: 0.7, y: 0.3 },
      { x: 1.0, y: 0.3 }
    ],
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#2e7d32'; // Forest green
      ctx.fillRect(0, 0, w, h);
      // decorative elements
      ctx.fillStyle = '#1b5e20';
      ctx.beginPath();
      ctx.arc(w * 0.1, h * 0.8, w * 0.05, 0, Math.PI * 2);
      ctx.arc(w * 0.8, h * 0.1, w * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  {
    name: 'Scorched Sands',
    themeColor: '#ffb300',
    pathColor: '#6d4c41',
    waypoints: [
      { x: 0.1, y: 0 },
      { x: 0.1, y: 0.4 },
      { x: 0.9, y: 0.4 },
      { x: 0.9, y: 0.8 },
      { x: 0, y: 0.8 }
    ],
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#ffb300'; // Sand
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ff8f00';
      ctx.fillRect(w * 0.3, h * 0.6, w * 0.1, h * 0.1);
      ctx.fillRect(w * 0.7, h * 0.1, w * 0.05, h * 0.05);
    }
  },
  {
    name: 'Frostbite Peak',
    themeColor: '#b3e5fc',
    pathColor: '#37474f',
    waypoints: [
      { x: 0, y: 0.5 },
      { x: 0.2, y: 0.8 },
      { x: 0.5, y: 0.8 },
      { x: 0.8, y: 0.2 },
      { x: 1.0, y: 0.2 }
    ],
    drawBackground: (ctx, w, h) => {
      ctx.fillStyle = '#b3e5fc'; // Ice
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#e1f5fe';
      ctx.beginPath();
      ctx.moveTo(w * 0.4, h);
      ctx.lineTo(w * 0.6, h * 0.6);
      ctx.lineTo(w * 0.8, h);
      ctx.fill();
    }
  }
];

export function getMapPath(mapDef: MapDefinition, canvasWidth: number, canvasHeight: number) {
  return mapDef.waypoints.map(wp => ({
    x: wp.x * canvasWidth,
    y: wp.y * canvasHeight
  }));
}

export function drawPath(ctx: CanvasRenderingContext2D, mapDef: MapDefinition, canvasWidth: number, canvasHeight: number, pathWidth: number = 40) {
  const points = getMapPath(mapDef, canvasWidth, canvasHeight);
  if (points.length < 2) return;

  ctx.strokeStyle = mapDef.pathColor;
  ctx.lineWidth = pathWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();

  // Draw start and end indicators
  ctx.fillStyle = '#4caf50'; // Start green
  ctx.beginPath();
  ctx.arc(points[0].x, points[0].y, pathWidth / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f44336'; // End red
  ctx.beginPath();
  ctx.arc(points[points.length - 1].x, points[points.length - 1].y, pathWidth / 2, 0, Math.PI * 2);
  ctx.fill();
}