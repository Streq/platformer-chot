import vector from "../util/vector";
import Controller from "./input";
import levels from "./levels";
import {default as makeDom, GameDom} from "./dom";
import LevelDTO from "../dto/levelDTO";
import gameLoop from "../util/loop";
import * as Col from "../util/collision"
import * as C from "./collider"
import Player from "./objects/player"
//game logic
enum Subclass {
  player,
  block,
  platform,
  killblock,
  winblock
}


class Block {
  pos: vector;
  dim: vector;
  subclass: Subclass;
  constructor(x: number, y: number, w: number, h: number, subclass: Subclass) {
    this.pos = new vector(x, y);
    this.dim = new vector(w, h);
    this.subclass = subclass;
  }
}


interface Level {
  player: Player;
  blocks: Array<Block>;
  platforms: Array<Block>;
  killBlocks: Array<Block>;
  winBlocks: Array<Block>;
}

function levelFromJSON(options:LevelDTO):Level{
  let level:Level = {
    player: null,
    blocks: [],
    platforms: [],
    killBlocks: [],
    winBlocks: []
  };
  let ul = options.unitLength || 1;
  
  level.player = new Player(options.player[0]*ul,options.player[1]*ul,options.player[2]*ul,options.player[3]*ul);
  options.objects.forEach((each)=>{
    switch(each.type){
      case "block":
        level.blocks.push(new Block(each.args[0]*ul,each.args[1]*ul,each.args[2]*ul,each.args[3]*ul, Subclass.block));
        break;
      case "platform":
        level.platforms.push(new Block(each.args[0]*ul,each.args[1]*ul,each.args[2]*ul,each.args[3]*ul, Subclass.platform));
        break;
      case "killblock":
        level.killBlocks.push(new Block(each.args[0]*ul,each.args[1]*ul,each.args[2]*ul,each.args[3]*ul, Subclass.killblock));
        break;
      case "winblock":
        level.winBlocks.push(new Block(each.args[0]*ul,each.args[1]*ul,each.args[2]*ul,each.args[3]*ul, Subclass.winblock));
        break;
    }
  });
  return level;
}


let solver = {
  solve: C.solve,
  preSolve: null,
  postSolve: null,
}

