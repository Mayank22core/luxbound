import type { Room, Edge } from './DungeonTypes';

export function buildProximityGraph(rooms: Room[]): Edge[] {
  const edges: Edge[] = [];

  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      const dx = rooms[i].centerX - rooms[j].centerX;
      const dz = rooms[i].centerZ - rooms[j].centerZ;
      const dist = Math.sqrt(dx * dx + dz * dz);
      edges.push({ from: i, to: j, distance: dist });
    }
  }

  edges.sort((a, b) => a.distance - b.distance);
  return edges;
}

export function computeMST(edges: Edge[], nodeCount: number): Edge[] {
  const parent = Array.from({ length: nodeCount }, (_, i) => i);
  const rank = new Array<number>(nodeCount).fill(0);

  function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  function union(a: number, b: number): boolean {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return false;
    if (rank[ra] < rank[rb]) parent[ra] = rb;
    else if (rank[ra] > rank[rb]) parent[rb] = ra;
    else { parent[rb] = ra; rank[ra]++; }
    return true;
  }

  const mst: Edge[] = [];
  for (const edge of edges) {
    if (union(edge.from, edge.to)) {
      mst.push(edge);
      if (mst.length === nodeCount - 1) break;
    }
  }

  return mst;
}

export function addExtraEdges(edges: Edge[], mst: Edge[], count: number): Edge[] {
  const mstSet = new Set(mst.map((e) => `${e.from}-${e.to}`));
  const candidates = edges.filter((e) => !mstSet.has(`${e.from}-${e.to}`) && !mstSet.has(`${e.to}-${e.from}`));
  const extra: Edge[] = [];

  for (let i = 0; i < Math.min(count, candidates.length); i++) {
    extra.push(candidates[i]);
  }

  return extra;
}

export function findPath(
  grid: number[][],
  sx: number, sz: number,
  ex: number, ez: number,
  gridW: number, gridH: number
): Array<{ x: number; z: number }> {
  const key = (x: number, z: number) => `${x},${z}`;
  const open: Array<{ x: number; z: number; g: number; f: number }> = [];
  const closed = new Set<string>();
  const cameFrom = new Map<string, { x: number; z: number }>();
  const gScore = new Map<string, number>();

  const h = (x: number, z: number) => Math.abs(x - ex) + Math.abs(z - ez);

  const startKey = key(sx, sz);
  gScore.set(startKey, 0);
  open.push({ x: sx, z: sz, g: 0, f: h(sx, sz) });

  const neighbors = [
    { dx: 1, dz: 0 },
    { dx: -1, dz: 0 },
    { dx: 0, dz: 1 },
    { dx: 0, dz: -1 },
  ];

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift()!;
    const currentKey = key(current.x, current.z);

    if (current.x === ex && current.z === ez) {
      const path: Array<{ x: number; z: number }> = [];
      let cur: { x: number; z: number } | undefined = { x: ex, z: ez };
      while (cur) {
        path.unshift(cur);
        cur = cameFrom.get(key(cur.x, cur.z));
      }
      return path;
    }

    closed.add(currentKey);

    for (const { dx, dz } of neighbors) {
      const nx = current.x + dx;
      const nz = current.z + dz;
      const nk = key(nx, nz);

      if (nx < 0 || nx >= gridW || nz < 0 || nz >= gridH) continue;
      if (closed.has(nk)) continue;

      const cellVal = grid[nz][nx];
      const moveCost = cellVal === 0 ? 5 : 1;
      const tentativeG = current.g + moveCost;

      const prevG = gScore.get(nk);
      if (prevG !== undefined && tentativeG >= prevG) continue;

      gScore.set(nk, tentativeG);
      cameFrom.set(nk, { x: current.x, z: current.z });
      open.push({ x: nx, z: nz, g: tentativeG, f: tentativeG + h(nx, nz) });
    }
  }

  return [];
}
