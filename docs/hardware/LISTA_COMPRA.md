# Lista de Compra — Plant Tamagotchi (Kit Físico Completo)

> **Estado:** Esta guía es para armar el circuito físico real en una protoboard o placa soldada.
> **Actualizado:** 2026-08-15

---

## 📦 Componentes Principales (del carrito)

Estos ya los identificaste:

| Ítem | Cantidad | Precio aprox. (ARS) | Link / referencia |
|------|----------|---------|----------|
| **Placa de Desarrollo NODEMCU ESP32 WiFi + Bluetooth MicroUSB** | 1 | 10.559 | Ya en carrito |
| **Sensor de humedad de suelo con conector gravity 3 pines** | 1 | 2.978 | Ya en carrito |
| **Módulo Sensor De Luz Con Fotoresistor** | 1 | 1.649 | Ya en carrito |
| **Sensor De Humedad Y Temperatura DHT22 Arduino** | 1 | 3.832 | Ya en carrito |
| **Sensor Ultrasónico Ultrasónido Hc-sr04 Arduino Pic Robótica** | 1 | 2.475 | Ya en carrito |
| **TOTAL COMPONENTES** | — | **21.493** | — |

---

## 🔌 Componentes Adicionales (cables, resistencias, protoboard)

### Cables y Conectores

| Ítem | Cantidad | Descripción | Precio aprox. | Dónde comprar |
|------|----------|----------|----------|---------|
| **Jumpers / Cables DuPont Macho-Macho** | 1 paquete (40 piezas) | Cables de 10-20cm, varios colores (rojo para VCC/5V, negro para GND, otros para datos) | 500-800 ARS | MercadoLibre: "cables dupont macho macho" |
| **Jumpers / Cables DuPont Macho-Hembra** | 1 paquete (40 piezas) | Para conectar sensores con pines hembra (ej. el fotoresistor) | 600-900 ARS | MercadoLibre: "cables dupont macho hembra" |

> **Consejo práctico:** Los paquetes de 40 piezas vienen en variedad de colores. Comprá uno de macho-macho y uno de macho-hembra — con eso cubrís todas las conexiones posibles del circuito. Si el sensor de humedad de suelo ya tiene cables, quizás no necesités macho-hembra.

### Resistencias (para el divisor de voltaje del HC-SR04)

**⚠️ CRÍTICO:** El HC-SR04 devuelve 5V en su pin ECHO. El ESP32 solo tolera 3.3V en los GPIO. Si conectás directo, **dañás la placa**.

**Solución:** divisor de voltaje resistivo simple.

| Resistencia | Valor | Tolerancia | Cantidad | Precio aprox. |
|---|---|---|---|---|
| Resistencia de película de carbón | 1kΩ (marrón-negro-rojo) | ±5% | 1 | 20-50 ARS |
| Resistencia de película de carbón | 2kΩ (rojo-negro-rojo) | ±5% | 1 | 20-50 ARS |

**Total resistencias:** ~50-100 ARS

**Dónde comprar:** MercadoLibre: "resistencias de carbón surtido 1/4W" (vienen en paquetes de 100+ valores variados, muy baratas).

### Protoboard (opcional pero recomendado)

Si querés armar el circuito sin soldar:

| Ítem | Tamaño | Precio aprox. | Descripción |
|------|--------|---------|-----------|
| **Protoboard de puntos** | 400 o 830 puntos | 800-1500 ARS | Para pruebas rápidas; 400 puntos alcanza para este circuito |
| **Protoboard PCB soldable** | 5×7cm | 300-500 ARS | Para un circuito más permanente sin piezas sueltas |

> Recomendación: la **protoboard de 400 puntos** es la opción más flexible para experimentar. Si después querés permanente, soldás todo en una PCB.

---

## 🔧 Esquema de Conexiones (HC-SR04 con divisor de voltaje)

### Pin a Pin

#### ESP32 → Sensores

