import vector from "../util/vector";
import iLevelDTO from "../dto/levelDTO";
import gameLoop from "../util/loop";
import Button from "../util/button";
import * as Math2 from "../util/math";
import Game from "../game/game";
import domText from "./dom"

interface TileMapI<T>{
  width:number,
  height:number,
  elements:Array<T>,
}

class TileMap<T> implements TileMapI<T>{
  width:number;
  height:number;
  elements:Array<T>;
  constructor(tilemap:TileMapI<T>){
    if(tilemap){
      this.width = tilemap.width;
      this.height = tilemap.height;
      this.elements = tilemap.elements;
    }else{
      this.width = 0;
      this.height = 0;
      this.elements = [];  
    }
  }
  forEach(callback: (value: T, x: number, y: number) => any){
    this.elements.forEach(
      (value: T, index: number) => {
        callback(value, index % this.width, Math.trunc(index / this.width));
      }
    );
  }
}

enum gameObjects
  { player
  , killblock
  , block
  , winblock
  , platform
  }

let objects = 
  [ "player"
  , "killblock"
  , "block"
  , "winblock"
  , "platform"
  ];
let modes = 
  [ "normal"
  , "pencil"
  , "delete"
  ];
let modeHandler = 
  { "normal" : normalModeHandle
  , "delete" : deleteModeHandle
  , "pencil" : pencilModeHandle
  };

let map = new Map<number,string>([
  [0xffffffff,"block"],
  [0xff0000ff,"killblock"],
  [0x00ff00ff,"player"],
  [0x0000ffff,"winblock"],
]);


//DOM
let config = {
  canvas: <HTMLCanvasElement>{
    width: 400,
    height: 400,
    tabIndex: 1,
    style: {
      backgroundColor: "black",
    }
  }
}
interface Dom {
      container: HTMLElement
    , canvas: HTMLCanvasElement
    , gameContainer : HTMLElement
    , selectObject: HTMLSelectElement
    , selectMode: HTMLSelectElement
    , gridSize: HTMLInputElement
    , viewPosX: HTMLInputElement
    , viewPosY: HTMLInputElement
    , viewSpeed: HTMLInputElement
    , exportBtn : HTMLButtonElement
    , importBtn : HTMLButtonElement
    , exportText : HTMLTextAreaElement
    , tryout : HTMLButtonElement
    };
function generateDom(): Dom{
  let app = document.createElement("div");
  app.innerHTML = domText;
  let getObj = (s:string)=>app.querySelector("[app-obj="+s+"]");
  let d = 
    { container : app as HTMLDivElement
    , canvas : getObj("canvas") as HTMLCanvasElement
    , gameContainer : getObj("tryout-app") as HTMLDivElement
    , selectObject : getObj("object") as HTMLSelectElement
    , selectMode : getObj("tool") as HTMLSelectElement
    , gridSize : getObj("gridSize") as HTMLInputElement
    , viewPosX : getObj("viewPosX") as HTMLInputElement
    , viewPosY : getObj("viewPosY") as HTMLInputElement
    , viewSpeed : getObj("cameraSpeed") as HTMLInputElement
    , exportBtn : getObj("export") as HTMLButtonElement
    , importBtn : getObj("import") as HTMLButtonElement
    , exportText : getObj("exporttext") as HTMLTextAreaElement
    , tryout : getObj("tryout") as HTMLButtonElement
    };

  //canvas
  Object.assign(d.canvas, config.canvas);
  Object.assign(d.canvas.style, config.canvas.style);
  //select object
  objects.forEach((each)=>{
    let opt = document.createElement("option");
    opt.text = each;
    opt.value = each;
    d.selectObject.appendChild(opt);
  });
  //select mode
  modes.forEach((each)=>{
    let opt = document.createElement("option");
    opt.text = each;
    opt.value = each;
    d.selectMode.appendChild(opt);
  });
  //gridSize
  d.gridSize.type = "number";
  d.gridSize.placeholder = "grid size";
  //export
  d.exportBtn.innerText = "Export";
  //import
  d.importBtn.innerText = "Import";
  //tryout
  d.tryout.innerText = "Try Out";

  d.gameContainer.style.cssFloat="left";
  return d;
  
}

