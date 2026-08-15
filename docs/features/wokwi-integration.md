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

El circuito Wokwi emula:

- **1× ESP32** (DevKit-C) con WiFi + GPIO
- **4× sensores virtuales** mapeados a pines ADC:
  - Capacitivo de humedad del suelo → `GPIO_34` (ADC1_CH6)
  - Fotoresistor (luz) → `GPIO_35` (ADC1_CH7)
  - DHT22 (temperatura/humedad) → `GPIO_5` (GPIO digital)
  - Simulador de temperatura interna del aire → `GPIO_36` (ADC1_CH0)

El código Arduino lee estos pines, escala los valores a rangos físicos plausibles (0–100 %) y postea a `/api/sensors/ingest` cada N segundos.

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
- El código Arduino usa `#include <WiFi.h>` y `#include <HTTPClient.h>` (libreríaas estándar del ESP32)
- Los sensores virtuales en Wokwi están calibrados para devolver valores 0–1023 (ADC de 10 bits)
- El ESP32 debe estar conectado a una red WiFi simulada en Wokwi (la plataforma lo provisiona automáticamente)

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
