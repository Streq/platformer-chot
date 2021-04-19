import * as C from "../../../util/collision"
import V from "../../../util/vector"
import {Vector, Box, Segment, DynamicBox} from "./../shapes"

export default function solveDynamicStaticCollision(e:DynamicBox, e1:Box, dt:number) {
  let lambda = 1
    , ex = e.pos.x
    , ey = e.pos.y
    , ew = e.dim.x
    , eh = e.dim.y
    , e1x = e1.pos.x
    , e1y = e1.pos.y
    , e1w = e1.dim.x
    , e1h = e1.dim.y
    , sideOfCol
    , dx = e.vel.x * dt
    , dy = e.vel.y * dt
    ;
  sideOfCol = C.boxBoxSideOfCollision(
    ex, ey, ew, eh,
    e1x, e1y, e1w, e1h,
    dx, dy
  );
  if (sideOfCol.x) {
    let oldx = ex;
    //fix velocity
    e.vel.x = 0;//-e.vel.x * +e.bounce;
    //fix position
    e.pos.x = ex = (sideOfCol.x > 0) ?
      (e1x - ew) :
      (e1x + e1w);
    lambda = (ex - oldx) / dx;
    e.pos.y = ey += dy * lambda;
  } else {
    let oldy = ey;
    //fix velocity
    e.vel.y = 0;//-e.vel.y * +e.bounce;
    //fix position
    e.pos.y = ey = (sideOfCol.y > 0) ?
      (e1y - eh) :
      (e1y + e1h);
    lambda = (ey - oldy) / dy;
    e.pos.x += dx * lambda;
  }
  return dt * (1 - lambda);
}