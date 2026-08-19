# Feature: Integración con Wokwi (Simulador 3D del ESP32)

> **Estado:** En desarrollo
> **Archivos clave:** `.mcp.json`, simulador Arduino en Wokwi, código de ingestión en API
> **Dependencias:** `wokwi-cli` (CLI de Wokwi), token API de Wokwi (`WOKWI_CLI_TOKEN`)

---

## Descripción

Integración con **Wokwi** para simular el ESP32 físico en un entorno 3D interactivo antes de deployar en hardware real. El simulador Wokwi:

- Emula sensores virtuales (humedad del suelo, luz, temperatura, humedad ambiente)
- Ejecuta el código Arduino real que correrá en el ESP32 físico
- Envía lecturas al endpoint `/api/sensors/ingest` de la app
- Permite validar el flujo completo (hardware → API → Dashboard) sin hardware

## Objetivo

Desacoplar el desarrollo del firmware ESP32 del hardware físico, permitir testing iterativo del circuito antes de soldadura, y acelerar debugging del flujo de datos sin depender de la disponibilidad del dispositivo.

## Modelo de Datos

No agrega tablas. El flujo es idéntico al del script simulador:

```
ESP32 (en Wokwi) → POST /api/sensors/ingest → Supabase (sensor_readings)
```

Las lecturas enviadas tienen el mismo formato que las del hardware real:

```json
{
  "soil_moisture": 55.2,
  "light_level": 48.0,
  "temperature": 22.4,
  "humidity": 58.1,
  "recorded_at": "2026-08-15T14:30:00.000Z"
}
```

## Flujo de Uso

### Prerequisitos

1. Token API de Wokwi (`WOKWI_CLI_TOKEN`) en `.env.local`
2. `wokwi-cli` instalado y en PATH
3. Proyecto Wokwi creado (se proporciona el diagrama + código)

### Correr la simulación

```bash
# Abrir el simulador en el navegador
wokwi-cli run --file diagram.json

# Verificar que los datos llegan a la API
curl http://localhost:3000/api/sensors/latest -H "Cookie: plant_session=..."
```

La app Next.js debe estar corriendo en `http://localhost:3000` en otra terminal.

## Componentes / Archivos

| Archivo | Responsabilidad |
|---------|-----------------|
| `.mcp.json` | Configuración del servidor MCP de Wokwi para Claude Code |
| `wokwi/diagram.json` | Diagrama del circuito (ESP32 + sensores virtuales) |
| `wokwi/code.ino` | Código Arduino que lee sensores y postea a la API |
| `docs/features/wokwi-integration.md` | Esta doc |

## Arquitectura del Circuito

El circuito Wokwi replica el kit físico completo (5 componentes comprados para el proyecto):

| Componente físico | Parte Wokwi | Pin ESP32 | Función |
|---|---|---|---|
| ESP32 NodeMCU DevKit | `wokwi-esp32-devkit-v1` | — | Microcontrolador + WiFi |
| Sensor capacitivo de humedad de suelo | `wokwi-potentiometer` | `D34` (ADC1_CH6) | Humedad del sustrato |
| Fotoresistor (luz) | `wokwi-photoresistor-sensor` | `D35` (ADC1_CH7) | Nivel de luz |
| DHT22 | `wokwi-dht22` | `D5` (digital) | Temperatura + humedad ambiente |
| HC-SR04 (ultrasónico) | `wokwi-hc-sr04` | `D25` (TRIG) / `D26` (ECHO) | Proximidad — detecta "cariño" diario |

> Wokwi no tiene un chip nativo para sensor capacitivo de humedad de suelo; se simula con un potenciómetro (misma salida analógica 0–100%), que es la práctica estándar de la comunidad Wokwi para este sensor.

El código Arduino lee los 4 primeros sensores, escala los valores a rangos físicos plausibles (0–100 %) y postea a `/api/sensors/ingest` cada `READING_INTERVAL` (10s por defecto). El HC-SR04 se lee en un ciclo aparte y más rápido (cada 300ms) para detectar proximidad sostenida — ver sección "Detección de cariño" abajo.

## Flujo de Datos

