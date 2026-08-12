'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { buildPottedPothos, applyPlantHealth } from './plantModel'
import type { Plant3DViewerProps } from './Plant3DViewer.types'

const FOV = 45
// Bandas de zoom restringidas: un rango muy estrecho alrededor de la distancia
// inicial de la cámara. El usuario puede rotar, pero no alejar/acercar la planta
// lo suficiente como para romper la composición del HUD.
const SCALE_MARGIN = 0.45

export function Plant3DViewer({ health = 1, className }: Plant3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const modelRef = useRef<THREE.Group | null>(null)
  const healthRef = useRef(health)

  useEffect(() => {
    healthRef.current = health
    if (modelRef.current) applyPlantHealth(modelRef.current, health)
  }, [health])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.VSMShadowMap
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 500)

    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 1.0))
    const key = new THREE.DirectionalLight(0xffffff, 2.2)
    key.position.set(4, 7, 5)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.bias = -0.0002
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xfff4e6, 0.5)
    fill.position.set(-5, 3, -4)
    scene.add(fill)

    // Luces coloreadas que reflejan los orbes del dashboard: cada una apunta
    // hacia el follaje desde una dirección orbital distinta, bañando las hojas
    // con el color de su métrica (cian arriba, dorado derecha, teal izquierda,
    // naranja abajo). Intensidad baja: tinte, no paleta.
    const orbLights = [
      { color: 0x38bdf8, pos: [0, 4, 2] }, // Humedad sustrato — arriba
      { color: 0xfbbf24, pos: [4, 1.5, 0.5] }, // Luz — derecha
      { color: 0x2dd4bf, pos: [-4, 1.5, -0.5] }, // Humedad ambiente — izquierda
      { color: 0xfb923c, pos: [0, -2, 2] }, // Temperatura — abajo
    ] as const
    orbLights.forEach(({ color, pos }) => {
      const light = new THREE.PointLight(color, 1.1, 12)
      light.position.set(pos[0], pos[1], pos[2])
      scene.add(light)
    })

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.ShadowMaterial({ opacity: 0.18 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const model = buildPottedPothos()
    model.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
    applyPlantHealth(model, healthRef.current)
    scene.add(model)
    modelRef.current = model

    // POSE INICIAL: se centra el modelo por bounding sphere y se posiciona la
    // cámara frente a la cara de la maceta (eje +z), con la distancia derivada
    // del fov para un tamaño ideal respecto a los widgets. `controls.target`
    // queda en el centro de la esfera para que la rotación pivotee ahí.
    const box = new THREE.Box3().setFromObject(model)
    const sphere = box.getBoundingSphere(new THREE.Sphere())
    const center = sphere.center
    const dist = (sphere.radius / Math.tan((FOV * Math.PI) / 360)) * 1.15
    camera.position.set(center.x, center.y + sphere.radius * 0.35, center.z + dist)
    camera.lookAt(center)
    camera.near = 0.05
    camera.far = 100
    camera.updateProjectionMatrix()
    ground.position.y = box.min.y

    // INTERACTIVIDAD: rotación libre, zoom muy restringido, sin pan.
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.copy(center)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enableRotate = true
    controls.enableZoom = true
    controls.zoomToCursor = false
    controls.minDistance = dist * (1 - SCALE_MARGIN)
    controls.maxDistance = dist * (1 + SCALE_MARGIN)
    controls.enablePan = false
    controls.autoRotate = false

    const span = sphere.radius * 3
    key.shadow.camera.left = -span
    key.shadow.camera.right = span
    key.shadow.camera.top = span
    key.shadow.camera.bottom = -span
    key.shadow.camera.updateProjectionMatrix()

    const fit = () => {
      const w = container.clientWidth || 1
      const h = container.clientHeight || 1
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    fit()
    const resizeObserver = new ResizeObserver(fit)
    resizeObserver.observe(container)

    renderer.setAnimationLoop(() => {
      controls.update()
      renderer.render(scene, camera)
    })

    return () => {
      renderer.setAnimationLoop(null)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
      modelRef.current = null
      model.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return
        obj.geometry.dispose()
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
        materials.forEach((material) => material.dispose())
      })
      ground.geometry.dispose()
      ;(ground.material as THREE.Material).dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={className ?? 'h-full w-full'}
      role="img"
      aria-label="Modelo 3D de la planta, se puede girar arrastrando"
    />
  )
}