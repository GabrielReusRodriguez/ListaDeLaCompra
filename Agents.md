# Agentes de ListaDeLaCompra

Instrucciones para cualquier agente que trabaje en este repositorio. La especificación funcional y técnica es [Specs.md](Specs.md); en caso de conflicto, Specs.md es la fuente de verdad.

## Qué es el proyecto

Aplicación web en React para listas de la compra que funciona 100 % en local: sin servidor ni nube. Los datos se guardan en `localStorage` y el acceso está protegido por autenticación local. Lee [Specs.md](Specs.md) antes de tocar código.

## Stack

- Vite + React 18 + TypeScript.
- React Router para la navegación.
- Vitest + React Testing Library para las pruebas.
- ESLint + Prettier para lint y formato.
- Internacionalización propia en `es` y `ca` con diccionarios en `src/i18n`, sin librería externa.

## Entorno de desarrollo (devcontainer)

- El entorno completo vive en un devcontainer definido en `.devcontainer/devcontainer.json`. No instales Node, npm ni ninguna dependencia en el host.
- Para entrar, abre el repositorio en VS Code y ejecuta «Dev Containers: Reopen in Container». La primera vez crea la imagen y, si existe `package.json`, lanza `npm install` dentro del contenedor (`postCreateCommand`).
- Todos los comandos de la sección «Comandos» se ejecutan dentro del contenedor, desde la terminal integrada de VS Code.
- El puerto 5173 se reenvía al host (`forwardPorts`), así la app se abre en `http://localhost:5173` desde el navegador del host. Arranca el servidor con `npm run dev -- --host 0.0.0.0` para que el reenvío funcione.

## Idioma y estilo

- La interfaz y los mensajes de la app van en castellano (`es`) y catalán (`ca`); la documentación del proyecto va en español.
- Los textos de la UI viven en los diccionarios de `src/i18n/`; nunca escribas cadenas de cara al usuario directamente en los componentes.
- Los identificadores de código (componentes, funciones, variables) van en inglés.
- Componentes en PascalCase, un componente por archivo; hooks en camelCase con prefijo `use`.

## Estructura

```text
src/
├── components/   # Header, Filters, ItemForm, ItemRow, ListCard, Modal, NameForm,
│                 # ConfirmDialog, PriorityBadge, StoreBadge, LanguageSwitcher,
│                 # ThemeSwitcher, RequireAuth
├── pages/        # Login, Register, Lists, ListDetail, ByPriority, ByStore, RootRedirect
├── context/      # AuthContext, ShoppingContext (useReducer), LocaleContext y ThemeContext
├── services/     # storage.ts (único acceso a localStorage/sessionStorage),
│                 # crypto.ts (PBKDF2, AES-GCM, salt, UUID),
│                 # secureStorage.ts (lectura/escritura cifrada y migración) y auth.ts (registro/login)
├── lib/          # shopping.ts: reducer, ordenación, filtros y agrupaciones (lógica pura)
├── hooks/        # useTranslation, useLocalePath y reexport de los contextos
├── i18n/         # es.ts, ca.ts (mismas claves), detección y formateo
├── types/        # User, ShoppingList, Item, Priority, Locale, Filters
├── test/         # utilidades de prueba (renderApp, seeds)
├── styles/       # index.css, mobile-first con media queries
└── App.tsx       # rutas con prefijo de idioma y guard de autenticación
```

Notas de implementación:

- `LocaleProvider` vive dentro de la rama `/:locale/*`, así el idioma activo siempre coincide con la URL.
- `ThemeProvider` envuelve todas las rutas: aplica el tema con `data-theme` en `<html>`, lo guarda en `ldlc:theme` (vía `storage.ts`) y, si no hay preferencia, parte de `prefers-color-scheme`. Los colores de ambos temas son variables CSS en `src/styles/index.css`.
- La persistencia se hace en un `useEffect` del `ShoppingProvider` que cifra y serializa el estado cuando cambia; los componentes nunca escriben en el almacenamiento.
- Los datos de cada usuario se cifran con AES-GCM-256 y una clave derivada de la contraseña. La clave vive en `sessionStorage` (`ldlc:key:<username>`) mientras la pestaña está abierta; `localStorage` solo contiene el payload cifrado.
- `crypto.subtle` solo existe en contextos seguros (HTTPS o `localhost`). Si se abre la app por IP en HTTP, el registro y el inicio de sesión muestran un aviso explícito (`auth.cryptoUnavailable`).

