import * as THREE from 'three'

const HEALTHY_LEAF = new THREE.Color(0x3d7a37)
const WILTED_LEAF = new THREE.Color(0x9c8a4a)
const HEALTHY_LEAF_VAR = new THREE.Color(0x86a542)
const WILTED_LEAF_VAR = new THREE.Color(0xb0a06a)
const MOIST_SOIL = new THREE.Color(0x33271e)
const DRY_SOIL = new THREE.Color(0x6b5842)

function createMaterials() {
  return {
    terracotta: new THREE.MeshStandardMaterial({ name: 'terracotta', color: 0xc0673f, roughness: 0.78, metalness: 0.02 }),
    terracottaRim: new THREE.MeshStandardMaterial({ name: 'terracotta_rim', color: 0xb05933, roughness: 0.72, metalness: 0.02 }),
    soil: new THREE.MeshStandardMaterial({ name: 'soil', color: MOIST_SOIL.clone(), roughness: 1.0, metalness: 0 }),
    face: new THREE.MeshStandardMaterial({ name: 'face_paint', color: 0x1d1a18, roughness: 0.55, metalness: 0 }),
    leaf: new THREE.MeshStandardMaterial({ name: 'leaf_green', color: HEALTHY_LEAF.clone(), roughness: 0.45, metalness: 0.05, side: THREE.DoubleSide }),
    leafVar: new THREE.MeshStandardMaterial({ name: 'leaf_variegated', color: HEALTHY_LEAF_VAR.clone(), roughness: 0.45, metalness: 0.05, side: THREE.DoubleSide }),
    stem: new THREE.MeshStandardMaterial({ name: 'stem', color: 0x6d8c4a, roughness: 0.7, metalness: 0 }),
  }
}

type PlantMaterials = ReturnType<typeof createMaterials>

// Perfil de torneado (lathe) de la maceta: pares [radio, altura]
const POT_PROFILE: Array<[number, number]> = [
  [0.0, 0.0], [0.062, 0.0], [0.07, 0.006], [0.074, 0.02],
  [0.086, 0.07], [0.098, 0.122], [0.1, 0.134], [0.113, 0.14],
  [0.114, 0.158], [0.108, 0.16], [0.107, 0.15], [0.095, 0.145],
  [0.086, 0.12], [0.07, 0.04], [0.062, 0.03], [0.0, 0.03],
]

function radiusAt(y: number): number {
  for (let i = 1; i < 9; i++) {
    const [r0, y0] = POT_PROFILE[i - 1]
    const [r1, y1] = POT_PROFILE[i]
    if (y >= y0 && y <= y1) return r0 + (r1 - r0) * ((y - y0) / (y1 - y0 || 1))
  }
  return 0.1
}

function makePot(mat: PlantMaterials): THREE.Group {
  const g = new THREE.Group()
  g.name = 'pot_assembly'
  const pts = POT_PROFILE.map(([r, y]) => new THREE.Vector2(r, y))

  const pot = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), mat.terracotta)
  pot.name = 'pot'
  pot.castShadow = pot.receiveShadow = true
  g.add(pot)

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.1125, 0.0075, 16, 96), mat.terracottaRim)
  rim.name = 'pot_rim'
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.1505
  rim.castShadow = true
  g.add(rim)

  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.098, 0.02, 64), mat.soil)
  soil.name = 'soil'
  soil.position.y = 0.137
  soil.receiveShadow = true
  g.add(soil)

  return g
}

function placeOnWall<T extends THREE.Object3D>(mesh: T, y: number, xOffset: number): T {
  const r = radiusAt(y)
  const z = Math.sqrt(Math.max(r * r - xOffset * xOffset, 0.0001))
  const slope = Math.atan2(0.012, 0.05)
  mesh.position.set(xOffset, y, z + 0.001)
  mesh.rotation.x = -slope
  return mesh
}

function makeFace(mat: PlantMaterials): THREE.Group {
  const g = new THREE.Group()
  g.name = 'face'

  const eyeGeo = new THREE.SphereGeometry(0.0085, 24, 16)
  eyeGeo.scale(1, 1, 0.35)
  ;(['eye_left', 'eye_right'] as const).forEach((name, i) => {
    const eye = new THREE.Mesh(eyeGeo.clone(), mat.face)
    eye.name = name
    g.add(placeOnWall(eye, 0.098, i === 0 ? -0.028 : 0.028))
  })

  const smileGeo = new THREE.TorusGeometry(0.026, 0.0035, 12, 48, Math.PI * 0.78)
  smileGeo.scale(1, 0.72, 0.4)
  const smile = new THREE.Mesh(smileGeo, mat.face)
  smile.name = 'smile'
  placeOnWall(smile, 0.068, 0)
  smile.rotation.z = Math.PI + Math.PI * 0.11
  g.add(smile)

  return g
}

