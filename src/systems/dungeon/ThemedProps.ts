import * as THREE from 'three';
import { DUNGEON_CONFIG } from '../../config/dungeon';

const cell = DUNGEON_CONFIG.CELL_SIZE;

export interface PropPlacement {
  type: string;
  offsetX: number;
  offsetZ: number;
  rotation: number;
  scale: number;
}

function makeBox(w: number, h: number, d: number, color: number): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.1 })
  );
}

function makeCylinder(rTop: number, rBot: number, h: number, color: number, segments = 8): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(rTop, rBot, h, segments),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.2 })
  );
}

function makeSphere(r: number, color: number): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.SphereGeometry(r, 8, 8),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1 })
  );
}

function makeTorus(r: number, tube: number, color: number): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.TorusGeometry(r, tube, 8, 16),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.3 })
  );
}

export function createProp(type: string): THREE.Object3D {
  switch (type) {
    case 'coffin': {
      const g = new THREE.Group();
      const base = makeBox(1.8, 0.4, 0.8, 0x3a3028);
      base.position.y = 0.2;
      const lid = makeBox(1.9, 0.15, 0.85, 0x2a2018);
      lid.position.y = 0.47;
      g.add(base, lid);
      return g;
    }
    case 'cage': {
      const g = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const bar = makeCylinder(0.03, 0.03, 2.5, 0x5a5a5a);
        const angle = (i / 4) * Math.PI * 2;
        bar.position.set(Math.cos(angle) * 0.5, 1.25, Math.sin(angle) * 0.5);
        g.add(bar);
      }
      const roof = makeCylinder(0.55, 0.55, 0.1, 0x4a4a4a, 16);
      roof.position.y = 2.55;
      g.add(roof);
      return g;
    }
    case 'altar': {
      const g = new THREE.Group();
      const base = makeBox(2, 0.8, 1, 0x4a4a5a);
      base.position.y = 0.4;
      const top = makeBox(2.2, 0.15, 1.2, 0x5a5a6a);
      top.position.y = 0.88;
      g.add(base, top);
      return g;
    }
    case 'bookshelf': {
      const g = new THREE.Group();
      const frame = makeBox(2, 2.5, 0.5, 0x4a3020);
      frame.position.y = 1.25;
      g.add(frame);
      const colors = [0x8a2222, 0x224488, 0x228844, 0x886622, 0x662288];
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
          const book = makeBox(0.25, 0.5, 0.35, colors[(row + col) % colors.length]);
          book.position.set(-0.6 + col * 0.6, 0.4 + row * 0.6, 0);
          g.add(book);
        }
      }
      return g;
    }
    case 'pill': {
      return makeCylinder(0.3, 0.4, 0.3, 0x334433);
    }
    case 'chain': {
      const g = new THREE.Group();
      for (let i = 0; i < 5; i++) {
        const link = makeTorus(0.08, 0.02, 0x666666);
        link.position.y = 2.0 - i * 0.15;
        link.rotation.x = i % 2 === 0 ? 0 : Math.PI / 2;
        g.add(link);
      }
      return g;
    }
    case 'bloodpool': {
      const pool = makeCylinder(0.8, 0.8, 0.05, 0x880000, 16);
      pool.position.y = 0.03;
      return pool;
    }
    case 'candelabra': {
      const g = new THREE.Group();
      const pole = makeCylinder(0.04, 0.06, 1.5, 0x8a7a5a);
      pole.position.y = 0.75;
      g.add(pole);
      for (let i = 0; i < 3; i++) {
        const candle = makeCylinder(0.03, 0.03, 0.2, 0xffeecc);
        const angle = (i / 3) * Math.PI * 2;
        candle.position.set(Math.cos(angle) * 0.15, 1.6, Math.sin(angle) * 0.15);
        g.add(candle);
        const flame = makeSphere(0.04, 0xff8800);
        flame.position.set(Math.cos(angle) * 0.15, 1.75, Math.sin(angle) * 0.15);
        g.add(flame);
      }
      return g;
    }
    case 'chest': {
      const g = new THREE.Group();
      const base = makeBox(0.8, 0.5, 0.6, 0x5a4020);
      base.position.y = 0.25;
      const lid = makeBox(0.85, 0.15, 0.65, 0x4a3018);
      lid.position.y = 0.58;
      const lock = makeBox(0.1, 0.1, 0.1, 0xccaa22);
      lock.position.set(0, 0.4, 0.33);
      g.add(base, lid, lock);
      return g;
    }
    case 'runic_circle': {
      const g = new THREE.Group();
      const outer = makeTorus(1.5, 0.08, 0x6644aa);
      outer.rotation.x = Math.PI / 2;
      outer.position.y = 0.05;
      const inner = makeTorus(1.0, 0.06, 0x8866cc);
      inner.rotation.x = Math.PI / 2;
      inner.position.y = 0.06;
      g.add(outer, inner);
      return g;
    }
    case 'prayer_bench': {
      const g = new THREE.Group();
      const seat = makeBox(1.2, 0.05, 0.5, 0x6a5a4a);
      seat.position.y = 0.5;
      const leg1 = makeCylinder(0.04, 0.04, 0.5, 0x5a4a3a);
      leg1.position.set(-0.5, 0.25, 0);
      const leg2 = makeCylinder(0.04, 0.04, 0.5, 0x5a4a3a);
      leg2.position.set(0.5, 0.25, 0);
      g.add(seat, leg1, leg2);
      return g;
    }
    case 'stained_glass': {
      const g = new THREE.Group();
      const frame = makeBox(2, 2.5, 0.15, 0x4a4a5a);
      frame.position.y = 2;
      const glass = makeBox(1.6, 2.1, 0.1, 0x4488cc);
      glass.position.y = 2;
      glass.position.z = 0.05;
      g.add(frame, glass);
      return g;
    }
    case 'gold_pile': {
      const g = new THREE.Group();
      for (let i = 0; i < 6; i++) {
        const coin = makeCylinder(0.15, 0.15, 0.03, 0xccaa22, 12);
        coin.position.set(
          (Math.random() - 0.5) * 0.8,
          0.02 + Math.random() * 0.15,
          (Math.random() - 0.5) * 0.8
        );
        coin.rotation.x = Math.random() * 0.5;
        g.add(coin);
      }
      return g;
    }
    case 'holy_statue': {
      const g = new THREE.Group();
      const base = makeCylinder(0.4, 0.5, 0.3, 0x8a8a9a);
      base.position.y = 0.15;
      const body = makeCylinder(0.2, 0.3, 1.5, 0x9a9aaa);
      body.position.y = 1.05;
      const head = makeSphere(0.2, 0xaaaabb);
      head.position.y = 1.95;
      g.add(base, body, head);
      return g;
    }
    default: {
      return makeBox(0.5, 0.5, 0.5, 0x555555);
    }
  }
}

