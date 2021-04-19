let config = {
  canvas: <HTMLCanvasElement>{
    width: 400,
    height: 400,
    tabIndex: 1,
    style: {
      backgroundColor: "black"
    }
  }
}
export interface GameDom {
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  webgl: WebGLRenderingContext
};

  //set dom up
export default function generateDom(container?: HTMLElement):GameDom{
  container = container || document.body;
  let canvas = document.createElement("canvas")
  Object.assign(canvas, config.canvas);
  Object.assign(canvas.style, config.canvas.style);
  container.appendChild(canvas);
  return {
    canvas: canvas,
    ctx: canvas.getContext("2d"),
    webgl: canvas.getContext("webgl")
  };
};