export interface Point {
  x: number;
  y: number;
}

export interface MapDefinition {
  name: string;
  waypoints: Point[];
  backgroundUrl?: string; // we'll use colors or procedural stuff mostly
  themeColor: string;
  pathColor: string;
  drawBackground: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}