function leafGeometry(len: number, wid: number): THREE.ExtrudeGeometry {
  const s = new THREE.Shape()
  s.moveTo(0, len * 0.14)
  s.bezierCurveTo(wid * 0.78, len * -0.02, wid * 0.72, len * 0.66, 0, len)
  s.bezierCurveTo(-wid * 0.72, len * 0.66, -wid * 0.78, len * -0.02, 0, len * 0.14)

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.0016,
    bevelEnabled: true,
    bevelThickness: 0.0008,
    bevelSize: 0.0012,
    bevelSegments: 2,
    curveSegments: 26,
  })
  geo.translate(0, 0, -0.0016)

  const p = geo.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const z = p.getZ(i)
    const cup = -(x * x) * (7.5 / len)
    const droop = -(y / len) * (y / len) * len * 0.22
    p.setZ(i, z + cup + droop)
  }
  p.needsUpdate = true
  geo.computeVertexNormals()

  return geo
}

function makeFoliage(mat: PlantMaterials): THREE.Group {
  const g = new THREE.Group()
  g.name = 'pothos_foliage'

  const rnd = (() => {
    let seed = 7
    return () => (seed = (seed * 16807) % 2147483647) / 2147483647
  })()
  const golden = Math.PI * (3 - Math.sqrt(5))
  const VINE_COUNT = 11
  let leafN = 0

  for (let i = 0; i < VINE_COUNT; i++) {
    const a = i * golden + rnd() * 0.2
    const t = i / (VINE_COUNT - 1)
    const trailing = t > 0.45
    const reach = trailing ? 0.14 + rnd() * 0.06 : 0.05 + rnd() * 0.04
    const endY = trailing ? -0.02 + rnd() * 0.07 : 0.24 + rnd() * 0.07
    const rise = trailing ? 0.11 + rnd() * 0.04 : 0.02

    const start = new THREE.Vector3(Math.cos(a) * 0.03, 0.145, Math.sin(a) * 0.03)
    const mid = new THREE.Vector3(Math.cos(a) * reach * 0.55, 0.145 + rise, Math.sin(a) * reach * 0.55)
    const mid2 = new THREE.Vector3(Math.cos(a) * reach, 0.145 + rise * 0.45, Math.sin(a) * reach)
    const end = new THREE.Vector3(Math.cos(a) * reach * 1.02, endY, Math.sin(a) * reach * 1.02)
    const curve = new THREE.CatmullRomCurve3(trailing ? [start, mid, mid2, end] : [start, mid, end])

    const stem = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.0032, 8, false), mat.stem)
    stem.name = `stem_${i + 1}`
    stem.castShadow = true
    g.add(stem)

    const nodes = trailing ? 4 : 2
    for (let k = 0; k < nodes; k++) {
      const u = trailing ? 0.34 + (k / (nodes - 1)) * 0.64 : 0.55 + k * 0.42
      const point = curve.getPointAt(Math.min(u, 1))
      const tangent = curve.getTangentAt(Math.min(u, 1)).normalize()
      const len = 0.085 + rnd() * 0.035
      const leaf = new THREE.Mesh(leafGeometry(len, len * 0.8), rnd() > 0.7 ? mat.leafVar : mat.leaf)
      leaf.name = `leaf_${++leafN}`
      leaf.castShadow = true

      const dir = tangent.clone()
      dir.y = trailing ? dir.y - 0.55 : dir.y * 0.6 + 0.25
      dir.normalize()
      leaf.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
      leaf.rotateY((k % 2 ? 1 : -1) * (0.5 + rnd() * 0.7))
      leaf.rotateX(-0.35 + rnd() * 0.4)
      leaf.position.copy(point)
      g.add(leaf)
    }
  }

  return g
}

export function buildPottedPothos(): THREE.Group {
  const mat = createMaterials()
  const model = new THREE.Group()
  model.name = 'smiley_pothos'
  model.add(makePot(mat), makeFace(mat), makeFoliage(mat))

  const box = new THREE.Box3().setFromObject(model)
  model.position.x -= (box.min.x + box.max.x) / 2
  model.position.z -= (box.min.z + box.max.z) / 2
  model.position.y -= box.min.y

  return model
}

/**
 * Aplica un nivel de salud (0 = marchita, 1 = saludable) al modelo ya
 * construido, mutando materiales y escala en vez de reconstruir la
 * geometría — pensado para llamarse cada vez que cambia el dato
 * (simulado por ahora) de salud de la planta.
 */
export function applyPlantHealth(model: THREE.Group, health: number): void {
  const clamped = THREE.MathUtils.clamp(health, 0, 1)

  model.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return
    const material = obj.material
    if (!(material instanceof THREE.MeshStandardMaterial)) return

    if (material.name === 'leaf_green') {
      material.color.copy(HEALTHY_LEAF).lerp(WILTED_LEAF, 1 - clamped)
    } else if (material.name === 'leaf_variegated') {
      material.color.copy(HEALTHY_LEAF_VAR).lerp(WILTED_LEAF_VAR, 1 - clamped)
    } else if (material.name === 'soil') {
      material.color.copy(MOIST_SOIL).lerp(DRY_SOIL, 1 - clamped)
    }
  })

  const foliage = model.getObjectByName('pothos_foliage')
  if (foliage) {
    foliage.scale.setScalar(THREE.MathUtils.lerp(0.92, 1, clamped))
  }
}
