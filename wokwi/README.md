# Simulador Wokwi — Plant Tamagotchi ESP32

Este directorio contiene todo lo necesario para simular el ESP32 del proyecto Plant Tamagotchi en **Wokwi** (simulador 3D interactivo). El circuito replica el kit físico completo comprado para el proyecto:

| Componente físico (carrito) | Parte en Wokwi | Pin ESP32 |
|---|---|---|
| NodeMCU ESP32 WiFi + Bluetooth | `wokwi-esp32-devkit-v1` | — |
| Sensor de humedad de suelo (gravity, 3 pines) | `wokwi-potentiometer` (simula la salida analógica capacitiva) | `D34` |
| Módulo sensor de luz con fotoresistor | `wokwi-photoresistor-sensor` | `D35` |
| Sensor de humedad y temperatura DHT22 | `wokwi-dht22` | `D5` |
| Sensor ultrasónico HC-SR04 | `wokwi-hc-sr04` | `D25` (TRIG) / `D26` (ECHO) |

> Wokwi no tiene un chip nativo de "sensor capacitivo de humedad de suelo", así que se simula con un potenciómetro (misma salida analógica 0–100%) — es la práctica estándar en la comunidad Wokwi para este sensor.

El HC-SR04 detecta cuando alguien se acerca a la planta (≤30cm sostenido 3s) para la tarea diaria de "darle cariño". Esta detección **ya está conectada al backend**: además de imprimirse por Serial, dispara un `POST /api/sensors/care` que persiste la visita en `care_log` y suma 20 pts al puntaje del día (ver sección "Cariño diario" más abajo y `docs/features/puntos.md`).

## Archivos

- **`code.ino`** — Código Arduino para el ESP32 (WiFi, lectura de sensores, HTTP POST a la API)
- **`diagram.json`** — Diagrama del circuito (ESP32 + sensores virtuales)
- **`wokwi.toml`** — Configuración de la simulación
- **`README.md`** — Este archivo

## Quickstart

### 1. Instalar `wokwi-cli`

```bash
# Descargar desde: https://github.com/wokwi/wokwi-cli/releases
# O instalar vía npm (si está disponible en tu región)
npm install -g wokwi-cli
```

### 2. Verificar que Next.js está corriendo

```bash
npm run dev
# La app debe estar en http://localhost:3000
```

### 3. Correr el simulador

```bash
cd wokwi
wokwi-cli run --file diagram.json
```

Esto abrirá el navegador con el simulador 3D. El ESP32 se conectará automáticamente a "Wokwi-GUEST" y comenzará a enviar datos a la API.

### 4. Verificar datos en el dashboard

1. Abre http://localhost:3000 en otra pestaña
2. Ingresa la contraseña: `nico`
3. Deberías ver que los sensores se actualizan cada 10 segundos
4. Verifica los gráficos: `GET /api/sensors/latest` y `GET /api/sensors/history?range=24h`

## Modificar la simulación

### Cambiar valores de sensores

En el diagrama Wokwi (web), puedes:

1. Clickear en cualquier sensor (potenciómetro de humedad, fotoresistor, DHT22, HC-SR04)
2. Ajustar los valores deslizando o escribiendo números (el HC-SR04 tiene un slider de "distance" en cm)
3. El ESP32 leerá los nuevos valores en la siguiente lectura

### Probar la detección de "cariño"

1. En el simulador, bajá el slider de "distance" del HC-SR04 a 30cm o menos
2. Mantenelo así al menos 3 segundos (simula que alguien se quedó cerca de la planta, no solo pasando)
3. En el Serial Monitor debería aparecer: `❤️ ¡Alguien le dio cariño a la planta hoy!`, seguido del resultado del POST a `/api/sensors/care` (`✓ Visita registrada (201 Created)` la primera vez del día, `✓ Visita ya estaba registrada hoy (200)` si se repite)
4. En el dashboard, el checklist de "Meta semanal" (tocar el panel) debería mostrar la tarea "Visitar a la planta" como cumplida
5. El flag `caredToday` se resetea automáticamente al cambiar el día (hora sincronizada por NTP)

