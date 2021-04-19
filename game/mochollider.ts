/*
"use strict";
import * as C from "../util/collision"
let Mocho = {
  collision : C
}


class World {
  //public methods
  constructor() {
    this.staticEntities = [];
    this.dynamicEntities = [];
    this.contactListener = undefined;
  }
  show(ctx, canvas) {
    return privates.show.apply(this, arguments);
  }

  update(dt) {
    privates.moveDynamicEntities.call(this, dt);
    //privates.solveDynamicCollisions.call(this, dt);
  }

  findFirstObstacle(x, y, w, h, dx, dy) {
    return privates.findFirstObstacle.apply(this, arguments);
  }
  createBox(options) {
    let o = options;
    let box = new Box
      (o.x, o.y
      , o.w, o.h
      , o.vx, o.vy
      , o.bounce
      , o.slide
      , o.userData
      );
    switch (options.type) {
      case 'dynamic':
        this.dynamicEntities.push(box);
        break;
      case 'static':
      default:
        this.staticEntities.push(box);
        break;
    }
    return box;
  }
  destroyBox(box) {
    let i;
    [this.dynamicEntities
      , this.staticEntities
    ].forEach(function (a) {
      i = a.indexOf(box);
      if (i + 1) {
        a.splice(i, 1);
      }
    });
  }
  setContactListener(listener) {
    this.contactListener = listener;
  }
}

class Box {
  constructor(x, y, w, h, vx, vy, bounce, slide, userData) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = vx || 0;
    this.vy = vy || 0;
    this.bounce = bounce || 0;
    this.slide = slide || 1;
    this.userData = userData;
  }
}

//private methods
const privates = {
  moveDynamicEntities(dt) {
    let i;
    for (i in this.dynamicEntities) {
      privates.moveDynamicEntity.call(this, this.dynamicEntities[i], dt);
    }
  },

  moveDynamicEntity(e, dt) {
    let auxdt = dt;
    while (auxdt) {
      auxdt = privates.dynamicEntityStep.call(this, e, auxdt);
    }
  },

  dynamicEntityStep(e, dt) {
    let dx = e.vx * dt,
      dy = e.vy * dt,
      ent = null;
    ent = privates.findFirstObstacle.call(this, e.x, e.y, e.w, e.h, dx, dy);
    if (ent) {
      let contact = {
        b0: e,
        b1: ent,
        valid: true,
        dt: dt
      }
      privates.presolve.call(this, contact);
      dt = privates.solve.call(this, contact);
      privates.postsolve.call(this, contact);
    } else {
      e.x += dx;
      e.y += dy;
      dt = 0;
    }
    return dt;
  },

  presolve(contact) {
    if (this.contactListener && this.contactListener.preSolve) {
      this.contactListener.preSolve(contact);
    }
  },

  solve(contact) {
    let ret = contact.dt;
    if (contact.valid) {
      ret = privates.solveDynamicStaticCollision.call(this, contact.b0, contact.b1, contact.dt);
    }
    return ret;
  },

  postsolve(contact) {
    if (this.contactListener && this.contactListener.postSolve) {
      this.contactListener.postSolve(contact);
    }
  },

  solveDynamicStaticCollision(e, e1, dt) {
    let lambda = 1,
      sideOfCol,
      dx = e.vx * dt,
      dy = e.vy * dt;

    sideOfCol = Mocho.collision.boxBoxSideOfCollision(
      e.x, e.y, e.w, e.h,
      e1.x, e1.y, e1.w, e1.h,
      dx, dy
    );
    if (sideOfCol.x) {
      let oldx = e.x;
      //fix velocity
      e.vx = -e.vx * e.bounce;
      //fix position
      e.x = (sideOfCol.x > 0) ?
        (e1.x - e.w) :
        (e1.x + e1.w);
      lambda = (e.x - oldx) / dx;
      e.y += dy * lambda;
    } else {
      let oldy = e.y;
      //fix velocity
      e.vy = -e.vy * e.bounce;
      //fix position
      e.y = (sideOfCol.y > 0) ?
        (e1.y - e.h) :
        (e1.y + e1.h);
      lambda = (e.y - oldy) / dy;
      e.x += dx * lambda;
    }
    return dt * (1 - lambda);
  },

  findFirstObstacle(x, y, w, h, dx, dy) {
    let j,
      ent = null,
      lambda = 1;
    for (j in this.staticEntities) {
      let e1 = this.staticEntities[j];
      //if there is a collision
      if (Mocho.collision.boxBoxMoving(
        x, y, w, h,
        e1.x, e1.y, e1.w, e1.h,
        dx, dy)) {
        let isCloser,
          auxLambda;
        auxLambda = Mocho.collision.boxBoxMovingLambda(
          x, y, w, h,
          e1.x, e1.y, e1.w, e1.h,
          dx, dy
        );
        isCloser = auxLambda < lambda ||
          (
            auxLambda == lambda &&
            (
              Mocho.collision.rangeRange(x, w, e1.x, e1.w) ||
              Mocho.collision.rangeRange(y, h, e1.y, e1.h)
            )
          );
        if (isCloser) {
          lambda = auxLambda;
          ent = e1;
        };
      }
    }
    return ent;
  },

  show(ctx, canvas) {
    let i, e, hw, hh;
    hw = canvas.width * 0.5;
    hh = canvas.height * 0.5;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (i in this.staticEntities) {
      ctx.fillStyle = "#FFFFFF";
      e = this.staticEntities[i];
      ctx.fillRect(e.x + hw, e.y + hh, e.w, e.h);
      ctx.fillStyle = "#0000FF";
      ctx.fillRect(e.x + 1 + hw, e.y + 1 + hh, e.w - 2, e.h - 2);
    }
    ctx.fillStyle = "#00FF00";
    for (i in this.dynamicEntities) {
      e = this.dynamicEntities[i];
      ctx.fillRect(e.x + hw, e.y + hh, e.w, e.h);
    }
    ctx.strokeStyle = "#FF00FF";
    for (i in this.dynamicEntities) {
      e = this.dynamicEntities[i];
      ctx.beginPath();
      ctx.moveTo(e.x + hw + e.w / 2, e.y + hh + e.h / 2);
      ctx.lineTo(e.x + hw + e.w / 2 + e.vx * 1000, e.y + hh + e.h / 2 + e.vy * 1000);
      ctx.closePath();
      ctx.stroke();
    }

  }
};
//*/