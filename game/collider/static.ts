import * as C from "../../util/collision"

import Vector from "./shapes/vector"
import Box from "./shapes/box"

export function boxBoxStatic(b1:Box, b2:Box): boolean { 
  return C.boxBox(b1.pos.x, b1.pos.y, b1.dim.x, b1.dim.y, b2.pos.x, b2.pos.y, b2.dim.x, b2.dim.y);
}

export function boxBoxContains(b1:Box, b2:Box):boolean {
  return C.boxContainsBox(b1.pos.x, b1.pos.y, b1.dim.x, b1.dim.y, b2.pos.x, b2.pos.y, b2.dim.x, b2.dim.y);
}