| Sensor | Pin ESP32 | Pin Sensor | Cable |
|--------|-----------|-----------|-------|
| **Humedad de suelo** | `3V3` | VCC | Rojo |
| **Humedad de suelo** | `GND` | GND | Negro |
| **Humedad de suelo** | `D34` | OUT/AOUT | Azul/Amarillo |
| **Fotoresistor** | `3V3` | VCC | Rojo |
| **Fotoresistor** | `GND` | GND | Negro |
| **Fotoresistor** | `D35` | AO | Azul/Amarillo |
| **DHT22** | `3V3` | VCC | Rojo |
| **DHT22** | `GND` | GND | Negro |
| **DHT22** | `D5` | SDA/DAT | Verde |
| **HC-SR04** | `5V` (VIN) | VCC | Rojo ⚠️ |
| **HC-SR04** | `GND` | GND | Negro |
| **HC-SR04** | `D25` | TRIG | Naranja |
| **HC-SR04** | (divisor) | ECHO | ← ver abajo |

#### Divisor de Voltaje para HC-SR04 ECHO

El pin ECHO del HC-SR04 devuelve **5V**. Necesitamos bajarlo a **3.3V** para no dañar el GPIO del ESP32.

**Conexión (en protoboard o soldada):**

```
HC-SR04 ECHO (5V)
    |
    +---[ R1 = 1kΩ ]---+--- ESP32 D26 (GPIO)
                       |
                   [ R2 = 2kΩ ]
                       |
                      GND
```

**Pasos:**
1. Pone una resistencia de 1kΩ entre el pin ECHO del HC-SR04 y el GPIO D26 del ESP32
2. Pone una resistencia de 2kΩ entre ese punto (donde se juntan R1 y D26) y GND
3. Esto baja la tensión a ~3.3V: `Vout = 5V × (2kΩ / (1kΩ + 2kΩ)) = 5V × (2/3) ≈ 3.33V` ✓

**Alternativa (más fácil):** si no querés cálculos, busca "divisor de voltaje 5V a 3.3V" — es un módulo pre-hecho por ~500 ARS que hace esto automáticamente. Pero las resistencias son más baratas si ya estás soldando.

---

## 📋 Resumen de Compra por Categoría

### Opción 1: **Prototipado rápido** (sin soldar)

```
- 1× Paquete cables DuPont macho-macho
- 1× Paquete cables DuPont macho-hembra
- 1× Protoboard 400 puntos
- 1× Paquete resistencias (para conseguir 1kΩ y 2kΩ)
────────────────────────────────────
SUBTOTAL: ~2000-3000 ARS
+ Componentes principales (21.493 ARS)
TOTAL: ~23.500-24.500 ARS
```

### Opción 2: **Circuito permanente** (soldado)

```
- 1× Paquete cables rígidos (estaño suelto) — opcional, o reutiliza jumpers
- 1× PCB soldable 5×7cm
- 1× Estaño para soldar (60/40 o lead-free) — si no tenés
- 1kΩ y 2kΩ de resistencia (del paquete variado)
────────────────────────────────────
SUBTOTAL: ~1500-2500 ARS
+ Componentes principales (21.493 ARS)
TOTAL: ~23.000-24.000 ARS
```

### Opción 3: **Solución intermedia** (mi recomendación)

1. Comprá **cables DuPont** (macho-macho y macho-hembra)
2. Comprá **resistencias** (paquete surtido, le saco 1kΩ y 2kΩ)
3. Montá primero en una **protoboard** para probar todo
4. Una vez que ande, soldá las partes críticas en una PCB o dejalo en protoboard

```
Cables DuPont: ~1000 ARS
Resistencias: ~100 ARS
Protoboard: ~1000 ARS
────────────────────────────────────
SUBTOTAL: ~2100 ARS
+ Componentes principales (21.493 ARS)
TOTAL: ~23.600 ARS
```

---

## 🛒 Links de Compra (MercadoLibre Argentina aprox.)

Búsquedas sugeridas:

1. **"Cables dupont macho macho arduino"** → paquete de 40 piezas, variados colores (500-800 ARS)
2. **"Cables dupont macho hembra arduino"** → paquete de 40 piezas (600-900 ARS)
3. **"Resistencias carbón surtido 1/4w"** → paquete de 100+ valores (150-300 ARS, te alcanza para todo)
4. **"Protoboard 400 puntos"** — opcional si ya tenés, si no ~800-1200 ARS
5. **"Divisor de voltaje 5v 3.3v módulo"** — alternativa al DIY de resistencias (~500 ARS, pero innecesario si hacés el divisor manual)

