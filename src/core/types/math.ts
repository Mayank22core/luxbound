import * as THREE from 'three';

export type Vector3 = THREE.Vector3;
export type Euler = THREE.Euler;
export type Quaternion = THREE.Quaternion;
export type Color = THREE.Color;

export const createVector3 = (x = 0, y = 0, z = 0): Vector3 =>
  new THREE.Vector3(x, y, z);