export default class Platformer {
  private player: Player;
  private loopHandle: any;
  private controller: Controller;
  private levels: Array<Level>;
  private currentLevel: number;
  private dom: GameDom;
  constructor(){
  }
  public setup(container? : HTMLElement){
    this.dom = makeDom(container);
    this.controller = new Controller("KeyA", "KeyD", "KeyW", "KeyS", "KeyR", "ShiftLeft");
    this.controller.listen(this.dom.canvas);
  }
  public destroy(){
    clearInterval(this.loopHandle);
    this.dom.canvas.remove();
  }
  public runFromDTO(lvls:Array<LevelDTO>) {
    this.levels=[];
    lvls.forEach(each=>{
      this.levels.push(levelFromJSON(each));
    });
    
    console.log(this.levels);
    this.currentLevel = 0;
    this.respawn();
    this.loopHandle = gameLoop(this.draw.bind(this), this.update.bind(this), 60);  
  }
  public run() {
    this.runFromDTO(JSON.parse(levels));
  }
  private draw() {
    let p = this.player,
      ctx = this.dom.ctx,
      canvas = this.dom.canvas,
      l = this.levels[this.currentLevel];
    drawRectFlooredCoords(ctx, 0, 0, this.dom.canvas.width, this.dom.canvas.height);
    ctx.save();
    //set (0,0) at canvas center
    //ctx.translate(canvas.width*0.5, canvas.height*0.5);
    //set (0,0) at player center;
    let ox = Math.floor((this.dom.canvas.width - p.dim.x) * 0.5 - p.pos.x);
    let oy = Math.floor((this.dom.canvas.height - p.dim.y) * 0.5 - p.pos.y);
    ctx.translate(ox, oy);

    //draw the player
    ctx.fillStyle = p.isTouchingFloor() ? "LimeGreen" : "green";
    drawRectFlooredCoords(ctx, p.pos.x, p.pos.y, p.dim.x, p.dim.y);
    if(p.getRopePos()){
      drawRope(ctx,p.pos.x,p.pos.y,p.getRopePos().x,p.getRopePos().y,p.ropeLength,p.getRopeCurrentLength());
    }
    

    //draw the platforms
    l.platforms.forEach((e) => {
      let my_gradient = ctx.createLinearGradient(0, e.pos.y, 0, e.dim.y * 0.5 + e.pos.y);
      my_gradient.addColorStop(0, "#777777ff");
      my_gradient.addColorStop(1, "#77777700");
      ctx.fillStyle = my_gradient;
      drawRectFlooredCoords(ctx, e.pos.x, e.pos.y, e.dim.x, e.dim.y);
    });

    //draw the blocks
    ctx.fillStyle = "grey";
    l.blocks.forEach((e) => {
      drawRectFlooredCoords(ctx, e.pos.x, e.pos.y, e.dim.x, e.dim.y);
    });

    //draw the killBlocks
    ctx.fillStyle = "red";
    l.killBlocks.forEach((e) => {
      drawRectFlooredCoords(ctx, e.pos.x, e.pos.y, e.dim.x, e.dim.y);
    });

    //draw the winBLocks
    ctx.fillStyle = "blue";
    l.winBlocks.forEach((e) => {
      drawRectFlooredCoords(ctx, e.pos.x, e.pos.y, e.dim.x, e.dim.y);
    });

    ctx.restore();
  }
  private update(dt: number) {
    let p = this.player,
      input = this.controller,
      mov = new vector(0, 0),
      l = this.levels[this.currentLevel];

    if(input.state.jump.pressed && input.state.jump.updated)p.jump();
    if(input.state.left.pressed)p.moveLeft();
    if(input.state.right.pressed)p.moveRight();
    if(input.state.down.pressed && input.state.down.updated)p.pullRope();
    if(input.state.leftClick.pressed && input.state.leftClick.updated){
      let scrCenter = new vector((this.dom.canvas.width - p.dim.x)/2, (this.dom.canvas.height - p.dim.y)/2);
      let worldClickPos = vector.add(vector.sub(input.state.mousedown,scrCenter),p.pos);
      p.throwRope(worldClickPos);
    }
    if(input.state.leftClick.updated && !input.state.leftClick.pressed){
      p.releaseRope();
    }
    if(input.state.reel.pressed){
      p.reelUp();
    }
    {//ROPE THROWING LOGIC
      let ropePos = p._at;
      if(ropePos){
        ropePos.assign(
          vector
            .copy(p.pos)
            .add(
              vector
                .sub(ropePos,p.pos)
                .normalize()
                .mul(p.ropeLength)
              )
        );
        let raycast = C.rayCastAny(p.pos, ropePos, l.blocks);
        if(raycast){
          ropePos.assign(vector.copy(raycast.point));
        }else{
          p.throwRope(null);
        }
      }
    }
    p.update(dt);
    
    //C.moveDynamicEntity(p,dt,[...l.blocks,...l.winBlocks,...l.killBlocks,...l.platforms],solver);

    //*
    let movement = vector.mul(p.vel, dt);
    p.touchFloor(false);
    l.platforms.forEach(
      (e) => {
        let preCol = C.boxBoxStatic(p, e)
          , postCol = C.boxBoxDynamic(p, e, movement)
          , info = postCol && C.boxBoxDynamicInfo(p, e, movement);
        if(!preCol && postCol && info.side.y>0){
          p.pos.y = e.pos.y - p.dim.y;
          p.vel.y = 0;
          if (!input.state.down.pressed) {
            movement.y = 0;
          }
          p.touchFloor(true);
        }
      }
    );
    
    l.blocks.forEach(
      (e) => {
        let col = C.boxBoxDynamic(p,e,movement)
          , info = col && C.boxBoxDynamicInfo(p,e,movement);
        if(col){//is vertical
          if (info.side.y) {
            p.vel.y = 0;
            movement.y = 0;
            //is bottom side of player / top side of wall
            if (info.side.y > 0) {
              p.pos.y = e.pos.y - p.dim.y;
              p.touchFloor(true);
            } else {
              p.pos.y = e.pos.y + e.dim.y;
            }
          } else if (info.side.x) {//is horizontal
            p.vel.x = 0;
            movement.x = 0;
            //is right side of player / left side of wall
            if (info.side.x > 0) {
              p.pos.x = e.pos.x - p.dim.x;
            } else {
              p.pos.x = e.pos.x + e.dim.x;
            }
          }
        }
      }
    );
    l.killBlocks.forEach(
      (e) => {
        let col = C.boxBoxDynamic(p,e,movement);
        if (col) {
          this.respawn();
        }
      }
    );

    l.winBlocks.forEach(
      (e) => {
        let col = C.boxBoxDynamic(p,e,movement);
        if (col) {
          this.currentLevel = (this.currentLevel+1) % this.levels.length;
          this.respawn();
        }
      }
    )
    p.pos.add(movement);
    //*/
    
    if(input.state.restart.pressed){
      this.respawn();
    }

    //clear input update
    input.state.stale();
  }

  private respawn(){
    let sp = this.levels[this.currentLevel].player;
    this.player = new Player(sp.pos.x,sp.pos.y,sp.dim.x,sp.dim.y);
    
  }
}
function drawRectFlooredCoords(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number):void{
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
};

function drawRope(ctx:CanvasRenderingContext2D, x0:number, y0:number, x1:number, y1:number, length:number, curLength:number){
  drawRopeSection(ctx,x0,y0,x1,y1,curLength);
  drawRopeSection(ctx,x0,y0,x0+8,y0,length-curLength+8);
  //straight rope
  /*
  let dist = new vector(x1,y1).sub(new vector(x0,y0)).normalize();
  drawRopeSection(ctx,x1-dist.x*length,y1-dist.y*length,x1,y1,length);
  //*/
  
}

function drawRopeSection(ctx:CanvasRenderingContext2D, x0:number, y0:number, x1:number, y1:number, length:number){
  let c = new vector();
  let dist = new vector(x1,y1).sub(new vector(x0,y0));
  let actualLength = dist.length;
  let spareLength = length - actualLength;
  let vec = dist.unit.mul(length);
  ctx.strokeStyle = "white";
  ctx.beginPath();
  
  //calcular punto control a partir de length y (x0,y0) (x1,y1)
  
  ctx.moveTo(x0,y0);
  ctx.quadraticCurveTo(x0+dist.x*0.5,y0+dist.y*0.5 + spareLength,x1,y1);
  ctx.stroke();
  
}