---

## ✅ Checklist Final

Antes de armar, verificá que tenés:

- [ ] ESP32 NodeMCU
- [ ] Sensor capacitivo de humedad (con conector gravity)
- [ ] Fotoresistor / módulo LDR
- [ ] DHT22
- [ ] HC-SR04
- [ ] Cables DuPont (macho-macho al menos)
- [ ] Resistencias 1kΩ y 2kΩ (divisor HC-SR04)
- [ ] Protoboard O soldador + estaño (según tu opción)
- [ ] Cable micro-USB para alimentar el ESP32 (probablemente ya tenés)

---

## ⚠️ Armado: Paso a Paso Básico

1. **Alimentación:**
   - Conectá el ESP32 por USB a una computadora o fuente de 5V
   - `VIN` (5V) del ESP32 → carril positivo protoboard (rojo)
   - `GND` del ESP32 → carril negativo protoboard (negro)
   - `3V3` del ESP32 → carril positivo de 3.3V (si tu protoboard lo tiene, o usá este pin directo)

2. **Sensores de 3.3V** (humedad, fotoresistor, DHT22):
   - VCC → carril 3.3V
   - GND → carril GND
   - Data → pines GPIO correspondientes (D34, D35, D5)

3. **HC-SR04** (5V con divisor):
   - VCC → carril 5V
   - GND → carril GND
   - TRIG → D25 (directo, el ESP32 lo puede manejar)
   - ECHO → **[R1=1kΩ]** → D26 + **[R2=2kΩ]** → GND (el divisor)

4. **Prueba:**
   - Sube el código `wokwi/code.ino` al ESP32 (via Arduino IDE)
   - Abre el Serial Monitor (115200 baud)
   - Deberías ver los logs de lectura de sensores cada 10 segundos

---

## 📖 Referencia Rápida de Precios (MercadoLibre ARS, aproximados 2026-08)

| Categoría | Rango | Recomendación |
|-----------|-------|---------|
| Cables DuPont x40 | 500-900 | No escatimes, comprá 2 paquetes (macho-macho + macho-hembra) |
| Resistencias surtido x100+ | 150-300 | Cualquiera sirve; la más barata |
| Protoboard 400 ptos | 800-1200 | Marca Genérica alcanza |
| Divisor voltaje módulo | ~500 | Innecesario si hacés el DIY |
| Estaño para soldar | 200-500 | Solo si vas a soldar |
| **TOTAL accesorios** | ~2000-3500 | Depende si soldás o no |

---

## 🔗 Próximos Pasos

1. ✅ **Hoy:** armá el carrito con lo que viste + cables + resistencias
2. ⏭️ Espera a que llegue el material
3. ⏭️ Montalo en protoboard siguiendo el esquema arriba
4. ⏭️ Sube el código `wokwi/code.ino` al ESP32 real
5. ⏭️ Abre el Serial Monitor y verificá que anden todos los sensores
6. ⏭️ Ajustá la calibración en `code.ino` si es necesario (rango ADC real, distancia del HC-SR04, etc.)

---

## 📌 Dudas Comunes

**P: "¿Puedo usar otro valor de resistencias para el divisor?"**
R: Sí, cualquier combinación que te dé ~3.3V funciona. Varias opciones:
- 1kΩ + 2kΩ = 3.33V ✓ (recomendado)
- 2.2kΩ + 4.7kΩ = 3.33V ✓ (si los conseguís)
- 10kΩ + 20kΩ = 3.33V ✓ (pero dibuja más corriente)
La fórmula: `Vout = 5V × (R2 / (R1 + R2))` donde R2 es hacia GND.

**P: "¿Qué pasa si conecto ECHO directo a D26 sin divisor?"**
R: El HC-SR04 envía 5V, el pin del ESP32 se quema (GPIO se daña). No lo hagas.

**P: "¿TRIG necesita divisor?"**
R: No. TRIG es una entrada que el ESP32 controla (envía 3.3V), el HC-SR04 lo acepta. Solo ECHO necesita divisor.

**P: "¿Puedo usar un módulo divisor pre-hecho?"**
R: Sí, pero cuesta más. Las 2 resistencias DIY son más baratas y ocupan poco espacio.