```
Sensor (Wokwi)
    ↓
ADC / GPIO (ESP32)
    ↓
Arduino: leer → escalar → construir JSON
    ↓
HTTP POST /api/sensors/ingest
    ↓
API: validar → persistir en Supabase
    ↓
Dashboard: GET /api/sensors/latest → actualizar modelo 3D
```

## Detección de "cariño" (HC-SR04)

El sensor ultrasónico mide la distancia entre el sensor y quien se acerca a la planta. La idea: si alguien se queda cerca un rato (no solo pasa caminando), cuenta como la tarea diaria de "darle cariño a la planta".

**Estado actual: conectado al backend.** El código Arduino:

1. Mide distancia cada 300ms (`readDistanceCm()`, fórmula estándar `pulseIn(ECHO) / 58`)
2. Si la distancia es `≤ 30cm` sostenida durante `≥ 3s` (evita falsos positivos de alguien pasando cerca), marca `caredToday = true`, imprime por Serial `❤️ ¡Alguien le dio cariño a la planta hoy!` y llama a `postCareToAPI()`
3. `postCareToAPI()` hace `POST /api/sensors/care` (mismo secret que el ingest de sensores) con `occurred_at` en ISO 8601; el backend persiste el evento en `care_log` (idempotente por día) y lo suma como 5ta métrica del sistema de puntos — 20 pts todo-o-nada (ver `docs/features/puntos.md`)
4. El flag `caredToday` se resetea automáticamente al cambiar el día calendario (usa `tm_yday` de la hora sincronizada por NTP)

## Configuración del Servidor MCP

El archivo `.mcp.json` declara el servidor Wokwi para que Claude Code pueda:
- Inspeccionar el código Arduino
- Sugerir optimizaciones
- Debuggear errores de conectividad

```json
{
  "mcpServers": {
    "Wokwi": {
      "type": "stdio",
      "command": "wokwi-cli",
      "args": ["mcp"],
      "env": {
        "WOKWI_CLI_TOKEN": "${env:WOKWI_CLI_TOKEN}"
      }
    }
  }
}
```

## Restricciones

- El token `WOKWI_CLI_TOKEN` debe estar en `.env.local`, nunca hardcodeado
- El código Arduino usa `#include <WiFi.h>` y `#include <HTTPClient.h>` (librerías estándar del ESP32)
- El ADC del ESP32 es de 12 bits (0–4095), no 10 bits; el código escala sobre ese rango
- El ESP32 debe estar conectado a una red WiFi simulada en Wokwi (la plataforma lo provisiona automáticamente)
- **Hardware real (no aplica a la simulación):** el HC-SR04 trabaja a 5V y su pin `ECHO` puede dañar el GPIO del ESP32 (tolera 3.3V) si se conecta directo — requiere divisor de voltaje resistivo al armar el circuito físico. Ver `wokwi/README.md`

## Testing

### Unit Test (código Arduino)
```cpp
// En la consola Arduino:
// - Compilar localmente con `arduino-cli compile --fqbn esp32:esp32:esp32`
// - Verificar que no hay warnings de conversión de tipos
```

### Integration Test (flujo end-to-end)

```bash
# Terminal 1: Supabase + Next.js
npm run dev

# Terminal 2: Wokwi
wokwi-cli run --file wokwi/diagram.json

# Terminal 3: verificar datos en Supabase
curl -s http://localhost:3000/api/sensors/latest \
  -H "Cookie: plant_session=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"password":"nico"}' \
    -c /tmp/cookies.txt && cat /tmp/cookies.txt | grep plant_session | awk '{print $NF}')" \
  | jq .reading
```

## Pendiente

- [ ] Crear proyecto en Wokwi con diagrama y código Arduino
- [ ] Testar conexión WiFi simulada en Wokwi
- [ ] Validar que los datos llegan a Supabase
- [ ] Documentar cómo editar el circuito (agregar sensores, cambiar pines)
- [x] Backend de "cariño diario" (HC-SR04): tabla `care_log`, endpoint `POST /api/sensors/care`, 5ta métrica del sistema de puntos semanal (ver `docs/features/puntos.md`)
