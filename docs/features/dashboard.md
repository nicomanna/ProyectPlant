# Feature: Dashboard — Planta 3D interactiva

> **Estado:** Completo
> **Archivos clave:** `src/components/features/PlantAvatar/*`, `src/hooks/useSimulatedPlantHealth.ts`, `src/app/page.tsx`
> **Dependencias:** `three` (nueva)

---

## Descripción
Pantalla principal (dashboard) de la app: un modelo 3D de un Potus (pothos) en maceta, con carita feliz pintada en la maceta, centrado en la pantalla, rotable en 360° por el usuario, que reacciona visualmente a datos de salud de la planta (por ahora simulados client-side, hasta que exista la feature `sensores`).

## Objetivo
Darle a la pantalla principal el "efecto Tamagotchi" pedido en el brief original: algo vivo, a color, no formal, que dé ganas de interactuar (arrastrar para girar) y que transmita el estado de la planta con el vistazo.

## Origen del modelo 3D
El usuario proveyó `src/Potus 3D.html`, un archivo exportado desde un Artifact de Claude (formato "bundle" autocontenido: assets comprimidos en gzip+base64 dentro de `<script type="__bundler/manifest">`, más un loader que los descomprime a blob URLs en runtime). No es HTML/CSS con el diseño — es una escena de **three.js 100% procedural**, sin texturas ni modelos externos (GLTF/OBJ): la geometría de la maceta, la cara y el follaje se construye enteramente por código con formas primitivas (Lathe, Torus, Extrude, Tube) y un generador pseudo-aleatorio con semilla fija.

Se extrajo el código fuente real descomprimiendo dos entradas del manifest (`plantModel` y `stageScript`) con un script de Node (`zlib.gunzipSync`) — el archivo `.html` en sí no es legible ni ejecutable como fuente. La función clave portada es `buildPottedPothos()`, que arma el `THREE.Group` completo del modelo.

> ⚠️ `src/Potus 3D.html` (622 KB) quedó dentro de `src/`, que por convención (`docs/02-architecture.md`) es solo código de la app. Ya no hace falta para compilar — el modelo fue portado a TypeScript. Le pregunto al usuario si lo movemos fuera de `src/` (ej. a una carpeta de referencia) o se borra, en vez de decidirlo yo.

## Modelo de Datos
No aplica. La "salud" de la planta es un número `0..1` generado client-side (`useSimulatedPlantHealth`), no persistido. Cuando exista la feature `sensores`, este hook se reemplaza por datos reales de Supabase — la interfaz del componente (`health: number`) no debería necesitar cambiar.

## Flujo de Uso
1. La usuaria entra a `/` (ya autenticada, protegida por `src/proxy.ts`).
2. Se monta `Plant3DViewer`: crea renderer, cámara, luces, controles de órbita, y construye el modelo 3D una sola vez.
3. Auto-rotación (turntable) hasta el primer gesto del usuario; a partir de ahí, control manual (arrastrar = orbitar, pellizcar/scroll = zoom).
4. `useSimulatedPlantHealth` actualiza un valor de salud cada pocos segundos (placeholder); el viewer aplica ese valor al modelo sin reconstruir la geometría (tinte de hojas y tierra, y una ligera contracción del follaje si la salud baja).

## Componentes / Archivos
| Archivo | Responsabilidad |
|---------|----------------|
| `src/components/features/PlantAvatar/plantModel.ts` | Construye el `THREE.Group` de la planta (`buildPottedPothos`) y aplica el efecto de salud (`applyPlantHealth`) — puerto directo de la lógica extraída del Artifact |
| `src/components/features/PlantAvatar/Plant3DViewer.tsx` | Componente cliente: monta la escena three.js (renderer, cámara, luces, `OrbitControls`, resize, loop de render) dentro de un contenedor, y aplica `health` cuando cambia |
| `src/components/features/PlantAvatar/Plant3DViewer.types.ts` | Props del viewer |
| `src/components/features/PlantAvatar/index.ts` | Barrel export |
| `src/hooks/useSimulatedPlantHealth.ts` | Hook placeholder: devuelve un `health` (0–1) que varía solo en el cliente, hasta que exista la feature `sensores` |
| `src/app/page.tsx` | Dashboard: centra `Plant3DViewer` mobile-first y le pasa el `health` simulado |

## UI / Pantallas
`/` (dashboard): layout mobile-first, el viewer 3D ocupa el centro de la pantalla (la mayor parte del viewport), con un título breve y una pista de interacción ("Arrastrá para girar la planta"). Fondo cálido (`bg-green-50`), consistente con `/login`.

## Reacción a datos (simulados)
`health` (0 a 1) afecta, sin reconstruir geometría:
- Color de las hojas: interpola entre verde saludable y un tono amarillo/marrón marchito.
- Color de la tierra: interpola entre tierra húmeda oscura y tierra reseca clara.
- Escala del follaje: se contrae levemente (0.92×–1×) cuando la salud baja, sugiriendo hojas caídas.

La carita de la maceta se mantiene siempre feliz — es un rasgo de diseño explícito del brief original, no una variable de estado.

## Skills Utilizadas
| Skill | Cómo se usó |
|-------|------------|
| `ui-ux-pro-max` | Guía para el layout mobile-first del dashboard y la paleta cálida |
| `run` | Levantar la app real y verificar que la escena 3D renderiza sin errores antes de cerrar la feature |

## Restricciones
- No se agregó `@react-three/fiber` ni otras libs de React+3D no solicitadas — se usa `three` puro con un `useEffect` imperativo, igual que hacía el Artifact original (Mandamiento I).
- La cara de la planta no cambia de expresión (ver arriba) — se preserva el diseño pedido explícitamente en el brief inicial.
- Sin export OBJ/GLB ni toolbar de descarga (existían en el Artifact original pero no fueron pedidos para el dashboard).

## Pendiente
- [ ] Reemplazar `useSimulatedPlantHealth` por datos reales cuando exista la feature `sensores`
- [ ] Decidir con el usuario qué hacer con `src/Potus 3D.html`

## Notas de implementación
- Verificado con Playwright headless contra la app real (login real + dashboard): el canvas renderiza el modelo completo (maceta, carita, follaje) sin errores de consola. Se encontró y corrigió una deprecación real: `THREE.PCFSoftShadowMap` está deprecado en `three@0.185`, reemplazado por `THREE.VSMShadowMap` (mismo efecto de sombra suave buscado por el diseño original).
- Se verificó explícitamente que arrastrar el canvas rota la cámara (`OrbitControls`) y que `autoRotate` se desactiva tras el primer gesto del usuario, igual que en el Artifact original.
- Three.js no trae tipos propios en esta versión — se agregó `@types/three` como dependencia de desarrollo.
