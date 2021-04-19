import vector from "../../util/vector"
import * as Math2 from "../../util/math"
export default class Player {
  //Physics
  pos: vector;
  dim: vector;
  vel: vector;
  
  //State
  private _touchingFloor: boolean;
  private _availableJumps: number;
  private _rope_length: number;

  //Behavior
  private _left: boolean = false;
  private _right: boolean = false;
  private _jump: boolean = false;
  private _throw: boolean = false;
  private _pull: boolean = false;
  private _release: boolean = false;
  private _reel_up: boolean = false;
  private _rope_pos: vector;
  _at: vector;

  //Stats
  walkAcc: number = 4 / 1000;
  glideAcc: number = 1 / 1000;
  maxWalkSpeed: number = 200 / 1000;
  launchSpeed: number = 500 / 1000;
  jumpSpeed: number = 250 / 1000;
  jumps: number = 1;
  fallAcc: number = 0.5 / 1000;
  damping: number = 0.5;
  dampingGround: number = 5;
  ropeLength: number = 150;
  reelSpeed: number = 0.05;
  pullLeeWay: number = 10;

  touchFloor(value: boolean) {
    this._touchingFloor = value;
    if (value) {
      this._availableJumps = this.jumps;
    }
  }
  isTouchingFloor(): boolean {
    return this._touchingFloor;
  }
  getRopePos(): vector {
    return this._rope_pos;
  }
  getRopeCurrentLength():number {
    return this._rope_length;
  }
  moveLeft(){
    this._left = true;
  }
  moveRight(){
    this._right = true;
  }
  jump(){
    this._jump = true;
  }
  releaseRope(){
    this._release = true;
  }
  reelUp(){
    this._reel_up = true;
  }
  throwRope(at : vector){
    this._at = at;
    this._throw = at != null;
  }
  pullRope(){
    this._pull = true;
  };
  
  update(dt:number){
    let spd = ((this._touchingFloor && this.walkAcc)||this.glideAcc)
      , damp = ((this._touchingFloor && this.dampingGround)||this.damping);

    if(this._throw){
      let at = this._at;
      this._rope_length = this.ropeLength;
      let dist = vector.sub(at,this.pos);
      if(this._reel_up){
        this._rope_length = Math.min(dist.length,this.ropeLength);
      }
      if(dist.lengthSquared>this.ropeLength*this.ropeLength){
        let ropeDir = dist.normalize().mul(this._rope_length);
        this._rope_pos = vector.add(this.pos, ropeDir);
      }else {
        this._rope_pos = at;
      }
    }

    this.vel.mul(1 -  damp * dt * 0.001);
    if(this._jump && (this._touchingFloor || --this._availableJumps >= 0)){
      this.vel.y = -this.jumpSpeed;
    }
    if(this._left){
      if(this.vel.x >= -this.maxWalkSpeed){
        this.vel.x = Math2.approach(this.vel.x, -this.maxWalkSpeed, spd * dt);
      }
    }
    if(this._right){
      if(this.vel.x <= this.maxWalkSpeed){
        this.vel.x = Math2.approach(this.vel.x, this.maxWalkSpeed, spd * dt);
      }
    }
    if(this._pull && this._rope_pos){
      let dir = vector.sub(this._rope_pos,this.pos);
      let length = dir.length;
      if(length >= this._rope_length-this.pullLeeWay){
        dir.normalize().mul(this.launchSpeed);
        this.vel.add(dir);
      }
    }
    
    if(this._rope_pos){
      let distVec = vector.sub(this.pos, this._rope_pos);
      if(distVec.lengthSquared > this._rope_length*this._rope_length){
        let unit = new vector().assign(distVec.normalize());
        distVec.mul(this._rope_length);
        this.pos = vector.add(this._rope_pos, distVec);
        let scal = vector.scalarProjection(this.vel, distVec);
        if(scal>0){
          let normal = vector.mul(unit, scal);
          this.vel.sub(normal);
        }
      }
    }

    if(this._release){
      this._rope_pos = null;
    }
    
    if(this._reel_up){
      this._rope_length = Math2.approach(this._rope_length,0 , this.reelSpeed * dt);
    }
    
    this.vel.y += this.fallAcc * dt;

    this.inputReset();
  }
  inputReset(){
    this._jump = false;
    this._left = false;
    this._right = false;
    this._pull = false;
    this._throw = false;
    this._release = false;
    this._reel_up = false;
    this._at = null;
  }

  constructor(x: number, y: number, w: number, h: number) {
    this.pos = new vector(x, y);
    this.dim = new vector(w, h);
    this.vel = new vector(0, 0);
    this._availableJumps = this.jumps;
    
  }
}