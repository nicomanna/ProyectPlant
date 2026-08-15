# Simulador Wokwi — Plant Tamagotchi ESP32

Este directorio contiene todo lo necesario para simular el ESP32 del proyecto Plant Tamagotchi en **Wokwi** (simulador 3D interactivo).

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

1. Clickear en cualquier sensor (Soil Moisture, Light, DHT22)
2. Ajustar los valores deslizando o escribiendo números
3. El ESP32 leerá los nuevos valores en la siguiente lectura

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
- **Hora sincronizada**: NTP desde `pool.ntp.org` (importante para `recorded_at`)
- **Autenticación**: Bearer token en header `Authorization`

## Próximos pasos

- [ ] Testar con hardware real (ESP32 + sensores físicos)
- [ ] Validar calibración de sensores contra valores reales
- [ ] Documentar cómo subir el firmware a un ESP32 físico
- [ ] Agregar sensores adicionales si la planta lo requiere