interface ObjectDTO {"type":string, "args":Array<any>}

class LevelDTO implements iLevelDTO{
  player: Array<any> = null;
  objects: Array<ObjectDTO> = [];
}

//Data
class Data{
  //config
  gridSize: number = 16;
  viewSpeed: number = 0.5;
  viewPos: vector = new vector(0,0);
  selectedObject: string;
  selectedMode: string;
  input: InputState;
  //output
  level: LevelDTO = new LevelDTO();
}

//Input
class InputState{
  public mousedown : vector = null;
  public mouseup : vector = null;
  public mousepos : vector = null;
  public up : Button = new Button();
  public down : Button = new Button();
  public left : Button = new Button();
  public right : Button = new Button();

  public stale(){
    this.up.updated = false;
    this.down.updated = false;
    this.left.updated = false;
    this.right.updated = false;
    if(this.mouseup){
      this.mousedown = null;
      this.mouseup = null;
    }
  }

  
}

class Controller{
  state : InputState = new InputState();
  up : string = "KeyW";
  down : string = "KeyS";
  left : string = "KeyA";
  right : string = "KeyD";

  listen(dom : Dom, data : Data){
    //mouse events
    let getMousePos = (e: MouseEvent, element: HTMLElement): vector => {
      var rect = element.getBoundingClientRect();
        
      return new vector(e.clientX - rect.left, e.clientY - rect.top);
    }
    //mouse events
    dom.canvas.addEventListener("mousedown",(e)=>{
      let pos:vector = getMousePos(e,dom.canvas);
      this.state.mousedown = pos;
    });

    dom.canvas.addEventListener("mouseup",(e)=>{
      let pos:vector = getMousePos(e,dom.canvas);
      this.state.mouseup = pos;
    });

    dom.canvas.addEventListener("mousemove",(e)=>{
      let pos:vector = getMousePos(e,dom.canvas);
      this.state.mousepos = pos;
    });

    let handlerFactory = (value) => {
      return (event) => {
        switch (event.code) {
          case this.left:
            this.state.left.update(value);
            break;
          case this.right:
            this.state.right.update(value);
            break;
          case this.up:
            this.state.up.update(value);
            break;
          case this.down:
            this.state.down.update(value);
            break;
        }
      }
    }
    dom.canvas.addEventListener("keydown", handlerFactory(true));
    dom.canvas.addEventListener("keyup", handlerFactory(false));
    dom.gridSize.addEventListener("change", ()=>{
      data.gridSize = +dom.gridSize.value;
    });
    
    data.selectedObject = dom.selectObject.options[dom.selectObject.selectedIndex].value
    dom.selectObject.addEventListener("change", ()=>{
      data.selectedObject = dom.selectObject.options[dom.selectObject.selectedIndex].value;
    });
    data.selectedMode = dom.selectMode.options[dom.selectMode.selectedIndex].value;
    dom.selectMode.addEventListener("change", ()=>{
      data.selectedMode = dom.selectMode.options[dom.selectMode.selectedIndex].value;
    });
    dom.viewPosX.oninput = function(){data.viewPos.x = +this.value;};
    dom.viewPosY.oninput = function(){data.viewPos.y = +this.value;};
    dom.viewSpeed.oninput = function(){data.viewSpeed = +this.value;};

    dom.exportBtn.addEventListener("click", 
      ()=>{
        let copyText = JSON.stringify(data.level);
        let area = dom.exportText;
        area.value = copyText;
        /* Select the text field */
        area.select();
        /* Copy the text inside the text field */
        document.execCommand("copy");
      }
    );
    
    dom.importBtn.addEventListener("click", 
      ()=>{
        let area = dom.exportText;
        let copyText = area.value;
        data.level = JSON.parse(copyText);
      }
    );
    
    dom.tryout.addEventListener("click", 
      (()=>{
        let game = new Game();
        game.setup(dom.gameContainer);
        return ()=>{
          game.destroy();
          game.setup(dom.gameContainer);
          game.runFromDTO([data.level]);
        }
      })()
    );
    
  
  }
}

