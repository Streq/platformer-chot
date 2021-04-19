import {Vector, Box, Segment} from "./shapes"
import * as C from "../../util/collision"

export interface BoxBoxCollisionInfo {
  lambda: number;
  side: Vector;
}
export function boxBoxDynamic(b1:Box, b2:Box, delta:Vector): boolean { 
  return C.boxBoxMoving(b1.pos.x, b1.pos.y, b1.dim.x, b1.dim.y, b2.pos.x, b2.pos.y, b2.dim.x, b2.dim.y, delta.x, delta.y);
}
export function boxBoxDynamicInfo(b1:Box, b2:Box, delta:Vector): BoxBoxCollisionInfo { 
  return {
    lambda: C.boxBoxMovingLambda(b1.pos.x, b1.pos.y, b1.dim.x, b1.dim.y, b2.pos.x, b2.pos.y, b2.dim.x, b2.dim.y, delta.x, delta.y),
    side: C.boxBoxSideOfCollision(b1.pos.x, b1.pos.y, b1.dim.x, b1.dim.y, b2.pos.x, b2.pos.y, b2.dim.x, b2.dim.y, delta.x, delta.y)
  }
}
export function findFirstObstacle(b:Box, boxes:Array<Box>, delta:Vector): Box{
  let j
    , ent = null
    , lambda = 1
    , x = b.pos.x
    , y = b.pos.y
    , w = b.dim.x
    , h = b.dim.y
    , dx = delta.x
    , dy = delta.y
    ;
  for (j in boxes) {
    let e = boxes[j]
    , ex = e.pos.x
    , ey = e.pos.y
    , ew = e.dim.x
    , eh = e.dim.y
    ;
    //if there is a collision
    if (C.boxBoxMoving(x, y, w, h, ex, ey, ew, eh, dx, dy)) {
      let isCloser,
        auxLambda;
      auxLambda = C.boxBoxMovingLambda(x, y, w, h, ex, ey, ew, eh, dx, dy);
      isCloser = auxLambda < lambda || (auxLambda == lambda && (C.boxBox1D(x, w, ex, ew) || C.boxBox1D(y, h, ey, eh)));
      if (isCloser) {
        lambda = auxLambda;
        ent = e;
      };
    }
  }
  return ent;
}