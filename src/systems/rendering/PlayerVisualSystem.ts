import * as THREE from 'three';
import type { System, World } from '../../core/ecs';
import type { TransformData } from '../../core/types/game';
import type { Engine } from '../../engine/Engine';

export function createPlayerVisualSystem(engine: Engine): System {
  const geometry = new THREE.ConeGeometry(0.5, 1.2, 4);
  geometry.rotateY(Math.PI);
  geometry.translate(0, 0.6, 0);

  const material = new THREE.MeshStandardMaterial({
    color: 0xcc1111,
    roughness: 0.3,
    metalness: 0.5,
    emissive: 0x550000,
    emissiveIntensity: 0.5,
  });

  const meshRefs = new Map<number, THREE.Mesh>();

  function ensureMesh(entityId: number): void {
    if (meshRefs.has(entityId)) return;

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    engine.scene.add(mesh);
    meshRefs.set(entityId, mesh);
  }

  return {
    name: 'PlayerVisualSystem',
    priority: 50,

    init(world: World): void {
      for (const entityId of world.query('transform', 'player')) {
        ensureMesh(entityId);
      }
    },

    update(_dt: number, world: World): void {
      for (const entityId of world.query('transform', 'player')) {
        ensureMesh(entityId);
        const mesh = meshRefs.get(entityId);
        const transform = world.getComponent<TransformData>(entityId, 'transform');
        if (!mesh || !transform) continue;

        mesh.position.set(
          transform.position.x,
          transform.position.y,
          transform.position.z
        );
        mesh.rotation.set(
          transform.rotation.x,
          transform.rotation.y,
          transform.rotation.z
        );
      }
    },

    destroy(): void {
      for (const mesh of meshRefs.values()) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        engine.scene.remove(mesh);
      }
      meshRefs.clear();
    },
  };
}