### Cambiar la frecuencia de lecturas

En `code.ino`, línea ~42:

```cpp
const unsigned long READING_INTERVAL = 10000; // 10 segundos
```

Cámbialo a:
- `5000` → 5 segundos (más lecturas)
- `30000` → 30 segundos (menos lecturas)

### Agregar más sensores

1. En `diagram.json`, agrega un nuevo componente bajo `"parts"`
2. Conéctalo al ESP32 en `"connections"`
3. En `code.ino`, agrega código Arduino para leerlo

Ver: [Documentación de Wokwi](https://docs.wokwi.com/)

## Debugging

### El ESP32 no se conecta a WiFi

- Verifica que Wokwi esté ejecutándose con internet
- En `code.ino`, busca "Conectando a WiFi..." en la consola Arduino
- La red "Wokwi-GUEST" debería estar disponible automáticamente

### Los datos no llegan a la API

1. Abre la consola del simulador (pestaña "Serial Monitor" en Wokwi)
2. Busca líneas como "→ POST http://192.168.4.1:3000/api/sensors/ingest"
3. Verifica el código de respuesta HTTP (201 = éxito, 401 = secret inválido, etc.)
4. Confirma que `ESP32_INGEST_SECRET` en `code.ino` coincide con `.env.local`

### Los datos llegan pero no aparecen en el dashboard

1. Verifica que iniciaste sesión correctamente (`POST /api/auth/login`)
2. Revisa que la cookie de sesión se envíe en las requests de `GET /api/sensors/latest`
3. Confirma que Supabase tiene datos: mira la tabla `sensor_readings` en el panel de Supabase

## Integración con Claude Code (MCP)

El archivo `.mcp.json` en la raíz del proyecto configura el servidor MCP de Wokwi. Esto permite que Claude Code:

- Inspeccione el código Arduino
- Sugiera mejoras de eficiencia
- Debuggee errores de conectividad

Para usar:

```bash
# En Claude Code CLI
claude
# → Los comandos del MCP de Wokwi estarán disponibles
```

## Notas técnicas

- **IP del ESP32**: `192.168.4.?` (asignada por Wokwi)
- **API URL en el código**: `http://192.168.4.1:3000` (gateway de Wokwi)
- **Sensores**: calibrados para devolver valores 0–100% en rangos físicos plausibles
- **Hora sincronizada**: NTP desde `pool.ntp.org` (importante para `recorded_at` y para resetear "cariño" a diario)
- **Autenticación**: Bearer token en header `Authorization`

## ⚠️ Al armar el circuito físico (hardware real)

Wokwi simula el comportamiento lógico pero no el eléctrico, así que esto no rompe la simulación — pero **sí importa al soldar/armar el kit real**:

- El **HC-SR04 funciona a 5V** y su pin `ECHO` devuelve una señal de 5V. Los pines GPIO del ESP32 solo toleran 3.3V. Conectar `ECHO` directo puede dañar el pin.
  - Solución: divisor de voltaje resistivo entre `ECHO` y el GPIO del ESP32 (ej. R1=1kΩ hacia el GPIO, R2=2kΩ de ese punto a GND) para bajar la señal a ~3.3V.
  - `TRIG` sí puede conectarse directo (el ESP32 lo maneja como salida a 3.3V, el HC-SR04 lo acepta como nivel alto).
- `VCC` del HC-SR04 va al pin `VIN` (5V, viene del USB), no a `3V3`.
- Los demás sensores (potenciómetro/humedad, fotoresistor, DHT22) sí trabajan a 3.3V sin problema.

## Próximos pasos

- [ ] Testar con hardware real (ESP32 + sensores físicos)
- [ ] Validar calibración de sensores contra valores reales
- [ ] Documentar cómo subir el firmware a un ESP32 físico
- [ ] Agregar sensores adicionales si la planta lo requiere
