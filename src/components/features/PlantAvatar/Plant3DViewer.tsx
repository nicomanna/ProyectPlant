'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { buildPottedPothos, applyPlantHealth } from './plantModel'
import type { Plant3DViewerProps } from './Plant3DViewer.types'

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
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500)
    camera.position.set(3, 2.2, 4)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.2
    controls.addEventListener('start', () => {
      controls.autoRotate = false
    })

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

    const box = new THREE.Box3().setFromObject(model)
    const sphere = box.getBoundingSphere(new THREE.Sphere())
    const dist = (sphere.radius / Math.tan((camera.fov * Math.PI) / 360)) * 1.35
    const dir = new THREE.Vector3(1, 0.55, 1.25).normalize()
    camera.position.copy(sphere.center).add(dir.multiplyScalar(dist))
    camera.near = Math.max(dist / 100, 0.01)
    camera.far = dist * 100
    camera.updateProjectionMatrix()
    controls.target.copy(sphere.center)
    controls.update()
    ground.position.y = box.min.y

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
