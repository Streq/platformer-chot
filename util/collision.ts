"use strict";
export interface vector {
  x: number;
  y: number;
}

export interface box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface range2d {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}


export function boxPoint(x: number, y: number, w: number, h: number, px: number, py: number): boolean {
  return (
    (px > x) &&
    (py > y) &&
    (px < x + w) &&
    (py < y + h)
  );
}

export function boxPointClosed(x: number, y: number, w: number, h: number, px: number, py: number): boolean {
  return (
    (px >= x) &&
    (py >= y) &&
    (px <= x + w) &&
    (py <= y + h)
  );
}

export function boxBoxCoords1D(x0: number, xw0: number, x1: number, xw1: number): boolean {
  return (
    (xw0 > x1) &&
    (xw1 > x0)
  );
}

export function boxBoxCoords1DClosed(x0: number, xw0: number, x1: number, xw1: number): boolean {
  return (
    (xw0 >= x1) &&
    (xw1 >= x0)
  );
}
export function boxBox1D(x0: number, w0: number, x1: number, w1: number): boolean {
  return (
    (x0 + w0 > x1) &&
    (x1 + w1 > x0)
  );
}

export function boxBox1DClosed(x0: number, w0: number, x1: number, w1: number): boolean {
  return (
    (x0 + w0 >= x1) &&
    (x1 + w1 >= x0)
  );
}


export function boxBox(x0: number, y0: number, w0: number, h0: number, x1: number, y1: number, w1: number, h1: number): boolean {
  return (
    (x0 + w0 > x1) &&
    (x1 + w1 > x0) &&
    (y0 + h0 > y1) &&
    (y1 + h1 > y0)
  );
}

export function boxBoxCoords(x0: number, y0: number, xw0: number, yh0: number, x1: number, y1: number, xw1: number, yh1: number): boolean {
  return (
    (xw0 > x1) &&
    (xw1 > x0) &&
    (yh0 > y1) &&
    (yh1 > y0)
  );
}
export function boxContainsBox(x0: number, y0: number, w0: number, h0: number, x1: number, y1: number, w1: number, h1: number): boolean {
  return (
    (x0 + w0 < x1) &&
    (x1 + w1 > x0) &&
    (y0 + h0 < y1) &&
    (y1 + h1 > y0)
  )
}

export function boxLine(x: number, y: number, w: number, h: number, a: number, b: number, c: number, d: number): boolean {
  return (
    //check for endpoints inside box
    boxPoint(x, y, w, h, a, b) ||
    boxPoint(x, y, w, h, c, d) ||
    //check for intersections with box segments
    lineLine(a, b, c, d, x, y, x + w, y) ||//top
    lineLine(a, b, c, d, x + w, y, x + w, y + h) ||//right
    lineLine(a, b, c, d, x, y + h, x + w, y + h) ||//bot
    lineLine(a, b, c, d, x, y, x, y + h)//left
  );
}

export function boxLineClosed(x: number, y: number, w: number, h: number, a: number, b: number, c: number, d: number): boolean {
  return (
    //check for endpoints inside box
    boxPointClosed(x, y, w, h, a, b) ||
    boxPointClosed(x, y, w, h, c, d) ||
    //check for intersections with box segments
    lineLineClosed(a, b, c, d, x, y, x + w, y) ||//top
    lineLineClosed(a, b, c, d, x + w, y, x + w, y + h) ||//right
    lineLineClosed(a, b, c, d, x, y + h, x + w, y + h) ||//bot
    lineLineClosed(a, b, c, d, x, y, x, y + h)//left
  );
}

export function boxLineLambda(x: number, y: number, w: number, h: number, a: number, b: number, c: number, d: number): number {
  return (
    Math.min(
      lineLineLambda(a, b, c, d, x, y, x + w, y),//top
      lineLineLambda(a, b, c, d, x + w, y, x + w, y + h),//right
      lineLineLambda(a, b, c, d, x, y + h, x + w, y + h),//bot
      lineLineLambda(a, b, c, d, x, y, x, y + h)//left
    )
  );
}

export function lineLine(a: number, b: number, c: number, d: number, p: number, q: number, r: number, s: number): boolean {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
}
export function lineLineClosed(a: number, b: number, c: number, d: number, p: number, q: number, r: number, s: number): boolean {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 <= lambda && lambda <= 1) && (0 <= gamma && gamma <= 1);
  }
}

export function lineLineLambda(a: number, b: number, c: number, d: number, p: number, q: number, r: number, s: number): number {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return 1;//they are parallel
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return ((0 <= lambda && lambda < 1) && (0 <= gamma && gamma <= 1)) ?
      lambda
      : 1;
  }
}

