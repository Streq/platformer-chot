export default class Button {
  pressed: boolean = false;
  updated: boolean = false;

   update(value: boolean) {
    this.updated = this.pressed != value;
    this.pressed = value;
  }
}