let dotLineStyle = (()=>{
  let canvas = document.createElement("canvas");
  let ls = 1;
  canvas.width = ls*2;
  canvas.height = ls*2;
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FFFFFF77";
  ctx.fillRect(0,0,ls,ls);
  ctx.fillRect(ls,ls,ls,ls);
  ctx.fillStyle = "#00000077";
  ctx.fillRect(0,ls,ls,ls);
  ctx.fillRect(ls,0,ls,ls);
  
  //return canvas;
  return ctx.createPattern(canvas,"repeat");
})();

class Renderer{
  public styles;
  public ctx : CanvasRenderingContext2D;
  constructor(){
    this.styles = {
      player: "green",
      block: "grey",
      killblock: "red",
      platform: "#77777777",
      winblock: "blue"
    }
  }
  public draw(data : Data){
    let ctx = this.ctx
      , canvas = ctx.canvas
      , gs = data.gridSize
      , width = canvas.width
      , height = canvas.height
      , x = Math.floor(data.viewPos.x)
      , y = Math.floor(data.viewPos.y)
      , m = data.input.mousepos && new vector(Math.floor(data.input.mousepos.x),data.input.mousepos.y);
     
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    //render origin
    ctx.save();
    ctx.translate(-x,-y);
    ctx.rotate(Math.PI/4);
    ctx.fillStyle="#77777777";
    ctx.fillRect(-gs*Math.SQRT1_2, -gs*Math.SQRT1_2, gs*Math.SQRT2, gs*Math.SQRT2);
    ctx.restore();
    //Mouse
    if(m){
      ctx.save();
      //render the cursor
      ctx.fillStyle = this.styles[data.selectedObject];
      ctx.translate(-x,-y);   
      let mx = m.x + x;
      let my = m.y + y;
      let gridx = mx - Math2.mod(mx,gs);
      let gridy = my - Math2.mod(my,gs);
      ctx.fillRect(gridx, gridy, gs, gs);
      ctx.restore();  
    }
    ctx.restore();
    ctx.save();
    ctx.translate(-x,-y);
    //render the levelDTO
    data.level.objects.forEach((e)=>{
      ctx.fillStyle = this.styles[e.type];
      ctx.fillRect(e.args[0], e.args[1], e.args[2], e.args[3]);
    });
    if(data.level.player){
      let e = data.level.player;
      ctx.fillStyle = this.styles["player"];
      ctx.fillRect(e[0], e[1], e[2], e[3]);
    }
    //render the grid
    ctx.restore();
    ctx.save();
    ctx.translate(-Math2.mod(x,gs), -Math2.mod(y,gs));
    if(data.gridSize > 1){
      let columns = width/gs
        , rows = height/gs
        , i;

      ctx.fillStyle = dotLineStyle;
      for(i = 0; i < rows+1; ++i){
        ctx.fillRect(-gs, i*gs, width+gs*2, 1);
      }
      for(i = 0; i < columns+1; ++i){
        ctx.fillRect(i*gs, -gs, 1, height+gs*2);
      }
    }
    ctx.restore();
    ctx.save();
    
    //renderThePosition
    ctx.font = "15px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(''+Math.floor(data.viewPos.x)+','+Math.floor(data.viewPos.y), 0, 12);
    ctx.restore();
  }
}

//Main Class
export default class MapEditor{
  private dom : Dom;
  private controller : Controller;
  private data : Data;
  private renderer : Renderer;
  private game : Game;
  constructor(){
    this.dom = generateDom();
    this.controller = new Controller();
    this.data = new Data();
    this.data.input = this.controller.state;
    this.renderer = new Renderer();
    this.renderer.ctx = this.dom.canvas.getContext("2d");
  }
  public run(){
    document.body.appendChild(this.dom.container);
    this.controller.listen(this.dom, this.data);
    gameLoop(()=>this.render(),(dt:number)=>this.update(dt),60);
  }

