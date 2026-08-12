# Feature: Gráficos históricos de sensores

> **Estado:** Completo
> **Archivos clave:** `src/components/features/SensorCharts/**`, `src/app/api/sensors/history/route.ts`, `src/lib/history.ts`, `src/constants/charts.ts`
> **Dependencias nuevas:** `recharts`

---

## Descripción
Muestra la evolución en el tiempo de las cuatro métricas del sensor (humedad del sustrato, luz, temperatura, humedad ambiente), con la zona óptima marcada de fondo, para poder ver *por qué* la planta está como está y no solo *cómo* está ahora.

## Objetivo
Cerrar el bucle entre lo que muestra la carita de la planta, los puntos de la semana y lo que efectivamente midió el sensor. Si la planta bajó de salud o la semana no llegó a los 700 pts, el gráfico dice cuándo y en qué métrica.

## Librería elegida: `recharts`
El usuario dejó la elección entre `recharts` y `Chart.js` + `react-chartjs-2`. Se eligió **recharts** porque:
- Es declarativo en JSX (`<LineChart><Line/></LineChart>`), o sea que las decisiones de diseño quedan legibles en el componente y no escondidas en un objeto de configuración.
- No necesita `ref` a un `<canvas>` ni un ciclo de vida manual; renderiza SVG, que escala solo en un layout responsive.
- Trae `ReferenceArea`, que es exactamente lo que hace falta para pintar la zona óptima de cada métrica.

Contra: es más pesada que Chart.js y solo corre en cliente (los componentes van con `'use client'`). Aceptable acá: el dashboard entero ya es cliente por el viewer 3D.

---

## Decisiones de diseño (skill `dataviz`)

Se siguió el procedimiento de la skill `dataviz` en orden: forma → color → **validación con script** → marcas → interacción → accesibilidad.

### 1. Forma: small multiples, un gráfico por métrica
Las cuatro métricas tienen escalas y unidades distintas (%, %, °C, %). Ponerlas en un solo gráfico exigiría **dos ejes Y**, que es el anti-patrón principal del catálogo: la alineación entre las dos escalas es arbitraria e inventa correlaciones que no están en los datos.

Por eso: **cuatro gráficos de línea chicos, apilados**, cada uno con su propio eje. Además calza natural con el layout mobile-first — una tarjeta por métrica, una debajo de la otra.

### 2. Color: un solo hue para todas las líneas
Cada gráfico tiene **una sola serie**, así que el color no carga ninguna identidad: el título de la tarjeta dice qué métrica es. Todas las líneas usan el mismo azul `#2a78d6`.

Se evaluó darle un hue propio a cada métrica (azul/amarillo/naranja/aqua, a juego con los íconos del `SensorPanel`) y **el validador lo rechazó**:

```
$ node scripts/validate_palette.js "#2a78d6,#eb6834,#1baf7a,#eda100" --mode light --surface "#ffffff" --pairs all
  [FAIL] Normal-vision floor  worst all-pairs #eda100↔#1baf7a ΔE 13.7 (normal) — below 15
  [WARN] Contrast vs surface  below 3:1: [["#1baf7a",2.82],["#eda100",2.17]]
  → FAILED
```

Small multiples es una forma *all-pairs* (el ojo compara paneles que nunca están pegados), y ahí el tope son 3 slots: el cuarto pone amarillo y naranja en pantalla juntos y esa pareja no llega al piso de 15. Con un solo hue:

```
$ node scripts/validate_palette.js "#2a78d6" --mode light --surface "#ffffff"
  → ALL CHECKS PASS   (contraste 4.13:1 sobre blanco)
```

Cada tarjeta lleva el mismo ícono de lucide que el `SensorPanel` (gota / sol / termómetro / viento) pero en **tinta apagada, sin color**: en esta sección el color está reservado para la marca de datos y la banda óptima. El ícono aporta forma, que es redundante con el título — no necesita hue.

### 3. Zona óptima como banda de referencia
Detrás de cada línea va un `ReferenceArea` con el rango óptimo de esa métrica, leído de `SENSOR_RANGES` (`src/constants/sensors.ts`) — la misma constante que usan la salud de la planta y el cálculo de puntos. Es un lavado verde muy tenue, sin borde: es contexto, no una serie. Así el gráfico responde de un vistazo la única pregunta que importa: *¿estuvo dentro o fuera?*

### 4. Marcas
| Elemento | Spec |
|----------|------|
| Línea | 2 px, `strokeLinecap`/`strokeLinejoin` redondos, sin punto por dato |
| Punto final | r=4 (8 px) con anillo de 2 px del color de la superficie |
| Etiqueta directa | **solo el valor actual**, en el encabezado de la tarjeta, nunca un número por punto |
| Grilla | hairline sólida `#e1e0d9` (nunca punteada), solo horizontal |
| Eje / baseline | `#c3c2b7`, ticks en `#898781` con `tabular-nums` |
| Texto | siempre en tokens de tinta, nunca del color de la serie |

