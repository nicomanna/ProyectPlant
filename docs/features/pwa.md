# Feature: PWA instalable

> **Estado:** Completo
> **Archivos clave:** `src/app/manifest.ts`, `src/app/icons/[variant]/route.tsx`, `public/sw.js`, `src/components/features/PWA/**`
> **Dependencias nuevas:** ninguna

---

## Descripción
Convierte el dashboard en una app instalable: se agrega a la pantalla de inicio del celular, abre sin barra de navegador y muestra una pantalla propia cuando no hay conexión.

## Objetivo
Es un regalo que se usa desde el celular todos los días. Que viva en la pantalla de inicio con su ícono, y no en una pestaña perdida del navegador, es la diferencia entre que se use y que no.

---

## Decisiones técnicas

### El manifest se genera, no se escribe a mano
El `TODO.md` original decía `public/manifest.json`. Se hizo con **`src/app/manifest.ts`**, que es la convención de Next.js 16 (`MetadataRoute.Manifest`): Next lo sirve en `/manifest.webmanifest` y **agrega solo el `<link rel="manifest">` al `<head>`**, sin tener que mantenerlo sincronizado a mano. Además queda tipado, así que un campo mal escrito es un error de build y no un manifest silenciosamente inválido.

### Los íconos se generan con código, no son archivos binarios
No hay un diseño gráfico definitivo de la app todavía, y meter PNGs binarios generados a ojo en el repo significa versionar assets que después nadie sabe cómo regenerar. En su lugar, los íconos se dibujan con **`ImageResponse` de `next/og`** (la vía que recomienda la doc de Next para íconos generados): un Potus estilizado — maceta terracota con carita feliz y tres hojas — armado con divs, gradientes y `border-radius`, sin fuentes ni assets externos.

Se generan en tiempo de build y quedan cacheados estáticamente:

| Ruta | Tamaño | Uso |
|------|--------|-----|
| `/icon` | 32×32 | Pestaña del navegador (convención `app/icon.tsx`) |
| `/apple-icon` | 180×180 | Pantalla de inicio de iOS (convención `app/apple-icon.tsx`) |
| `/icons/192` | 192×192 | Manifest, `purpose: any` |
| `/icons/512` | 512×512 | Manifest, `purpose: any` |
| `/icons/maskable` | 512×512 | Manifest, `purpose: maskable` |

La variante **maskable** lleva más padding (el arte entra en el círculo seguro del 80 % central) y fondo a sangre, para que Android pueda recortarla con la forma que use el launcher sin comerse las hojas. La lógica de dibujo vive una sola vez en `src/lib/appIcon.tsx` y las tres rutas la reusan con distinto tamaño.

### Service worker: network-first, y nunca toca la API
`public/sw.js` es deliberadamente chico. Reglas:

1. **Solo intercepta `GET`.** Un `POST /api/points/claim` nunca pasa por el service worker.
2. **Nunca cachea `/api/*`.** Cachear lecturas de sensores mostraría datos viejos como si fueran actuales, y cachear respuestas detrás de la cookie de sesión es un problema de seguridad. Va siempre a la red.
3. **Navegaciones: network-first** con la pantalla `/offline.html` como fallback. Nunca cache-first: si sirviera el HTML cacheado primero, un deploy nuevo tardaría en verse.
4. **Assets estáticos de Next (`/_next/static/*`) e íconos: cache-first.** Llevan hash en el nombre, así que son inmutables por definición.
5. **Limpieza de versiones viejas** en el `activate`: al cambiar `CACHE_VERSION` se borran los caches anteriores.

No se usa Serwist ni ninguna librería de PWA: para estas cinco reglas, agregar una dependencia con su propio build step no se justifica.

### Sin notificaciones push
La doc de Next dedica la mitad de la guía de PWA a Web Push (VAPID, `web-push`, Server Actions de suscripción). **No se implementó**: nadie lo pidió, requiere claves nuevas en el entorno y una tabla para persistir suscripciones. Mandamiento I.

### Rutas públicas nuevas
El manifest lo pide el navegador **sin credenciales**, así que si el proxy de sesión lo interceptara, la app nunca sería instalable. Se agregaron al matcher de `src/proxy.ts` como públicas: `manifest.webmanifest`, `sw.js`, `offline.html`, `icon`, `apple-icon` e `/icons/*`.

Ninguna expone datos: son metadatos de la app, imágenes generadas y una página estática de "sin conexión". El dashboard y todos los endpoints de datos siguen igual de protegidos. Registrado en `docs/03-security.md`.

### El registro corre solo en producción
`ServiceWorkerRegistrar` no registra nada si `NODE_ENV !== 'production'`. Un service worker cacheando durante `next dev` produce exactamente el tipo de bug fantasma que hace perder una tarde.

---

## Componentes / Archivos
| Archivo | Responsabilidad |
|---------|----------------|
| `src/app/manifest.ts` | Manifest tipado (nombre, colores, display, íconos) |
| `src/lib/appIcon.tsx` | Dibujo del ícono del Potus, compartido por las cinco rutas |
| `src/app/icon.tsx` | Favicon 32×32 |
| `src/app/apple-icon.tsx` | Ícono de iOS 180×180 |
| `src/app/icons/[variant]/route.tsx` | Íconos del manifest (192, 512, maskable) |
| `public/sw.js` | Service worker |
| `public/offline.html` | Pantalla de "sin conexión" |
| `src/components/features/PWA/ServiceWorkerRegistrar.tsx` | Registra el SW en producción |
| `src/app/layout.tsx` | Metadata de la app, `theme-color`, `lang="es"`, monta el registrar |
| `src/proxy.ts` | Deja públicas las rutas de la PWA |

## Restricciones
- No agrega tablas, migraciones ni endpoints de datos.
- La instalación requiere **HTTPS** (Vercel lo da; en local solo funciona en `localhost`).
- El modo offline muestra la pantalla de fallback, **no** el dashboard con datos cacheados: mostrar lecturas de sensores viejas sin avisar sería peor que decir "no hay conexión".

## Pendiente
- [ ] Reemplazar el ícono generado por el diseño visual definitivo, si el usuario hace uno.
- [ ] Verificar la instalación en un celular real después del deploy (requiere HTTPS).
