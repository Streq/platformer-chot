export default interface LevelDTO {
  player: Array<any>;
  objects: Array<{type:string, args:Array<any>}>;
}