La etiqueta del último valor va **en el encabezado de la tarjeta**, no pegada al punto final: en un ancho de celular, un número al borde derecho del área de dibujo se recorta, y "una etiqueta recortada por su propia marca" es un anti-patrón explícito. El punto final igual queda marcado con el `ReferenceDot`, así se ve dónde termina la serie, y el valor exacto de cada punto sigue disponible en el tooltip y en la vista de tabla.

### 5. Interacción
- **Tooltip con crosshair** en cada gráfico (por defecto en formas de línea).
- **Una sola fila de filtros arriba de los cuatro gráficos** — nunca un filtro por tarjeta. Cambiar el rango re-renderiza los cuatro contra la misma porción de datos.
- Al recargar, se **mantiene el render anterior al 50 % de opacidad** en vez de mostrar un skeleton, para que no haya salto de layout.

### 6. Accesibilidad
- Una sola serie por gráfico ⇒ **sin leyenda** (una leyenda de un solo swatch repite el título y gasta lugar).
- **Vista de tabla** como gemela: el toggle "Ver tabla" reemplaza los cuatro gráficos por una tabla con todas las lecturas del rango. Ningún valor queda accesible solo por hover.
- El contenedor de cada gráfico incluye la banda del eje X en su alto, así la tarjeta no genera un scroll vertical interno.
- **Modo oscuro:** no se implementó, deliberadamente. La app es light-only (el dashboard fija `bg-green-50`); agregarle modo oscuro solo a los gráficos sería inconsistente con el resto. Si alguna vez la app entera adopta modo oscuro, hay que re-validar la paleta contra la superficie oscura.

---

## Modelo de Datos
**No agrega tablas ni migraciones.** Lee de `sensor_readings` (migración `0001`) con `getReadingsSince()`, que ya existía.

## Agregación por buckets
Devolver todas las lecturas crudas de 30 días (≈720 filas a una lectura por hora) haría un gráfico ilegible y un payload innecesario. El endpoint **promedia por bucket** según el rango pedido:

| Rango | Ventana | Bucket | Puntos |
|-------|---------|--------|--------|
| `24h` | 24 horas | 1 hora | 24 |
| `7d` | 7 días | 4 horas | 42 |
| `30d` | 30 días | 1 día | 30 |

Los buckets **sin lecturas se devuelven con `null`** en vez de omitirse: así el eje de tiempo queda parejo y la línea se corta en el hueco, que es lo que realmente pasó. Rellenarlo con una interpolación sería inventar datos.

## Flujo de Uso
1. El dashboard monta `<SensorCharts>` con el rango por defecto (`24h`).
2. `useSensorHistory(range)` pega a `GET /api/sensors/history?range=24h`.
3. El endpoint lee las lecturas de la ventana, las agrupa en buckets, promedia cada métrica y devuelve la serie.
4. El usuario cambia de rango en la fila de filtros → se re-piden los datos y se re-renderizan los cuatro gráficos.
5. El toggle "Ver tabla" muestra los mismos datos en formato tabular.

## Componentes / Archivos
| Archivo | Responsabilidad |
|---------|----------------|
| `src/constants/charts.ts` | Tokens de color validados, specs de marcas y definición de rangos |
| `src/types/history.types.ts` | Tipos del histórico y de la respuesta de la API |
| `src/lib/history.ts` | Lógica pura: lecturas → buckets promediados |
| `src/app/api/sensors/history/route.ts` | `GET` — histórico agregado, detrás de la cookie de sesión |
| `src/hooks/useSensorHistory.ts` | Hook cliente: fetch por rango + estado |
| `src/components/features/SensorCharts/SensorCharts.tsx` | Fila de filtros + grilla de gráficos + toggle de tabla |
| `src/components/features/SensorCharts/MetricChart.tsx` | Un gráfico de línea (una métrica) |
| `src/components/features/SensorCharts/HistoryTable.tsx` | Vista de tabla (gemela accesible) |

## API / Endpoints
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/sensors/history?range=24h\|7d\|30d` | Cookie de sesión | Histórico agregado por buckets |

Detalle de request/response en `docs/API_DOCS.md`.

## Restricciones
- **Nunca un gráfico de doble eje Y.** Métricas de escalas distintas van en gráficos separados.
- La lógica de bucketing vive en `src/lib/history.ts` como funciones puras, sin DB, igual que `src/lib/points.ts`.
- El `range` se valida en el servidor contra la lista cerrada de rangos; cualquier otro valor devuelve 400.
- Los colores de los gráficos salen de `src/constants/charts.ts`. Si se cambian, hay que **volver a correr el validador** de la skill `dataviz` antes de mergear.

## Pendiente
- [ ] Requiere la migración `0001` aplicada (igual que el resto de la feature `sensores`); sin ella el endpoint devuelve 500.
