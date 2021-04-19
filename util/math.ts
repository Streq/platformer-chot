export function approach(val: number, target: number, amount: number): number {
  if (val == target) return val;
  if (val < target) return Math.min(val + amount, target);
  return Math.max(val - amount, target);
};

export function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
};

export function toDegrees(radians: number): number {
  return radians * 180 / Math.PI;
};


export function modulo(index: number, size: number): number {
  return (size + (index % size)) % size;
}
export let mod = modulo;

export function clamp(min: number, max: number, val: number): number {
  return Math.min(max, Math.max(min, val));
}

export function offsetNoRepeat(size: number, index: number): number {
  //clamp
  return clamp(0, size - 1, index);
}

export function offsetRepeat(size, index): number {
  //wrap
  return modulo(size, index);
}

export function offsetBoomerang(size, index): number {
  //oscillate
  var size2 = size * 2 - 2;
  var index2 = modulo(size2, index);
  return (index2 > size - 1)
    ? size2 - index2
    : index2;
}