  private render(){
    this.renderer.draw(this.data);
  }
  private update(dt:number){
    let data = this.data;

    if(data.selectedMode){
      modeHandler[data.selectedMode](data);
    }
    
    //move view
    let dir = new vector
      ( (+data.input.right.pressed)-(+data.input.left.pressed)
      , (+data.input.down.pressed)-(+data.input.up.pressed)
      );
    if(dir.x!=0 || dir.y!=0){
      this.data.viewPos.x += dir.x * dt * this.data.viewSpeed;
      this.data.viewPos.y += dir.y * dt * this.data.viewSpeed;
      //this.dom.viewPosX.setAttribute("value", ''+this.data.viewPos.x);
      //this.dom.viewPosY.setAttribute("value", ''+this.data.viewPos.y);
    }
    
    this.data.input.stale();
  }

  static objsFromMap(tilemap: TileMap<number>, tileSize: number, x: number=0, y: number=0):ObjectDTO[]{
    let level: ObjectDTO[] = [];
    tilemap.forEach((value, i, j)=>{
      let obj: ObjectDTO = {
        type: gameObjects[value],
        args: [i*tileSize + x, j*tileSize + y, tileSize, tileSize]
      };
      level.push(obj);
    });
    return level;
  }

  static parseObjs(objs: ObjectDTO[], level: LevelDTO){
    objs.forEach((obj)=>{
      this.parseObj(obj,level);
    });
  }

  
  static parseObj(obj: ObjectDTO, level: LevelDTO){
    if(obj.type!="player"){
      level.objects.push(obj);
    }else{
      level.player = obj.args;
    }
  }

}



function normalModeHandle(data:Data){
  //instantiate entities
    if(data.input.mouseup && data.input.mousedown){
      let gs = data.gridSize
        , md = data.input.mousedown
        , mu = data.input.mouseup
        , m0 = new vector(Math.min(md.x,mu.x),Math.min(md.y,mu.y))
        , m1 = new vector(Math.max(md.x,mu.x),Math.max(md.y,mu.y))
        , v = data.viewPos
        , m0x = m0.x + v.x
        , m0y = m0.y + v.y
        , m1x = m1.x + v.x
        , m1y = m1.y + v.y
        , gridx = m0x - Math2.modulo(m0x,gs)
        , gridy = m0y - Math2.modulo(m0y,gs)
        , gridw = m1x - gridx - Math2.modulo(m1x - gridx,gs)+gs
        , gridh = m1y - gridy - Math2.modulo(m1y - gridy,gs)+gs;
      let obj = {"type":data.selectedObject,"args":[gridx, gridy, gridw, gridh]};
      MapEditor.parseObj(obj,data.level);
    }
}

function deleteModeHandle(data:Data){
  //instantiate entities
    if(data.input.mousedown){
      let gs = data.gridSize
        , m = data.input.mousepos
        , v = data.viewPos
        , mx = m.x + v.x
        , my = m.y + v.y
        , gridx = mx - Math2.modulo(mx,gs)
        , gridy = my - Math2.modulo(my,gs)
        , objs = data.level.objects;
      for(let i = objs.length-1; i >= 0; --i){
        let e = objs[i]
          , x = e.args[0]
          , y = e.args[1]
          , delet = x >= gridx 
                 && x < gridx + gs 
                 && y >= gridy 
                 && y < gridy + gs;
        if(delet){
          objs.splice(i,1);
        }
      }
    }
}
function pencilModeHandle(data:Data){
  if(data.input.mousedown){
      let gs = data.gridSize
        , m = data.input.mousepos
        , v = data.viewPos
        , mx = m.x + v.x
        , my = m.y + v.y
        , gridx = mx - Math2.modulo(mx,gs)
        , gridy = my - Math2.modulo(my,gs)
        , objs = data.level.objects;
      for(let i = objs.length-1; i>=0;--i){
        let e = objs[i]
          , x = e.args[0]
          , y = e.args[1]
          , delet = x >= gridx 
                 && x < gridx + gs 
                 && y >= gridy 
                 && y < gridy + gs;
        if(delet){
          objs.splice(i,1);
        }
      }
      let obj = {"type":data.selectedObject,"args":[gridx, gridy, gs, gs]};
      MapEditor.parseObj(obj,data.level);
    }
}