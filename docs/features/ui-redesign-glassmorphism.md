# Feature: Rediseño Glassmorphic 3D del Dashboard

> **Estado:** Implementado
> **Archivos clave:** `src/app/page.tsx`, `src/components/features/SensorPanel/**`, `src/components/features/WeeklyGoal/**`, `src/components/features/PlantAvatar/Plant3DViewer.tsx`, `src/constants/orbs.ts`, `src/lib/orbColor.ts`, `src/app/globals.css`
> **Dependencias:** ninguna nueva (SVG + Tailwind v4)
> **Skill utilizada:** `ui-ux-pro-max`

---

## Descripción

Rediseño integral del dashboard para pasar de un layout de tarjetas rectangulares a una interfaz **inmersiva, oscura y con estética "Glassmorphic 3D"**. La planta 3D pasa a ser el foco central del viewport, y las cuatro métricas ya no son tarjetas apiladas bajo ella: se convierten en **widgets circulares volumétricos (orbes de cristal esmerilado)** que orbitan alrededor del modelo 3D, semi-transparentes, con la planta visible a través de ellos.

## Objetivo

Dar el "efecto Tamagotchi" inmersivo pedido en el brief original, llevado al extremo visual: en vez de un dashboard funcional con tarjetas, una *escena* donde la planta vive rodeada de esferas de vidrio que reflejan/muestran su estado. El vidrio translúcido con `backdrop-blur` deja ver la planta por detrás, y el resplandor interno de cada orbe cambia de color según el estado de su métrica.

## Paleta de colores

| Rol | Color | Descripción |
|-----|-------|-------------|
| Fondo principal | `#1a1d21` (gris carbón) | Fondo de la app, con neblina volumétrica sutil por radial-gradients |
| Superficies de vidrio | `rgba(255,255,255,0.06)` + blur | Paneles/orbes esmerilados |
| Borde de vidrio | `rgba(255,255,255,0.14)` | Hairline de los orbes/paneles |
| Texto primario | `#e8eaed` (gris frío claro) | Títulos y valores legibles sobre el fondo oscuro |
| Texto secundario | `#9aa0a8` | Subtítulos, unidades, hints |
| Planta | Verde original (sin tinte) | Se preserva la paleta del modelo; las luces coloreadas de los orbes la bañan |

### Códigos de color dinámicos de los orbes (`src/constants/orbs.ts`)

Accent base de cada métrica, y el resplandor **interpola** desde ese tono hacia `#facc15` (ámbar) y luego `#ef4444` (rojo) conforme la métrica se aleja de su rango óptimo (`orbColorFor` en `src/lib/orbColor.ts`).

| Métrica | Accent base | Posición orbital |
|---------|-------------|------------------|
| Humedad del sustrato (Agua) | `#38bdf8` Cian/Azul | Arriba |
| Luz (Dorado) | `#fbbf24` Dorado/Amarillo | Derecha |
| Humedad ambiente (Ambiente) | `#2dd4bf` Teal/Verde menta | Izquierda |
| Temperatura (crítica) | `#fb923c` Naranja/Rojo | Abajo |

## Arquitectura del cambio

### Posicionamiento (`src/app/page.tsx`)
La página pasa de `flex-col` apilado a un layout de **escena inmersiva full-viewport**:
- Un contenedor `stage` con `position: relative` y `min-h-dvh`.
- `Plant3DViewer` ocupa el centro del stage y se escala para ser el foco.
- Los 4 orbes viven dentro de `SensorPanel`, posicionados **absolutamente** orbitando el centro (arriba / derecha / izquierda / abajo), como `pointer-events-none` para no bloquear el drag de órbita del modelo.
- La Meta Semanal (`WeeklyGoal`) es un **panel flotante glass** fijo en la parte superior derecha.
- Los gráficos históricos (`SensorCharts`) quedan al pie, por debajo del pliegue, rediseñados al tema oscuro.

### Componente de widget — `MetricOrb` (dentro de `SensorPanel`)
- Orbe circular volumétrico de vidrio esmerilado: fondo translúcido con `backdrop-blur`, borde hairline claro, y `box-shadow` de resplandor interno cuyo color es dinámico.
- **Anillo de progreso SVG** dentro del orbe: circunferencia con `stroke-dashoffset` proporcional al valor normalizado de la métrica (fracción del rango válido), repintado con el color dinámico.
- Centro del orbe: ícono (Lucide) + valor + unidad + label.
- **Semi-transparencia**: la planta se ve *detrás* del orbe, por diseño del vidrio esmerilado.

### Luces reflejadas en las hojas (`Plant3DViewer.tsx`)
Se agregaron **4 luces puntuales de color** alrededor del modelo (cian arriba, dorado a la derecha, teal a la izquierda, naranja abajo), de intensidad baja, para que las hojas de la planta reflejen los colores de los orbes y se integre la "neblina/luz volumétrica" de la escena.

## Componentes / Archivos
| Archivo | Responsabilidad |
|---------|----------------|
| `src/constants/orbs.ts` | Posición orbital (top/right/left/bottom) y color accent base por métrica |
| `src/lib/orbColor.ts` | `orbColorFor(metric, health)` → interpolación accent→ámbar→rojo; valor normalizado del progreso |
| `src/components/features/SensorPanel/MetricOrb.tsx` | Un orbe de cristal esmerilado con anillo de progreso SVG |
| `src/components/features/SensorPanel/SensorPanel.tsx` | Orquesta los 4 `MetricOrb`, posicionados orbitando la planta |
| `src/components/features/WeeklyGoal/**` | Panel flotante glass superior derecho |
| `src/components/features/PlantAvatar/Plant3DViewer.tsx` | Luces puntuales coloreadas para reflejar los orbes |
| `src/app/globals.css` | Tema oscuro carbón + utilidades `glass`/`orb` |
| `src/app/page.tsx` | Escena inmersiva (stage + orbes + meta flotante) |

## Responsividad
- Mobile-first: Juego `dvh` para el viewport; los orbes son compactos (`w-20 h-20` aprox.) y orbitan cerca de la planta, sin desbordar el ancho (`max-w-[min(92vw,...)]`).
- En pantallas medianas/grandes los orbes crecen (`sm:`/`md:`) y se alejan del centro.
- La meta semanal flotante conserva su panel glass en pantallas chicas (se apila arriba sin tapar la cara de la planta).

## Restricciones
- **Sin librerías nuevas**: el anillo de progreso es SVG puro (mandamiento I), sin `framer-motion` ni gráficos extra.
- El cambio es **estrictamente visual**: no toca lógica de datos, hooks, servicios ni APIs. Los props de `SensorPanel`, `WeeklyGoal` y `Plant3DViewer` no cambian de contrato.
- `DATAVIZ`: Se revalidó el color de los gráficos para fondo oscuro, pero los tokens de `src/constants/charts.ts` **no se tocan** (queda documentado que la paleta dataviz validada sigue siendo la fuente de verdad para los gráficos; los textos/marcos se oscurecieron a mano en los componentes). Si en el futuro se quieren colores distintos en los gráficos → re-correr el validador de la skill `dataviz`.

## Verificación
`npm run build` sin errores de TypeScript ni de lint (verificado en la implementación).