## Reglas innegociables

- Ninguna llamada de red: ni `fetch`, ni backend, ni telemetría. Toda la persistencia va a `localStorage`.
- La contraseña nunca se guarda en claro; solo su hash PBKDF2 con salt.
- Los datos de usuario nunca se guardan en claro: van cifrados con AES-GCM y la clave derivada de la contraseña.
- Ninguna ruta muestra datos sin sesión activa; el guard redirige a `/login`.
- Toda lectura y escritura de `localStorage` pasa por `src/services/storage.ts`; no escribas en `localStorage` directamente desde los componentes.
- La interfaz es responsive (mobile-first con CSS, media queries y container queries): usable en PC y en móvil, con objetivos táctiles de al menos 44 px y sin depender de hover.
- Los colores de la interfaz se definen como variables CSS en `src/styles/index.css` y deben funcionar en tema claro y oscuro; no escribas colores literales en los componentes ni en reglas sueltas.
- NUNCA uses componentes, hooks o APIs marcados como deprecados, ni de React, ni de librerías, ni del navegador (por ejemplo, WebSQL). Antes de usar cualquier API, comprueba en la documentación oficial que no esté deprecada y usa el sustituto recomendado.
- Toda cadena visible de la interfaz se traduce con `src/i18n` en `es` y `ca`; el idioma se elige desde la app y por el prefijo de la URL (`/es/...`, `/ca/...`).
- No añadas dependencias nuevas sin justificarlo en el mensaje de commit.
- No hagas commit de claves, tokens ni datos de ejemplo con información real.

## Comandos

Se ejecutan desde la raíz del repositorio, siempre dentro del contenedor del devcontainer:

```bash
npm install                     # instala dependencias (dentro del contenedor)
npm run dev -- --host 0.0.0.0   # servidor de desarrollo; el puerto 5173 se reenvía al host
npm run build                   # comprobación de tipos + build de producción en dist/
npm test -- --run               # ejecuta las pruebas una vez
npm run lint                    # ejecuta ESLint sin avisos permitidos
npm run format                  # formatea con Prettier
npm run format:check            # comprueba el formato
```

Los comandos están verificados contra `package.json`. Abre la app en `http://localhost:5173` (no por IP): Web Crypto solo está disponible en contextos seguros.

## Flujo de trabajo

1. Lee [Specs.md](Specs.md) y el código afectado antes de cambiar nada.
2. Cambios mínimos: no toques lo que el encargo no pide.
3. Añade pruebas con Vitest + React Testing Library para cada funcionalidad nueva.
4. Ejecuta `npm run lint` y `npm test -- --run` antes de dar el trabajo por terminado.
5. Haz commits atómicos en Conventional Commits con el mensaje en español imperativo (por ejemplo, `feat: marcar ítem como comprado`).

## Definición de terminado

Un encargo solo está terminado cuando cumple todos estos puntos:

- [ ] El código cumple [Specs.md](Specs.md) y los criterios de aceptación de la funcionalidad afectada.
- [ ] Hay pruebas nuevas o actualizadas con Vitest + React Testing Library y `npm test -- --run` pasa sin fallos.
- [ ] `npm run lint` no da errores y el código está formateado con Prettier.
- [ ] `npm run build` genera el build de producción sin errores.
- [ ] La funcionalidad se ha comprobado en el navegador del host con `npm run dev -- --host 0.0.0.0` en `http://localhost:5173`.
- [ ] La interfaz se ha comprobado en un viewport de PC y en uno de móvil (por ejemplo, con el modo dispositivo de Chrome DevTools).
- [ ] La interfaz se ha comprobado en tema claro y en tema oscuro, y la preferencia se conserva al recargar.
- [ ] Los textos nuevos de la interfaz existen en `es` y en `ca`, y el cambio de idioma funciona desde la app y desde la URL (`/es/...`, `/ca/...`).
- [ ] No hay ninguna llamada de red nueva; la persistencia sigue pasando solo por `src/services/storage.ts` y ninguna contraseña ni dato de usuario se guarda en claro.
- [ ] Se ha ejecutado únicamente dentro del devcontainer; no se ha instalado nada en el host.
- [ ] La documentación afectada (`Specs.md`, `Agents.md`) está actualizada.
- [ ] No se ha hecho commit de claves, tokens ni datos de ejemplo reales.
- [ ] El commit es atómico, en Conventional Commits y con el mensaje en español imperativo.
