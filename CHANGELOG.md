# Changelog — Plant Tamagotchi

> Formato: [Semantic Versioning](https://semver.org/)
> Cada entrada incluye: fecha, tipo, archivos afectados, request original.

---

## [0.10.0] — 2026-08-12

### Changed — Rediseño Glassmorphic 3D inmersivo del dashboard

#### Archivos afectados
- `docs/features/ui-redesign-glassmorphism.md` — Doc de la feature (creado antes de codear)
- `src/app/globals.css` — Fondo gris carbón `#1a1d21`, utilidades `glass`, `fog` y `orb-body`
- `src/app/layout.tsx` — `themeColor` al carbón oscuro
- `src/app/page.tsx` — Reescrito como escena inmersiva: planta al centro, orbes orbitando, meta flotante
- `src/constants/orbs.ts` — Posición orbital y color accent base por métrica
- `src/lib/orbColor.ts` — `orbColorFor()` (interpolación accent→ámbar→rojo) y `orbRingProgress()`
- `src/components/features/SensorPanel/MetricOrb.tsx` — Orbe de cristal esmerilado con anillo de progreso SVG
- `src/components/features/SensorPanel/SensorPanel.tsx` — Orquesta los 4 `MetricOrb` orbitando la planta
- `src/components/features/WeeklyGoal/**` — Panel flotante glass superior derecho
- `src/components/features/PlantAvatar/Plant3DViewer.tsx` — 4 luces puntuales coloreadas que reflejan los orbes en las hojas
- `src/components/features/SensorCharts/**` — Gráficos y tabla adaptados al tema oscuro carbón
- `docs/02-architecture.md`, `docs/features/dashboard.md` — Estructura y mención del rediseño

### Descripción detallada
Se reescribió la piel visual del dashboard siguiendo la skill `ui-ux-pro-max`: de tarjetas rectangulares a una **escena glassmorphic 3D inmersiva**. El fondo pasa a gris carbón `#1a1d21` con neblina volumétrica (`fog`), y la planta 3D se vuelve el foco central del viewport.

Las cuatro métricas ya no son tarjetas bajo la planta: cada una es ahora un **orbe circular volumétrico de cristal esmerilado** (`MetricOrb`) que **orbita alrededor** del modelo 3D — Humedad de sustrato arriba (cian/azul `#38bdf8`), Luz a la derecha (dorado `#fbbf24`), Humedad ambiente a la izquierda (teal `#2dd4bf`) y Temperatura abajo (naranja `#fb923c`). Cada orbe tiene su propio fondo translúcido con `backdrop-blur` (la planta se ve a través), un **anillo de progreso SVG** proporcional al valor dentro del rango físico, y un `box-shadow` de resplandor interno cuyo color **interpola dinámicamente** desde el accent base del orbe hacia ámbar y luego rojo conforme la métrica se aleja de su rango óptimo (`orbColorFor`, usando `computeMetricHealth`).

La **Meta Semanal** pasó a ser un panel flotante *glass* en la parte superior derecha, y los gráficos históricos + la vista de tabla se adaptaron al fondo oscuro (marcos/textos re-expresados en tonos claros; la serie conserva el hue validado por `dataviz` — no se tocó `src/constants/charts.ts`).

En el modelo 3D se agregaron **4 luces puntuales coloreadas** (cian/dorado/teal/naranja) apuntando al follaje desde cada dirección orbital, para que las hojas reflejen los colores de los orbes y se integre la luz volumétrica de la escena.

### Decisiones / restricciones
- **Sin librerías nuevas**: el anillo de progreso es SVG puro (Mandamiento I). Sin `framer-motion` ni chart libs extra.
- Cambio **estrictamente visual**: no toca lógica de datos, hooks, servicios ni APIs. Los contratos de props de `SensorPanel`, `WeeklyGoal` y `Plant3DViewer` no cambiaron.
- **`dataviz`**: los gráficos preservan la paleta validada (`CHART_COLORS.series` intacto); solo las superficies/marcos se oscurecieron a mano en los componentes. No se re-corrió el validador porque no se cambió ningún hue de la paleta dataviz.

### Verificación
`npm run build` pasa sin errores de TypeScript ni de lint.

### Request original
> Reescribir el diseño del Dashboard (UI) para implementar una interfaz inmersiva, oscura y con estética "Glassmorphic 3D", centrando la planta y rodeándola de widgets circulares transparentes y flotantes, basándonos en la arquitectura de datos actual.

---

## [0.9.1] — 2026-08-12

### Fixed
- `.env.local` — `NEXT_PUBLIC_SUPABASE_URL` volvió a tener cargada la URL del dashboard web de Supabase (`supabase.com/dashboard/project/...`, 404 como API) en vez de la URL de API del proyecto. Ya se había corregido una vez en la `[0.3.0]`; se detectó de nuevo al arrancar la FASE 3 (deploy), antes de que se propagara a las variables de entorno de Vercel. Corregido a `https://jarawkubfruiiuonlysp.supabase.co` y verificado con `curl` directo contra la REST API.

### Changed
- `docs/DB_SCHEMA.md`, `TODO.md`, `docs/01-project-overview.md` — Las migraciones `0001` y `0002` quedaron marcadas como **aplicadas**: el usuario las corrió en el SQL Editor de Supabase. Verificado contra la REST API real (`sensor_readings` y `points_log` responden `200`) y contra el dev server real (`/api/sensors/latest` y `/api/points` ya no devuelven 500).

### Request original
> Ya ejecuté las migraciones 0001 y 0002 en Supabase. Ahora quiero pasar a la FASE 3 (Deploy en Vercel).

---

## [0.9.0] — 2026-08-12

### Added — PWA instalable

#### Archivos afectados
- `docs/features/pwa.md` — Doc de la feature
- `src/app/manifest.ts` — Web app manifest tipado (`MetadataRoute.Manifest`)
- `src/lib/appIcon.tsx` — Dibujo del ícono del Potus, compartido por las cinco rutas de ícono
- `src/app/icon.tsx`, `src/app/apple-icon.tsx` — Favicon 32×32 e ícono de iOS 180×180
- `src/app/icons/[variant]/route.tsx` — Íconos del manifest (192, 512, maskable)
- `public/sw.js` — Service worker
- `public/offline.html` — Pantalla de "sin conexión"
- `src/components/features/PWA/**` — Registro del service worker
- `src/app/layout.tsx` — Metadata real de la app, `theme-color`, `lang="es"`, `viewportFit`
- `src/proxy.ts` — Rutas de la PWA declaradas públicas
- `docs/03-security.md`, `docs/02-architecture.md` — Rutas públicas y estructura documentadas

### Descripción detallada
Se leyó la guía de PWA de Next.js 16 (`node_modules/next/dist/docs/01-app/02-guides/progressive-web-apps.md`) antes de codear, y eso cambió dos cosas respecto de lo anotado en el `TODO.md`:

**El manifest no es `public/manifest.json`** sino `src/app/manifest.ts`, que es la convención actual: Next lo sirve en `/manifest.webmanifest` y agrega el `<link rel="manifest">` solo. Al estar tipado, un campo mal escrito es un error de build en vez de un manifest silenciosamente inválido.

**Los íconos no son archivos binarios** sino dibujos generados con `ImageResponse` de `next/og` — un Potus estilizado (maceta terracota con carita feliz y tres hojas) hecho con divs, gradientes y `border-radius`, sin fuentes ni assets externos. No hay diseño visual definitivo todavía, y versionar PNGs generados a ojo significa cargar assets que después nadie sabe regenerar. Se generan en build y quedan cacheados estáticamente. La variante **maskable** lleva más padding para que Android pueda recortarla con la forma del launcher sin comerse las hojas.

El **service worker** es chico a propósito, sin Serwist ni ninguna librería: solo intercepta `GET`, **nunca cachea `/api/*`** (cachear lecturas de sensores mostraría datos viejos como actuales, y esas respuestas van detrás de la cookie de sesión), navegaciones network-first con `/offline.html` de fallback, y cache-first solo para lo inmutable (`/_next/static/*` e íconos). Se registra únicamente en producción: un service worker cacheando durante `next dev` produce el tipo de bug fantasma que hace perder una tarde.

**No se implementaron notificaciones push.** La guía de Next les dedica la mitad del texto (VAPID, `web-push`, Server Actions de suscripción), pero nadie las pidió, requieren claves nuevas y una tabla para persistir suscripciones. Mandamiento I.

### Fixed
- `src/app/layout.tsx` tenía todavía el metadata del scaffolding (`title: "Create Next App"`, `description: "Generated by create next app"`) y `lang="en"` en una app enteramente en español.
- Se eliminó `src/app/favicon.ico`, que seguía siendo el logo de Next.js del `create-next-app`. Los navegadores lo prefieren sobre `/icon`, así que la pestaña mostraba el logo de Next en vez de la planta.
- `src/hooks/useSensorData.ts`, `usePoints.ts`, `useSensorHistory.ts` — Tres errores de la regla `react-hooks/set-state-in-effect`, arrastrados desde las features `sensores`, `puntos` y `graficos`. **Next.js 16 ya no corre ESLint durante `next build`**, así que los builds anteriores pasaban en verde con estos errores presentes: se detectaron recién al correr `npm run lint` explícitamente en la validación final. La carga inicial de cada hook se encola con `queueMicrotask`, igual que ya hacía el intervalo de polling, para que las actualizaciones de estado queden siempre en una continuación y no en el cuerpo del efecto.

### Verificación
`npm run build` pasa sin errores (17 páginas; los tres íconos del manifest se prerenderizan como SSG).

Verificado además contra el server de producción real (`next start`), no solo con el build:
- Los tres PNG generados se abrieron y se miraron: la planta se dibuja bien en la variante normal y la maskable respeta el círculo seguro.
- `/manifest.webmanifest`, `/sw.js`, `/offline.html`, `/icons/192`, `/icons/512`, `/icons/maskable`, `/icon` y `/apple-icon` responden **200** con el `Content-Type` correcto (`application/manifest+json`, `image/png`, etc.).
- `/` sigue devolviendo **307** hacia `/login`: abrir las rutas de la PWA no abrió el dashboard.
- El `<head>` emite `<link rel="manifest">`, `theme-color`, `mobile-web-app-capable`, `apple-mobile-web-app-title` y los dos `<link rel="icon">` correctos.

Queda sin verificar la instalación real en un celular, que necesita HTTPS y por lo tanto el deploy.

### Request original
> Para CADA funcionalidad (sensores, simulador-esp32, puntos, graficos, confeti, pwa): [...]

---

## [0.8.0] — 2026-08-12

### Added — Confeti al alcanzar y reclamar el premio

#### Archivos afectados
- `docs/features/confeti.md` — Doc de la feature
- `src/constants/confetti.ts` — Colores y forma de cada ráfaga
- `src/lib/confetti.ts` — `fireCelebration(kind)`, con import dinámico y guarda de `prefers-reduced-motion`
- `src/hooks/useCelebration.ts` — Detecta el cruce de la meta
- `src/app/page.tsx` — Encadena el reclamo con el confeti

### Descripción detallada
Dos momentos, no uno: una ráfaga corta cuando la semana **cruza** los 700 puntos con el dashboard abierto, y una larga (ráfaga central + cañones laterales durante ~2,5 s) cuando el reclamo del premio vuelve OK del servidor.

El "alcanzar" se dispara solo en la **transición** `false → true`, no al montar. Si festejara el estado en vez del cruce, el confeti saldría en cada refresh hasta el lunes siguiente y dejaría de ser una celebración.

Tres decisiones que valen la pena anotar:
- **`prefers-reduced-motion` corta todo.** Una lluvia de partículas a pantalla completa es exactamente lo que esa preferencia existe para evitar.
- **El confeti nunca es la confirmación.** Va después de que el `POST /api/points/claim` respondió OK, y sus errores se tragan: que no cargue una librería de animación no puede impedir que la usuaria cobre el premio. Quien confirma es el texto del componente `WeeklyGoal`.
- **Import dinámico.** `canvas-confetti` se carga con `await import(...)` en el momento de usarla, para no sumarla al bundle inicial de un dashboard que ya arrastra three.js y recharts.

### Verificación
`npm run build` pasa sin errores de TypeScript ni de lint. La animación en sí no se pudo probar en el navegador: para llegar al estado que la dispara hacen falta 700 puntos de una semana, y los puntos dependen de las migraciones `0001` y `0002`, todavía sin aplicar.

### Request original
> Para CADA funcionalidad (sensores, simulador-esp32, puntos, graficos, confeti, pwa): [...]

---

## [0.7.0] — 2026-08-12

### Added — Gráficos históricos de sensores

#### Archivos afectados
- `docs/features/graficos.md` — Doc de la feature, con las decisiones de diseño y la salida del validador
- `src/constants/charts.ts` — Tokens de color validados, specs de marcas y definición de rangos
- `src/types/history.types.ts` — Tipos del histórico
- `src/lib/history.ts` — Lógica pura: lecturas → buckets promediados, formateo de ejes
- `src/app/api/sensors/history/route.ts` — `GET`, histórico agregado, detrás de la cookie de sesión
- `src/hooks/useSensorHistory.ts` — Fetch por rango, sin skeleton en el refetch
- `src/components/features/SensorCharts/**` — Fila de filtros, 4 gráficos y vista de tabla
- `src/app/page.tsx` — Los gráficos entran al dashboard
- `docs/API_DOCS.md`, `docs/02-architecture.md` — Endpoint y estructura actualizados
- `package.json` — Nueva dependencia: `recharts`

### Descripción detallada
Se eligió **recharts** (el usuario dejó abierta la opción entre recharts y Chart.js): es declarativo en JSX, así que las decisiones de diseño quedan legibles en el componente en vez de escondidas en un objeto de configuración, no necesita manejar un `<canvas>` a mano, y trae `ReferenceArea`, que es justo lo que hace falta para pintar la zona óptima de cada métrica.

Se siguió la skill `dataviz` en orden — forma, color, validación, marcas, interacción, accesibilidad — y eso cambió el diseño en dos puntos concretos:

**Forma:** las cuatro métricas tienen unidades y escalas distintas (%, %, °C, %). Meterlas en un solo gráfico habría exigido dos ejes Y, que es el anti-patrón principal del catálogo (la alineación entre escalas es arbitraria e inventa correlaciones). Son cuatro gráficos chicos apilados, cada uno con su eje, lo que además calza natural en mobile.

**Color:** la idea inicial era un hue por métrica, a juego con los íconos del `SensorPanel`. El validador de la skill lo rechazó: `#eda100` (amarillo) vs `#eb6834` (naranja) da ΔE 13.7 a visión normal, debajo del piso de 15, y small multiples es una forma *all-pairs* con tope de tres colores. Se resolvió usando **un solo hue para las cuatro líneas** (`#2a78d6`, que pasa todos los checks con 4.13:1 de contraste): cada gráfico tiene una sola serie, así que la identidad la carga el título de la tarjeta, no el color.

Detrás de cada línea va la **banda del rango óptimo** leída de `SENSOR_RANGES` — la misma constante que usan la salud de la planta y el cálculo de puntos. Responde de un vistazo la pregunta que importa: *¿estuvo dentro o fuera?*

El endpoint **promedia por buckets** (1 h / 4 h / 1 día según el rango) en vez de devolver las ~720 lecturas crudas de 30 días. Los buckets sin datos vuelven en `null` y la línea se corta ahí: rellenarlos con una interpolación sería inventar mediciones.

También se agregó una **vista de tabla** como gemela accesible, para que ningún valor quede disponible solo por hover, y el refetch mantiene el render anterior atenuado en vez de mostrar un skeleton (evita el salto de layout al cambiar de rango).

### Verificación
`npm run build` pasa sin errores de TypeScript ni de lint (11 rutas, incluida `/api/sensors/history`). La paleta se validó corriendo el script de la skill, no a ojo — la salida de ambas corridas (la que falló y la que pasa) quedó transcrita en `docs/features/graficos.md`.

**No se pudo hacer la verificación visual en el navegador:** los gráficos dependen de la migración `0001`, que sigue sin aplicar, así que la única pantalla posible hoy es el estado de error. Queda pendiente mirarlos con datos reales después de correr las migraciones.

### Request original
> Para la feature 6 (gráficos): Usa 'recharts' o 'Chart.js' (con react-chartjs-2) instalando la librería automáticamente.

---

## [0.6.0] — 2026-08-12

### Added — Sistema de puntos y meta semanal

#### Archivos afectados
- `docs/features/puntos.md` — Doc de la feature, con el esquema de puntaje completo
- `supabase/migrations/0002_points.sql` — Tablas `points_log` y `weekly_goals` + índice + RLS
- `src/constants/points.ts` — Máximos y umbrales por métrica, meta diaria (100) y semanal (700)
- `src/types/points.types.ts` — Tipos de la respuesta de `/api/points` y de las filas de DB
- `src/lib/points.ts` — Lógica pura: `computeDailyPoints()`, `getWeekStart()`, `groupReadingsByDay()`
- `src/services/points.service.ts` — `saveDailyPoints()` (upsert), `getOrCreateWeeklyGoal()`, `claimWeeklyGoal()`
- `src/app/api/points/route.ts` — `GET`, recalcula la semana y devuelve el progreso
- `src/app/api/points/claim/route.ts` — `POST`, reclama el premio de la semana
- `src/hooks/usePoints.ts` — Estado del progreso + acción de reclamo
- `src/components/features/WeeklyGoal/**` — Barra de progreso y botón de reclamo
- `src/app/page.tsx` — La barra de meta semanal entra al dashboard
- `docs/DB_SCHEMA.md`, `docs/API_DOCS.md`, `docs/02-architecture.md` — Tablas y endpoints documentados

### Descripción detallada
El usuario delegó explícitamente el diseño del esquema de puntaje ("Define tú mismo un esquema de puntos lógico... enfocado a llegar a 700 pts a la semana"). El que quedó: **100 pts/día × 7 días = 700 pts/semana**, repartidos por métrica según cuánto depende de la persona que cuida la planta — humedad del sustrato 50 pts (es lo que se riega), luz 25 pts (es dónde se la pone), temperatura 15 pts y humedad ambiente 10 pts (dependen más del ambiente que del cuidado).

Cada métrica cobra en proporción a la fracción del día que pasó en su rango óptimo, **saturando en un umbral menor a 1**: la humedad del sustrato paga los 50 pts completos con estar bien el 80 % del día, la luz con el 60 %. Sin ese umbral, los 700 semanales exigirían perfección absoluta y la meta sería inalcanzable; con él, cuidar bien la planta alcanza. Un día sin lecturas puntúa 0 (no se regalan puntos por falta de datos).

`points_log` es una tabla **derivada**: se reconstruye entera desde `sensor_readings`, y el endpoint recalcula la semana en curso en cada request. Lo único que no se puede derivar de los sensores es si el premio ya se reclamó, y eso vive en `weekly_goals.claimed_at`.

El reclamo se verifica **de nuevo en el servidor** antes de marcarse: el cliente puede pedir el reclamo, pero es el endpoint el que recalcula los puntos de la semana y devuelve 400 `goal_not_reached` si no llega. El update filtra por `claimed_at is null`, así que reclamar dos veces no pisa la marca de tiempo original.

### Verificación
`npm run build` pasa sin errores de TypeScript ni de lint (10 rutas generadas, incluidas `/api/points` y `/api/points/claim`).

### ⚠️ Pendiente de acción manual
Igual que la `0001`, la migración `0002` **no está aplicada** — no hay CLI de Supabase ni connection string en el entorno. Hasta correrla a mano desde el SQL Editor, `/api/points` devuelve 500 y la barra de meta semanal no se muestra.

### Request original
> Para la feature 5 (puntos): Define tú mismo un esquema de puntos lógico (ej: +50 pts por día en rango óptimo de humedad/luz) enfocado a llegar a 700 pts a la semana.

---

## [0.5.0] — 2026-08-12

### Added — Simulador del ESP32

#### Archivos afectados
- `docs/features/simulador-esp32.md` — Doc de la feature
- `scripts/simulate-esp32.ts` — Script CLI que genera lecturas y las postea a `/api/sensors/ingest`
- `package.json` — Script `simulate` + dependencia de desarrollo `tsx`

### Descripción detallada
Permite desarrollar el dashboard, los puntos y los gráficos sin tener el ESP32 armado. Soporta escenarios (`healthy`, `thirsty`, `dark`, `cold`, `random`), modo continuo (`--watch`) y sembrado de historial (`--seed-days 7`, una lectura por hora). El sembrado modela un ciclo día/noche en la métrica de luz para que los gráficos históricos no se vean como ruido plano.

Es un script standalone que no importa nada de `src/`: usa el mismo endpoint HTTP y la misma credencial (`ESP32_INGEST_SECRET`) que va a usar el dispositivo real, así ejercita exactamente el mismo camino.

### Verificación
Probado contra el server de dev: el rechazo por secret inválido devuelve 401 como corresponde, un escenario inexistente da un mensaje claro con las opciones válidas, y correrlo sin `ESP32_INGEST_SECRET` aborta con un aviso en vez de mandar un request condenado a fallar. El POST exitoso todavía no se pudo verificar porque depende de la migración `0001` (ver abajo).

---

## [0.4.0] — 2026-08-12

### Added — Sensores: ingesta y lectura de datos reales

#### Archivos afectados
- `docs/features/sensores.md` — Doc de la feature (creado antes de codear)
- `supabase/migrations/0001_sensor_readings.sql` — Tabla `sensor_readings`, índice por `recorded_at`, RLS activado sin políticas
- `src/lib/supabase.ts` — Cliente de service role, con `server-only` para que no pueda importarse desde el browser
- `src/lib/plantHealth.ts` — `computePlantHealth()`: lectura → salud 0–1, promedio ponderado (la humedad del sustrato pesa doble)
- `src/lib/apiAuth.ts` — `requireSession()` y `requireIngestSecret()`
- `src/constants/sensors.ts` — Rangos óptimos, rangos físicos válidos, tolerancias y pesos por métrica
- `src/types/sensor.types.ts`, `src/services/sensor.service.ts`
- `src/app/api/sensors/ingest/route.ts` — `POST`, valida el secret del ESP32 y el rango de cada métrica
- `src/app/api/sensors/latest/route.ts` — `GET`, última lectura + salud, detrás de la cookie de sesión
- `src/hooks/useSensorData.ts` — Polling cada 30 s de `/api/sensors/latest`
- `src/components/features/SensorPanel/**` — Grilla de métricas bajo la planta
- `src/app/page.tsx` — El dashboard ahora consume datos reales
- `src/hooks/useSimulatedPlantHealth.ts` — **Eliminado** (reemplazado por `useSensorData`)
- `docs/DB_SCHEMA.md`, `docs/API_DOCS.md` — Documentados la tabla y los dos endpoints
- `package.json` — Nueva dependencia: `server-only`

### Descripción detallada
La planta 3D deja de reaccionar a un valor aleatorio y pasa a reaccionar a lecturas reales guardadas en Supabase. La prop `health` del viewer no cambió: solo cambió de dónde sale el número, tal como estaba previsto al construir el dashboard.

Decisión de seguridad relevante: la tabla lleva RLS **activado y sin políticas**. Como la app no usa Supabase Auth (ADR-002), no hay `auth.uid()` con el que escribir políticas por usuario; sin políticas, la `anon key` (que es pública por diseño) no puede tocar la tabla. Todo el acceso pasa por route handlers server-side con la service role key, detrás de la cookie de sesión o del `ESP32_INGEST_SECRET`. La autorización vive en la capa de API, y está documentado así en `DB_SCHEMA.md` para que no se lea como un olvido.

El endpoint de ingesta no confía en el dispositivo: valida que cada métrica sea un número finito dentro de su rango físico plausible antes de insertar.

### ⚠️ Pendiente de acción manual
La migración `0001` **no está aplicada** — se verificó contra el proyecto real que la tabla `sensor_readings` todavía no existe (404). No hay CLI de Supabase ni connection string de Postgres en el entorno, así que hay que correrla a mano desde el SQL Editor de Supabase. Hasta entonces, `/api/sensors/latest` devuelve 500 y el dashboard muestra el aviso de error (la planta se sigue dibujando, con salud por defecto).

### Request original
> Ejecutar secuencialmente todas las features pendientes del TODO.md (desde la 3 hasta la 8) respetando el Método AInnovate.

---

## [0.3.0] — 2026-08-12

### Added — Dashboard: planta 3D interactiva

#### Archivos afectados
- `docs/features/dashboard.md` — Documento de la feature (creado antes de codear, estado Completo)
- `src/components/features/PlantAvatar/plantModel.ts` — Geometría procedural del Potus (maceta, carita, follaje) portada a TypeScript, más `applyPlantHealth()` para reaccionar a datos
- `src/components/features/PlantAvatar/Plant3DViewer.tsx` — Componente cliente: escena three.js completa (renderer, cámara, luces, `OrbitControls`, resize, loop de render)
- `src/components/features/PlantAvatar/Plant3DViewer.types.ts`, `index.ts`
- `src/hooks/useSimulatedPlantHealth.ts` — Hook placeholder: salud de planta simulada (0–1) hasta que exista la feature `sensores`
- `src/app/page.tsx` — Reemplazado el starter de Next.js por el dashboard real, con el viewer 3D centrado
- `package.json` — Nuevas dependencias: `three`, `@types/three` (dev)
- `docs/02-architecture.md` — Estructura actualizada con `PlantAvatar/` y el hook nuevo
- `.env.local` — Corregido `NEXT_PUBLIC_SUPABASE_URL` (tenía la URL del dashboard web de Supabase, no la URL de API del proyecto)

### Descripción detallada
El usuario proveyó `src/Potus 3D.html`, un archivo exportado desde un Artifact de Claude (formato "bundle" con assets comprimidos en gzip+base64). Se extrajo el código fuente real descomprimiendo el manifest con `zlib.gunzipSync` — la escena es three.js 100% procedural (sin texturas ni GLTF externos), así que se portó case por caso a TypeScript sin traer ningún asset binario. Se agregó `applyPlantHealth()` para que el modelo reaccione a un valor de salud (0–1): tinte de hojas y tierra, y una leve contracción del follaje cuando la salud baja — la carita se mantiene siempre feliz, tal como se pidió explícitamente en el brief original del proyecto.

Verificado con Playwright headless contra la app real (no solo build/lint): login real, canvas renderizando el modelo completo sin errores de consola, drag-to-orbit confirmado (rota la cámara), y `autoRotate` desactivándose correctamente tras el primer gesto del usuario. Se encontró y corrigió una deprecación real de three.js en el proceso (`PCFSoftShadowMap` → `VSMShadowMap`).

### Fixed
- `.env.local` — `NEXT_PUBLIC_SUPABASE_URL` tenía cargada la URL del dashboard web de Supabase (`supabase.com/dashboard/project/...`) en vez de la URL de API del proyecto (`https://jarawkubfruiiuonlysp.supabase.co`, derivada del `ref` del propio JWT del anon key). No bloqueaba esta feature pero iba a bloquear `sensores`.

### Request original
> Guardé el archivo HTML descargado del modelo 3D como 'planta3d.html'... lee ese archivo, analiza su código (Three.js/WebGL/SVG/Canvas) y transfórmalo en un componente de React/Next.js... Luego, intégralo en el Dashboard mobile-first para que la planta aparezca en el centro de la pantalla, se pueda rotar en 360° y reaccione a los datos simulados. Sigue el flujo de la Fase 2 del Método AInnovate.

---

## [0.2.0] — 2026-08-12

### Added — Autenticación simple por contraseña

#### Archivos afectados
- `docs/features/auth.md` — Documento de la feature (creado antes de codear, estado Completo)
- `src/lib/session.ts` — Firma y verificación de tokens de sesión (HMAC-SHA256 vía Web Crypto)
- `src/constants/auth.ts` — Nombre de cookie y duración de sesión
- `src/types/auth.types.ts` — Tipos del request/response de login
- `src/app/api/auth/login/route.ts` — `POST /api/auth/login`
- `src/app/login/page.tsx` — Pantalla de login
- `src/proxy.ts` — Protege todas las rutas del dashboard salvo `/login` y `/api/*` (creado como `middleware.ts` y renombrado a `proxy.ts` por la deprecación de esa convención en Next.js 16)
- `docs/API_DOCS.md` — Documentado `POST /api/auth/login` con requests/responses reales
- `docs/03-security.md` — Agregado detalle del esquema de token de sesión
- `docs/02-architecture.md` — Estructura de carpetas actualizada con `src/proxy.ts` y `src/app/login/`
- `TODO.md` — Feature de auth marcada como completada

### Fixed
- `src/lib/session.ts` — `verifySessionToken()` no capturaba errores de `atob()` al decodificar una cookie con base64 corrupto o manipulado, lo que crasheaba el proxy con un 500 en vez de tratar la cookie como sesión inválida. Detectado probando manualmente con una cookie manipulada antes de cerrar la feature.

### Descripción detallada
Implementado el gate de acceso único de la app: página `/login`, endpoint que valida `APP_PASSWORD` y emite una cookie de sesión firmada (sin librerías nuevas, usando la Web Crypto API nativa), y un proxy que protege todas las rutas del dashboard. Sin tabla de usuarios ni Supabase Auth (ADR-002). Probado manualmente de punta a punta con `curl`: acceso sin sesión, contraseña incorrecta, contraseña correcta, acceso con sesión válida, y acceso con cookie manipulada.

Se detectó (pero no se corrigió, por estar fuera del alcance de esta feature) que `NEXT_PUBLIC_SUPABASE_URL` en `.env.local` tiene cargada una publishable key en vez de la URL del proyecto — queda anotado en `TODO.md`.

### Request original
> Vamos por un features: Página `/login` con input de contraseña, `POST /api/auth/login` valida contra `APP_PASSWORD` y emite cookie de sesión firmada, Middleware que protege el dashboard, Doc: `docs/features/auth.md`. (aclaracion) Ya tienes los env de supabase conectados y tambien necesito que estes conectado al proyecto de github.

---

## [0.1.0] — 2026-08-11

### Added — Setup Inicial (Método AInnovate)

#### Archivos afectados
- `docs/01-project-overview.md` — Visión, objetivos, stack y estado del proyecto
- `docs/02-architecture.md` — Estructura de carpetas, flujo de datos, variables de entorno, ADRs
- `docs/03-security.md` — Modelo de autenticación por contraseña única y reglas de credenciales
- `docs/04-deployment.md` — Checklist de deploy en Vercel (pendiente de ejecutar)
- `docs/DB_SCHEMA.md` — Template de esquema, sin tablas creadas aún
- `docs/API_DOCS.md` — Template de endpoints planeados, sin implementar aún
- `docs/SKILLS.md` — Registro de skills de Claude Code relevantes al proyecto
- `docs/features/.gitkeep` — Carpeta lista para docs de features (FASE 2)
- `.windsurfrules`, `.cursorrules`, `.clinerules` — Reglas para IA (formato comentarios)
- `CLAUDE.md`, `.github/copilot-instructions.md` — Reglas para IA (formato Markdown)
- `.aider.conf.yml` — Reglas para IA (formato YAML)
- `package.json` y estructura Next.js — Proyecto inicializado con `create-next-app` (App Router, TypeScript, Tailwind CSS v4, ESLint, `src/`)
- `src/components/{ui,layout,features}`, `src/lib`, `src/hooks`, `src/types`, `src/constants`, `src/services` — Estructura de carpetas del código
- `scripts/` — Carpeta para el futuro script de simulación del ESP32
- `supabase/migrations/` — Carpeta para futuras migraciones SQL
- `.env.example` — Variables de entorno documentadas (sin valores reales)
- `.env.local` — Variables de entorno de desarrollo (contraseña `planta2026`, secrets generados; Supabase pendiente de configurar)
- `.gitignore` — Ajustado con excepción `!.env.example` para que sí se versione
- `TODO.md` — Roadmap de FASE 2 en adelante

### Dependencias instaladas
- `next`, `react`, `react-dom` (base de `create-next-app`)
- `@supabase/supabase-js` — cliente de base de datos
- `lucide-react` — iconografía
- `canvas-confetti` (+ `@types/canvas-confetti`) — animación de confeti

### Descripción detallada
Inicialización completa del proyecto siguiendo la FASE 1 del Método AInnovate: documentación base, reglas para todos los IDEs con IA, y scaffolding del proyecto Next.js con el stack acordado. Se resolvió una ambigüedad en el stack original (SQLite + Prisma vs. Supabase + Vercel) consultando al usuario, quien eligió usar el cliente de Supabase directamente sin ORM (ver ADR-001 en `docs/02-architecture.md`). No se implementó código de features todavía (auth, sensores, puntos, PWA, simulador) — quedan documentadas como pendientes en `TODO.md` para la FASE 2, a la espera además del diseño visual del usuario para el dashboard principal.

### Request original
> Lee el archivo METODO_AINNOVATE.md completo y sigue las instrucciones de la FASE 1 para inicializar el proyecto. [...] Por favor, ejecuta la FASE 1: crea la carpeta docs/, genera todos los archivos de reglas (CLAUDE.md, .windsurfrules, etc.), inicializa el proyecto y deja listo el archivo TODO.md para empezar.
