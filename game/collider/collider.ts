import * as C from "../../util/collision"
import V from "../../util/vector"
import {Vector, Box, Segment, DynamicBox} from "./shapes"
import solveDynamicStaticCollision from "./solve/dynamicStatic"

export * from "./static"
export * from "./dynamic"

import {findFirstObstacle} from "./dynamic"



export interface Contact {
  b0: DynamicBox;
  b1: Box;
  valid: boolean;
  dt: number;
}



function rayBounds(p0:Vector, p1:Vector): Box{
  let pos0 = {
      x: Math.min(p0.x,p1.x),
      y: Math.min(p0.y,p1.y)
    }
    , pos1 = {
      x: Math.max(p0.x,p1.x),
      y: Math.max(p0.y,p1.y)
    }
    , dim = {
      x: pos1.x-pos0.x,
      y: pos1.y-pos0.y
    };
  return {
    pos : pos0,
    dim : dim
  };
}

function rayBoundsCoords(p0:Vector, p1:Vector): Box{
  let pos0 = {
      x: Math.min(p0.x,p1.x),
      y: Math.min(p0.y,p1.y)
    }
    , pos1 = {
      x: Math.max(p0.x,p1.x),
      y: Math.max(p0.y,p1.y)
    };
  return {
    pos : pos0,
    dim : pos1
  };
}

interface rayCastInfo{
  box: Box,
  lambda: number,
  point: Vector
}

export function rayCastAny(p0:Vector, p1:Vector, boxes:Array<Box>): rayCastInfo{
  let j
    , ent = null
    , lambda = 1
    , b = rayBounds(p0,p1)
    , x = b.pos.x
    , y = b.pos.y
    , w = b.dim.x
    , h = b.dim.y
    ;
  for(j in boxes){
    let box = boxes[j]
      , bx = box.pos.x
      , by = box.pos.y
      , bw = box.dim.x
      , bh = box.dim.y
      ;
    if(C.boxBox(bx,by,bw,bh,x,y,w,h) && C.boxLine(bx, by, bw, bh, p0.x, p0.y, p1.x, p1.y)){
      lambda = C.boxLineLambda(bx, by, bw, bh, p0.x, p0.y, p1.x, p1.y);
      ent = {
        box: b,
        lambda: lambda,
        point: V.interpolate(p0,p1,lambda)
      }
      return ent;
    }

  }
  return ent;
}

export interface ContactSolver{
  preSolve: (c:Contact)=>void;
  solve: (c:Contact)=>number;
  postSolve: (c:Contact)=>void;
}

export function moveDynamicEntity(e:DynamicBox, dt:number, boxes:Array<Box>, solver: ContactSolver) {
  let auxdt = dt;
  while (auxdt) {
    auxdt = dynamicEntityStep(e, auxdt, boxes, solver);
  }
}

export function dynamicEntityStep(e:DynamicBox, dt:number, boxes:Array<Box>, solver: ContactSolver) {
    let dx = e.vel.x * dt
      , dy = e.vel.y * dt
      , ent = null
      , ex = e.pos.x
      , ey = e.pos.y
      , ew = e.dim.x
      , eh = e.dim.y
      ;
    ent = findFirstObstacle(e, boxes, {x: dx, y: dy});
    if (ent) {
      let contact = {
        b0: e,
        b1: ent,
        valid: true,
        dt: dt
      }
      //presolve.call(this, contact);
      dt = solver.solve(contact);
      //dt = solve(contact);
      //postsolve.call(this, contact);
    } else {
      e.pos.x += dx;
      e.pos.y += dy;
      dt = 0;
    }
    return dt;
  }

function presolve(contact) {
  if (this.contactListener && this.contactListener.preSolve) {
    this.contactListener.preSolve(contact);
  }
}

export function solve(contact:Contact) {
  let ret = contact.dt;
  if (contact.valid) {
    ret = solveDynamicStaticCollision(contact.b0, contact.b1, contact.dt);
  }
  return ret;
}

function postsolve(contact) {
  if (this.contactListener && this.contactListener.postSolve) {
    this.contactListener.postSolve(contact);
  }
}