export function getPropsForTheme(themeId: string): PropPlacement[] {
  switch (themeId) {
    case 'crypt':
      return [
        { type: 'coffin', offsetX: -1, offsetZ: -1, rotation: 0, scale: 1 },
        { type: 'coffin', offsetX: 1, offsetZ: -1, rotation: 0, scale: 1 },
        { type: 'coffin', offsetX: 0, offsetZ: 1, rotation: Math.PI / 2, scale: 1 },
        { type: 'candelabra', offsetX: -1.5, offsetZ: 0, rotation: 0, scale: 1 },
        { type: 'candelabra', offsetX: 1.5, offsetZ: 0, rotation: 0, scale: 1 },
      ];
    case 'prison':
      return [
        { type: 'cage', offsetX: -2, offsetZ: -1, rotation: 0, scale: 1 },
        { type: 'cage', offsetX: -2, offsetZ: 1, rotation: 0, scale: 1 },
        { type: 'chain', offsetX: 2, offsetZ: -1.5, rotation: 0, scale: 1 },
        { type: 'chain', offsetX: 2, offsetZ: 0, rotation: 0, scale: 1 },
        { type: 'chain', offsetX: 2, offsetZ: 1.5, rotation: 0, scale: 1 },
        { type: 'pill', offsetX: -1, offsetZ: 0, rotation: 0, scale: 1 },
      ];
    case 'library':
      return [
        { type: 'bookshelf', offsetX: -2.5, offsetZ: 0, rotation: 0, scale: 1 },
        { type: 'bookshelf', offsetX: 2.5, offsetZ: 0, rotation: Math.PI, scale: 1 },
        { type: 'bookshelf', offsetX: 0, offsetZ: -2.5, rotation: Math.PI / 2, scale: 1 },
        { type: 'candelabra', offsetX: 0, offsetZ: 0, rotation: 0, scale: 1 },
        { type: 'bloodpool', offsetX: 1, offsetZ: 1, rotation: 0, scale: 1 },
      ];
    case 'sewer':
      return [
        { type: 'pill', offsetX: -2, offsetZ: -2, rotation: 0, scale: 1 },
        { type: 'pill', offsetX: 2, offsetZ: -2, rotation: 0, scale: 1 },
        { type: 'pill', offsetX: -2, offsetZ: 2, rotation: 0, scale: 1 },
        { type: 'pill', offsetX: 2, offsetZ: 2, rotation: 0, scale: 1 },
      ];
    case 'chapel':
      return [
        { type: 'altar', offsetX: 0, offsetZ: -2, rotation: 0, scale: 1 },
        { type: 'prayer_bench', offsetX: -1.5, offsetZ: 1, rotation: 0, scale: 1 },
        { type: 'prayer_bench', offsetX: 0, offsetZ: 1, rotation: 0, scale: 1 },
        { type: 'prayer_bench', offsetX: 1.5, offsetZ: 1, rotation: 0, scale: 1 },
        { type: 'stained_glass', offsetX: 0, offsetZ: -2.8, rotation: 0, scale: 1 },
        { type: 'holy_statue', offsetX: -2.5, offsetZ: -2, rotation: 0, scale: 1 },
        { type: 'holy_statue', offsetX: 2.5, offsetZ: -2, rotation: 0, scale: 1 },
      ];
    case 'torture':
      return [
        { type: 'cage', offsetX: -2, offsetZ: 0, rotation: 0, scale: 1 },
        { type: 'chain', offsetX: 2, offsetZ: -1, rotation: 0, scale: 1 },
        { type: 'chain', offsetX: 2, offsetZ: 1, rotation: 0, scale: 1 },
        { type: 'bloodpool', offsetX: 0, offsetZ: 1.5, rotation: 0, scale: 1 },
        { type: 'pill', offsetX: -1, offsetZ: -2, rotation: 0, scale: 1 },
        { type: 'pill', offsetX: 1, offsetZ: -2, rotation: 0, scale: 1 },
      ];
    case 'ritual':
      return [
        { type: 'runic_circle', offsetX: 0, offsetZ: 0, rotation: 0, scale: 1 },
        { type: 'candelabra', offsetX: -2, offsetZ: -2, rotation: 0, scale: 1 },
        { type: 'candelabra', offsetX: 2, offsetZ: -2, rotation: 0, scale: 1 },
        { type: 'candelabra', offsetX: -2, offsetZ: 2, rotation: 0, scale: 1 },
        { type: 'candelabra', offsetX: 2, offsetZ: 2, rotation: 0, scale: 1 },
      ];
    case 'treasure':
      return [
        { type: 'chest', offsetX: -1.5, offsetZ: -1, rotation: 0, scale: 1 },
        { type: 'chest', offsetX: 0, offsetZ: -1, rotation: 0, scale: 1 },
        { type: 'chest', offsetX: 1.5, offsetZ: -1, rotation: 0, scale: 1 },
        { type: 'gold_pile', offsetX: -1, offsetZ: 1, rotation: 0, scale: 1 },
        { type: 'gold_pile', offsetX: 0, offsetZ: 1.5, rotation: 0, scale: 1 },
        { type: 'gold_pile', offsetX: 1, offsetZ: 1, rotation: 0, scale: 1 },
      ];
    case 'antechamber':
      return [
        { type: 'altar', offsetX: 0, offsetZ: -2, rotation: 0, scale: 1 },
        { type: 'holy_statue', offsetX: -3, offsetZ: -2, rotation: 0, scale: 1.2 },
        { type: 'holy_statue', offsetX: 3, offsetZ: -2, rotation: 0, scale: 1.2 },
        { type: 'candelabra', offsetX: -2, offsetZ: 2, rotation: 0, scale: 1 },
        { type: 'candelabra', offsetX: 2, offsetZ: 2, rotation: 0, scale: 1 },
      ];
    case 'boss':
      return [
        { type: 'altar', offsetX: 0, offsetZ: -3, rotation: 0, scale: 1.5 },
        { type: 'holy_statue', offsetX: -4, offsetZ: -3, rotation: 0, scale: 1.5 },
        { type: 'holy_statue', offsetX: 4, offsetZ: -3, rotation: 0, scale: 1.5 },
        { type: 'stained_glass', offsetX: -4, offsetZ: 0, rotation: Math.PI / 2, scale: 1 },
        { type: 'stained_glass', offsetX: 4, offsetZ: 0, rotation: Math.PI / 2, scale: 1 },
        { type: 'prayer_bench', offsetX: -2, offsetZ: 2, rotation: 0, scale: 1 },
        { type: 'prayer_bench', offsetX: 0, offsetZ: 2, rotation: 0, scale: 1 },
        { type: 'prayer_bench', offsetX: 2, offsetZ: 2, rotation: 0, scale: 1 },
        { type: 'candelabra', offsetX: -3, offsetZ: 3, rotation: 0, scale: 1 },
        { type: 'candelabra', offsetX: 3, offsetZ: 3, rotation: 0, scale: 1 },
      ];
    default:
      return [];
  }
}

export function placeProps(
  props: PropPlacement[],
  roomCenterX: number,
  roomCenterZ: number,
  group: THREE.Group
): void {
  for (const prop of props) {
    const obj = createProp(prop.type);
    obj.position.set(
      roomCenterX + prop.offsetX * cell * 0.5,
      0,
      roomCenterZ + prop.offsetZ * cell * 0.5
    );
    obj.rotation.y = prop.rotation;
    if (prop.scale !== 1) {
      obj.scale.setScalar(prop.scale);
    }
    group.add(obj);
  }
}
