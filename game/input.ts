import Button from "../util/button"
import vector from "../util/vector"

class Mouse{
  pos : vector;
  left : MouseButton = new MouseButton();
  right : MouseButton = new MouseButton();

}

class MouseButton{
  posPressed : vector;
  posReleased : vector;
  state : Button;
}



class InputState {
  mousedown : vector = null;
  mouseup : vector = null;
  mousepos : vector = null;
  leftClick : Button = new Button();
  rightClick : Button = new Button();
  left: Button = new Button();
  right: Button = new Button();
  reel: Button = new Button();
  jump: Button = new Button();
  down: Button = new Button();
  restart: Button = new Button();
  stale() {
    if(this.mouseup){
      this.mousedown = null;
      this.mouseup = null;
    }
    this.leftClick.updated = false;
    this.rightClick.updated = false;
    this.left.updated = false;
    this.right.updated = false;
    this.jump.updated = false;
    this.down.updated = false;
    this.restart.updated = false;
    this.reel.updated = false;
  }
}

export default class Controller {
  left: string;
  right: string;
  jump: string;
  down: string;
  restart: string;
  reel: string;
  state: InputState;
  constructor(left: string, right: string, jump: string, down: string, restart: string, reel: string) {
    this.left = left;
    this.right = right;
    this.jump = jump;
    this.down = down;
    this.restart = restart;
    this.reel = reel;
    this.state = new InputState();
  }
  listen(element: HTMLElement) {
    //mouse events
    let getMousePos = (e: MouseEvent, element: HTMLElement): vector => {
      var rect = element.getBoundingClientRect();
        
      return new vector(e.clientX - rect.left, e.clientY - rect.top);
    }
    element.addEventListener("mousedown",(e)=>{
      let pos:vector = getMousePos(e,element);
      this.state.mousedown = pos;
      this.state.leftClick.update(true);
    });

    element.addEventListener("mouseup",(e)=>{
      let pos:vector = getMousePos(e,element);
      this.state.mouseup = pos;
      this.state.leftClick.update(false);
    });

    element.addEventListener("mousemove",(e)=>{
      let pos:vector = getMousePos(e,element);
      this.state.mousepos = pos;
    });
    element.addEventListener("contextmenu",(e)=>{
      e.preventDefault();
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
          case this.jump:
            this.state.jump.update(value);
            break;
          case this.down:
            this.state.down.update(value);
            break;
          case this.restart:
            this.state.restart.update(value);
            break;
          case this.reel:
            this.state.reel.update(value);
            break;
        }
      }
    }
    element.addEventListener("keydown", handlerFactory(true));
    element.addEventListener("keyup", handlerFactory(false));
  }
}