export default function gameLoop(draw: () => any, update: (dt: number) => any, fps: number) {
  let frameTime = 1000 / fps;
  return setInterval(() => {
    draw();
    update(frameTime);
  }, frameTime);
}