# Plant Tamagotchi (Proyecto Plant)

## Visión
Web App tipo PWA estilo "Tamagotchi" para cuidar una planta real (Potus/Peperomia) monitoreada por sensores IoT (ESP32). Es un regalo/juego pensado para que la usuaria cuide la planta y sume puntos hacia una meta semanal a cambio de un premio.

## Objetivos
- Mostrar el estado de la planta en vivo a partir de datos de sensores (humedad, luz, temperatura, etc.)
- Gamificar el cuidado de la planta con un sistema de puntos y una barra de progreso hacia una meta semanal (700 pts)
- Ofrecer una experiencia mobile-first instalable como PWA
- Permitir simular el ESP32 sin hardware real para desarrollo y testing

## Stack Técnico
| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React | 19.2.8 |
| Framework | Next.js (App Router) | 16.3.0 |
| Lenguaje | TypeScript | ^5 |
| Estilos | Tailwind CSS | ^4 |
| Base de datos | Supabase (PostgreSQL) | - |
| Cliente de datos | `@supabase/supabase-js` (sin ORM intermedio) | - |
| Iconos | Lucide React | - |
| Animaciones | canvas-confetti | - |
| Auth | Contraseña única compartida (sin cuentas de usuario individuales) | - |
| Deploy | Vercel | - |

## Estado del Proyecto
| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Setup inicial + estructura + documentación | [x] Completo |
| 2 | Autenticación simple por contraseña | [ ] Pendiente |
| 3 | Dashboard mobile-first + estado de sensores en vivo | [ ] Pendiente |
| 4 | Sistema de puntos + meta semanal (700 pts) + confeti | [ ] Pendiente |
| 5 | Gráficos históricos de sensores | [ ] Pendiente |
| 6 | PWA instalable (manifest + service worker) | [ ] Pendiente |
| 7 | Script de simulación del ESP32 | [ ] Pendiente |
| 8 | Polish + Deploy en Vercel | [ ] Pendiente |

## Principio Fundamental
> La app es un regalo, no una herramienta corporativa: prioridad al diseño cálido, cercano y divertido (planta 3D a color con carita feliz) por sobre la formalidad. La lógica y los datos deben ser sólidos, pero la piel visual queda a criterio del diseño que aporte el usuario.
