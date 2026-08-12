/**
 * Simulador del ESP32 — postea lecturas verosímiles a /api/sensors/ingest.
 * Ver docs/features/simulador-esp32.md para las opciones y escenarios.
 *
 * Es un script standalone a propósito: no importa nada de src/, porque el
 * ESP32 real también va a ser un cliente externo que solo conoce el endpoint.
 */

interface Reading {
  soil_moisture: number
  light_level: number
  temperature: number
  humidity: number
  recorded_at?: string
}

type Scenario = 'healthy' | 'thirsty' | 'dark' | 'cold' | 'random'

const SCENARIOS: Scenario[] = ['healthy', 'thirsty', 'dark', 'cold', 'random']

interface Options {
  scenario: Scenario
  watch: boolean
  intervalSeconds: number
  seedDays: number | null
  baseUrl: string
}

function randomBetween(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10
}

function buildReading(scenario: Scenario, at?: Date): Reading {
  const reading: Reading = {
    soil_moisture: randomBetween(45, 65),
    light_level: randomBetween(35, 70),
    temperature: randomBetween(19, 26),
    humidity: randomBetween(45, 65),
  }

  if (scenario === 'thirsty') reading.soil_moisture = randomBetween(10, 30)
  if (scenario === 'dark') reading.light_level = randomBetween(5, 20)
  if (scenario === 'cold') reading.temperature = randomBetween(8, 15)
  if (scenario === 'random') {
    reading.soil_moisture = randomBetween(0, 100)
    reading.light_level = randomBetween(0, 100)
    reading.temperature = randomBetween(-5, 45)
    reading.humidity = randomBetween(0, 100)
  }

  if (at) {
    // Ciclo día/noche: sin esto los gráficos históricos se ven como ruido plano.
    // Pico de luz al mediodía, ~0 de noche.
    const hour = at.getHours()
    const daylight = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI))
    reading.light_level = Math.round(daylight * randomBetween(55, 80) * 10) / 10
    reading.recorded_at = at.toISOString()
  }

  return reading
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    scenario: 'healthy',
    watch: false,
    intervalSeconds: 10,
    seedDays: null,
    baseUrl: process.env.SIMULATE_BASE_URL ?? 'http://localhost:3000',
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (arg === '--watch') {
      options.watch = true
    } else if (arg === '--scenario') {
      const value = argv[++i]
      if (!SCENARIOS.includes(value as Scenario)) {
        throw new Error(`Escenario inválido: "${value}". Opciones: ${SCENARIOS.join(', ')}`)
      }
      options.scenario = value as Scenario
    } else if (arg === '--interval') {
      const value = Number(argv[++i])
      if (!Number.isFinite(value) || value <= 0) throw new Error('--interval debe ser un número > 0')
      options.intervalSeconds = value
    } else if (arg === '--seed-days') {
      const value = Number(argv[++i])
      if (!Number.isInteger(value) || value <= 0) {
        throw new Error('--seed-days debe ser un entero > 0')
      }
      options.seedDays = value
    } else if (arg === '--url') {
      options.baseUrl = argv[++i]
    } else {
      throw new Error(`Argumento desconocido: "${arg}"`)
    }
  }

  return options
}

async function postReading(reading: Reading, options: Options, secret: string): Promise<void> {
  const response = await fetch(`${options.baseUrl}/api/sensors/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(reading),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`HTTP ${response.status} — ${body}`)
  }
}

function describe(reading: Reading): string {
  return [
    `sustrato ${reading.soil_moisture}%`,
    `luz ${reading.light_level}%`,
    `${reading.temperature}°C`,
    `humedad ${reading.humidity}%`,
  ].join('  ·  ')
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))

  const secret = process.env.ESP32_INGEST_SECRET
  if (!secret) {
    console.error('✖ Falta ESP32_INGEST_SECRET. Definila en .env.local antes de correr el simulador.')
    process.exit(1)
  }

  console.log(`→ Simulador ESP32 · escenario "${options.scenario}" · ${options.baseUrl}`)

  if (options.seedDays !== null) {
    const total = options.seedDays * 24
    console.log(`  Sembrando ${options.seedDays} día(s) de historial (${total} lecturas)...`)

    let sent = 0
    for (let hoursAgo = total; hoursAgo > 0; hoursAgo--) {
      const at = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
      await postReading(buildReading(options.scenario, at), options, secret)
      sent++
      if (sent % 24 === 0) console.log(`  ${sent}/${total} lecturas`)
    }

    console.log(`✓ Listo: ${sent} lecturas históricas insertadas.`)
    return
  }

  const sendOnce = async () => {
    const reading = buildReading(options.scenario)
    await postReading(reading, options, secret)
    console.log(`✓ ${new Date().toLocaleTimeString()}  ${describe(reading)}`)
  }

  await sendOnce()

  if (options.watch) {
    console.log(`  Modo continuo: una lectura cada ${options.intervalSeconds}s. Ctrl+C para cortar.`)
    setInterval(() => {
      sendOnce().catch((error) => console.error(`✖ ${(error as Error).message}`))
    }, options.intervalSeconds * 1000)
  }
}

main().catch((error: unknown) => {
  console.error(`✖ ${(error as Error).message}`)
  process.exit(1)
})
