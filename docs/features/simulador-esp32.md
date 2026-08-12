# Feature: Simulador del ESP32

> **Estado:** Completo
> **Archivos clave:** `scripts/simulate-esp32.ts`
> **Dependencias:** `tsx` (dev, para correr TypeScript sin compilar)

---

## Descripción
Script de línea de comandos que genera lecturas de sensores verosímiles y las postea a `/api/sensors/ingest`, igual que haría el ESP32 real. Permite desarrollar y probar el dashboard, los puntos y los gráficos sin tener el hardware conectado.

## Objetivo
Desacoplar el desarrollo del software del armado del dispositivo físico, y poder reproducir escenarios concretos (planta sana, planta con sed, historial de una semana) a voluntad.

## Modelo de Datos
No agrega tablas. Escribe en `sensor_readings` a través del endpoint público de ingesta — nunca toca Supabase directamente, justamente para ejercitar el mismo camino que usará el hardware real.

## Flujo de Uso
```bash
# Una lectura sana, ahora
npm run simulate

# Modo continuo: una lectura cada 10 segundos hasta Ctrl+C
npm run simulate -- --watch --interval 10

# Sembrar 7 días de historial (para los gráficos), 1 lectura por hora
npm run simulate -- --seed-days 7

# Forzar un escenario concreto
npm run simulate -- --scenario thirsty
```

### Opciones
| Flag | Default | Descripción |
|------|---------|-------------|
| `--scenario <nombre>` | `healthy` | `healthy`, `thirsty`, `dark`, `cold`, `random` |
| `--watch` | `false` | Postea indefinidamente en vez de una sola vez |
| `--interval <seg>` | `10` | Segundos entre lecturas en modo `--watch` |
| `--seed-days <n>` | — | Genera `n` días de historial hacia atrás (1 lectura por hora) y los postea |
| `--url <url>` | `http://localhost:3000` | Base URL de la app |

### Escenarios
| Escenario | Qué simula |
|-----------|-----------|
| `healthy` | Todo dentro del rango óptimo — salud ≈ 1.0 |
| `thirsty` | Humedad de sustrato baja (10–30 %), el resto bien |
| `dark` | Poca luz (5–20 %), el resto bien |
| `cold` | Temperatura baja (8–15 °C), el resto bien |
| `random` | Cada métrica al azar dentro de su rango físico |

## Componentes / Archivos
| Archivo | Responsabilidad |
|---------|----------------|
| `scripts/simulate-esp32.ts` | Parseo de flags, generación de lecturas por escenario, POST al endpoint |
| `package.json` | Script `simulate` |

## Restricciones
- Usa `ESP32_INGEST_SECRET` desde `.env.local` — la misma credencial que usará el dispositivo. Si falta, el script aborta con un mensaje claro en vez de mandar un request que va a fallar con 401.
- No importa código de `src/`: es un script standalone, para que se parezca lo más posible a un cliente externo (que es lo que el ESP32 va a ser).
- El seeding respeta el ciclo día/noche en la métrica de luz, así los gráficos históricos se ven realistas y no como ruido plano.

## Pendiente
- [ ] Requiere que la migración `0001` esté aplicada en Supabase (ver `docs/features/sensores.md`), si no todos los POST responden 500.