export function boxBoxMovingBroad(x0: number, y0: number, w0: number, h0: number, x1: number, y1: number, w1: number, h1: number, dx: number, dy: number): boolean {
  return boxBoxCoords //check the bounding box of the moving box
    (x0 + Math.min(0, dx), y0 + Math.min(0, dy)
    , x0 + w0 + Math.max(0, dx), y0 + h0 + Math.max(0, dy)
    , x1, y1
    , x1 + w1, y1 + h1
    );
}
export function getBoundingBox(x: number, y: number, w: number, h: number, dx: number, dy: number): box {
  return {
    x: x + Math.min(0, dx),
    y: y + Math.min(0, dy),
    w: w + Math.abs(dx),
    h: h + Math.abs(dy)
  }
}
export function getBoundingRange(x: number, y: number, w: number, h: number, dx: number, dy: number): range2d {
  return {
    x0: x + Math.min(0, dx),
    y0: y + Math.min(0, dy),
    x1: x + w + Math.max(0, dx),
    y1: y + h + Math.max(0, dy)
  }
}
/**
 * Checks collision between 2 boxes when one of them is moving a (dx,dy) distance relative to the other
 * @function
 * @param {number} x0 - initial x coord of the first box
 * @param {number} y0 - initial y coord of the first box
 * @param {number} w0 - width of the first box
 * @param {number} h0 - height of the first box
 * @param {number} x1 - initial x coord of the second box
 * @param {number} y1 - initial y coord of the second box
 * @param {number} w1 - width of the second box
 * @param {number} h1 - height of the second box
 * @param {number} dx - distance the first box would move relative to the second box, on the x axis
 * @param {number} dy - distance the first box would move relative to the second box, on the y axis
 */
export function boxBoxMoving(x0: number, y0: number, w0: number, h0: number, x1: number, y1: number, w1: number, h1: number, dx: number, dy: number): boolean {
  return (
    boxBoxMovingBroad(x0,y0,w0,h0,x1,y1,w1,h1,dx,dy) && //if bounding box doesn't collide it don't matter
    boxLineClosed //actual calc thx to my man minkowski
      (x0 - x1 - w1 //minkdif x
      , y0 - y1 - h1 //minkdif y
      , w0 + w1 //minkdif w
      , h0 + h1 //minkdif h
      , 0, 0 //origin
      , -dx, -dy //opposite distance
      )
  );
}

export function boxBoxIntersection(x0: number, y0: number, w0: number, h0: number, x1: number, y1: number, w1: number, h1: number): box {
  var x = Math.max(x0, x1);
  var y = Math.max(y0, y1)
  return !boxBox(x0,y0,w0,h0,x1,y1,w1,h1) ? null :
    {
      x: x
      , y: y
      , w: Math.min(x0 + w0, x1 + w1) - x
      , h: Math.min(y0 + h0, y1 + h1) - y
    }
}
export function segmentDistance(x0: number, w0: number, x1: number, w1: number): number {
  return (
    +(x1 > x0 + w0) * (x1 - x0 - w0)
    - +(x0 > x1 + w1) * (x0 - x1 - w1)
  );
}
export function boxBoxShortestWay(x0: number, y0: number, w0: number, h0: number, x1: number, y1: number, w1: number, h1: number): vector {
  return {
    x: segmentDistance(x0, w0, x1, w1),
    y: segmentDistance(y0, h0, y1, h1)
  };

}

/**
 * Checks the side of collision between 2 boxes when one of them is moving a (dx,dy) distance relative to the other.
 * It assumes that 1) a collision doesn't exist before displacement 2) a collision exists after displacement
 * @function
 * @param {number} x0 - initial x coord of the first box
 * @param {number} y0 - initial y coord of the first box
 * @param {number} w0 - width of the first box
 * @param {number} h0 - height of the first box
 * @param {number} x1 - initial x coord of the second box
 * @param {number} y1 - initial y coord of the second box
 * @param {number} w1 - width of the second box
 * @param {number} h1 - height of the second box
 * @param {number} dx - distance the first box moves relative to the second box, on the x axis
 * @param {number} dy - distance the first box moves relative to the second box, on the y axis
 */
export function boxBoxSideOfCollision(x0: number, y0: number, w0: number, h0: number, x1: number, y1: number, w1: number, h1: number, dx: number, dy: number): vector {
  let x=0, y=0;
  if (boxBox1D(x0, w0, x1, w1)) {
    y = dy;
  }
  else if (boxBox1D(y0, h0, y1, h1)) {
    x = dx;
  }
  else {
    let shortest = boxBoxShortestWay(x0,y0,w0,h0,x1,y1,w1,h1);
    let horizontal_collision = shortest.x / dx > shortest.y / dy;
    x = +horizontal_collision * dx;
    y = +!horizontal_collision * dy;
  }
  return { x: x, y: y };
}
export function boxBoxMovingLambda(x0: number, y0: number, w0: number, h0: number, x1: number, y1: number, w1: number, h1: number, dx: number, dy: number): number {
  return boxLineLambda
    (x0 - x1 - w1 //minkdif x
    , y0 - y1 - h1 //minkdif y
    , w0 + w1 //minkdif w
    , h0 + h1 //minkdif h
    , 0, 0 //origin
    , -dx, -dy //opposite distance
    );
}

