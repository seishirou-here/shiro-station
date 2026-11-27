import * as THREE from 'three'

/**
 * Generates crisp, zero-network procedural textures for HD Cozy Anime surface richness:
 * - Warm oak wood planks (train interior floors, benches, furniture)
 * - Subtle Japanese station platform stone tiles
 */
let cachedWoodTex: THREE.CanvasTexture | null = null
let cachedPlatformTex: THREE.CanvasTexture | null = null

export function getWoodGrainTexture(): THREE.CanvasTexture {
  if (cachedWoodTex) return cachedWoodTex
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Warm base
  ctx.fillStyle = '#d9c5b2'
  ctx.fillRect(0, 0, 512, 512)

  // Soft plank seams & subtle anime wood grain lines
  const plankCount = 8
  const plankH = 512 / plankCount
  for (let i = 0; i < plankCount; i++) {
    const y = i * plankH
    const shade = i % 2 === 0 ? 'rgba(92, 56, 36, 0.08)' : 'rgba(255, 240, 220, 0.07)'
    ctx.fillStyle = shade
    ctx.fillRect(0, y, 512, plankH)

    // Delicate grain streaks
    ctx.strokeStyle = 'rgba(72, 42, 24, 0.14)'
    ctx.lineWidth = 1.5
    for (let g = 0; g < 6; g++) {
      ctx.beginPath()
      const gy = y + 8 + g * ((plankH - 14) / 5)
      ctx.moveTo(0, gy)
      ctx.bezierCurveTo(170, gy + ((i + g) % 3 - 1) * 4, 340, gy - ((i + g) % 3 - 1) * 4, 512, gy)
      ctx.stroke()
    }

    // Plank border line
    ctx.fillStyle = 'rgba(54, 32, 18, 0.22)'
    ctx.fillRect(0, y, 512, 2)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 2)
  tex.colorSpace = THREE.SRGBColorSpace
  cachedWoodTex = tex
  return tex
}

export function getPlatformTileTexture(): THREE.CanvasTexture {
  if (cachedPlatformTex) return cachedPlatformTex
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#eee6d8'
  ctx.fillRect(0, 0, 512, 512)

  // Subtle architectural tile grid + warm micro-speckle
  const step = 64
  for (let x = 0; x < 512; x += step) {
    for (let y = 0; y < 512; y += step) {
      const tint = ((x / step + y / step) % 2) === 0 ? 'rgba(130,110,95,0.045)' : 'rgba(255,250,240,0.04)'
      ctx.fillStyle = tint
      ctx.fillRect(x, y, step, step)
    }
  }

  ctx.strokeStyle = 'rgba(105, 88, 76, 0.16)'
  ctx.lineWidth = 2
  for (let i = 0; i <= 512; i += step) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 512)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(512, i)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(16, 4)
  tex.colorSpace = THREE.SRGBColorSpace
  cachedPlatformTex = tex
  return tex
}

/**
 * Applies a subtle warm golden hover highlight directly to all meshes in a Three.js Object3D subtree
 * without mutating shared materials across unrelated objects (clones on first hover).
 */
const HIGHLIGHT_COLOR = new THREE.Color('#ffbe55')

export function setObjectHighlight(root: THREE.Object3D | null | undefined, active: boolean) {
  if (!root) return
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh || !mesh.material) return

    if (!mesh.userData.__clonedForHighlight) {
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map((m) => m.clone())
        : mesh.material.clone()
      mesh.userData.__clonedForHighlight = true
    }

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const m of mats) {
      const std = m as THREE.MeshStandardMaterial
      if (!std.emissive) continue
      if (std.userData.__origEmissive === undefined) {
        std.userData.__origEmissive = std.emissive.clone()
        std.userData.__origEmissiveIntensity = std.emissiveIntensity ?? 1
      }
      if (active) {
        std.emissive.copy(std.userData.__origEmissive as THREE.Color).lerp(HIGHLIGHT_COLOR, 0.55)
        std.emissiveIntensity = Math.max(0.45, (std.userData.__origEmissiveIntensity as number) + 0.35)
      } else {
        std.emissive.copy(std.userData.__origEmissive as THREE.Color)
        std.emissiveIntensity = std.userData.__origEmissiveIntensity as number
      }
    }
  })
}
