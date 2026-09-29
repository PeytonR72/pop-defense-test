export class Input {
  public mouseX: number = 0;
  public mouseY: number = 0;
  public isMouseDown: boolean = false;
  public clicks: { x: number, y: number }[] = [];

  constructor(private canvas: HTMLCanvasElement) {
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    // prevent right click menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private handleMouseMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
  }

  private handleMouseDown(_e: MouseEvent) {
    this.isMouseDown = true;
  }

  private handleMouseUp(_e: MouseEvent) {
    this.isMouseDown = false;
  }

  private handleClick(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.clicks.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }

  public getNextClick(): { x: number, y: number } | undefined {
    return this.clicks.shift();
  }
}