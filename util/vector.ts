interface Point{
  x: number,
  y: number
}

export default class Vector implements Point{
  public x: number;
  public y: number;

  public get length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  public get lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }
  public get unit(): Vector {
    return Vector.div(this, this.length);
  }
  public normalize(): Vector {
    (this.x || this.y || this.div(1)) && this.div(this.length);
    return this;
  }
  public constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }
  public assign (b: Point): Vector{
    this.x = b.x;
    this.y = b.y;
    return this;
  }
  public add(b: Point): Vector {
    this.x += b.x;
    this.y += b.y;
    return this;
  }
  public sub(b: Point): Vector {
    this.x -= b.x;
    this.y -= b.y;
    return this;
  }
  public mul(b: number): Vector {
    this.x *= b;
    this.y *= b;
    return this;
  }
  public div(b: number): Vector {
    this.x /= b;
    this.y /= b;
    return this;
  }
  public scale(b: Point): Vector {
    this.x *= b.x;
    this.y *= b.y;
    return this;
  }
  public static copy(a:Point): Vector {
    return new Vector(a.x, a.y);
  }
  public static add(a: Point, b: Point): Vector {
    return new Vector(a.x + b.x, a.y + b.y);
  }
  public static sub(a: Point, b: Point): Vector {
    return new Vector(a.x - b.x, a.y - b.y);
  }
  public static div(a: Point, b: number): Vector {
    return new Vector(a.x / b, a.y / b);
  }
  public static mul(a: Point, b: number): Vector {
    return new Vector(a.x * b, a.y * b);
  }
  public static dot(a: Point, b: Point): number {
    return a.x * b.x + a.y * b.y;
  }
  public static cross(a: Point, b: Point): number {
    return a.x * b.y - a.y * b.x;
  }
  public static getLength(a: Point): number{
    return Math.sqrt(a.x * a.x + a.y * a.y);
  }
  public static unit(a: Point): Vector {
    return ((a.x || a.y) && Vector.div(a, Vector.getLength(a))) || new Vector(a.x,a.y);
  }
  public static scale(a: Point, b: Point): Vector {
    return new Vector(a.x * b.x, a.y * b.y);
  }
  public static scalarProjection(a: Point, b: Point): number {
    return Vector.dot(a,b)/Vector.getLength(b);
  }
  public static interpolate(a: Point, b: Point, val:number): Vector{
    return new Vector(a.x + (b.x - a.x)*val, a.y + (b.y - a.y)*val);
  }
}
