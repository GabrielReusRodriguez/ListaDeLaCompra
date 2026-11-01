# Lista de la compra

Aplicación web para gestionar listas de la compra de forma **privada y 100 % local**: sin servidor, sin nube y sin ninguna llamada de red. Los datos se guardan cifrados en el `localStorage` del navegador y el acceso está protegido por autenticación local.

La especificación funcional completa está en [Specs.md](Specs.md) y las instrucciones para agentes en [Agents.md](Agents.md).

## Funcionalidades

- Varias listas de la compra: crear, renombrar y eliminar (borra también sus ítems).
- Ítems con nombre, cantidad, unidad, lugar de compra y prioridad (`alta`, `media`, `baja`).
- Crear, editar, eliminar y marcar como comprado (el ítem desaparece del almacenamiento).
- Vista de lista ordenada por prioridad; vista por prioridad de todas las listas; vista agrupada por lugar de compra.
- Buscador por nombre y filtros por lista, prioridad y lugar en las tres vistas.
- Registro e inicio de sesión local con PBKDF2-SHA-256 (100 000 iteraciones).
- Datos cifrados en el navegador con AES-GCM-256 y una clave derivada de la contraseña.
- Castellano y catalán, elegibles desde la app o por el prefijo de la URL (`/es/...`, `/ca/...`).
- Tema claro u oscuro, elegible con un botón y persistente entre sesiones; si no se ha elegido, respeta `prefers-color-scheme`.
- Diseño responsive mobile-first, con objetivos táctiles de al menos 44 × 44 px.

## Stack

Vite 5 · React 18 · TypeScript 5 · React Router 6 · Vitest + React Testing Library · ESLint + Prettier. Sin librerías de UI ni de i18n.

## Puesta en marcha

Todo se ejecuta **dentro del devcontainer** (`.devcontainer/devcontainer.json`); no instales nada en el host.

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Abre `http://localhost:5173`. Usa `localhost` y no la IP de la máquina: Web Crypto (necesaria para el hash de contraseñas y el cifrado de datos) solo está disponible en contextos seguros.

## Scripts

| Comando                           | Descripción                                                 |
| --------------------------------- | ----------------------------------------------------------- |
| `npm run dev`                     | Servidor de desarrollo con recarga en caliente.             |
| `npm run build`                   | Comprueba tipos y genera el build de producción en `dist/`. |
| `npm run preview`                 | Sirve el build de producción.                               |
| `npm test -- --run`               | Ejecuta las pruebas una vez.                                |
| `npm run lint`                    | ESLint sin avisos permitidos.                               |
| `npm run format` / `format:check` | Formatea o comprueba el formato con Prettier.               |

## CI/CD y despliegue

- **CI (GitHub Actions)**: en cada push y pull request a `main` se ejecutan `lint`, `format:check`, las pruebas (`vitest --run`) y el `build` (`.github/workflows/ci.yml`).
- **Dependabot**: revisa semanalmente las dependencias npm y abre PRs con las actualizaciones (`.github/dependabot.yml`).
- **Despliegue (Cloudflare Pages)**: conecta el repositorio en Workers & Pages → Pages con build command `npm run build` y directorio de salida `dist`. El build usa rutas relativas (`base: './'` en `vite.config.ts`), así que funciona en cualquier subdominio `*.pages.dev`.

## Estructura

```text
src/
├── components/   # Header, Filters, ItemForm, ItemRow, ListCard, Modal...
├── pages/        # Login, Register, Lists, ListDetail, ByPriority, ByStore
├── context/      # AuthContext, ShoppingContext (useReducer), LocaleContext, ThemeContext
├── services/     # storage.ts (único acceso al almacenamiento), crypto.ts, secureStorage.ts, auth.ts
├── lib/          # shopping.ts: reducer, ordenación, filtros y agrupaciones
├── hooks/        # useTranslation, useLocalePath, useTheme
├── i18n/         # diccionarios es/ca, detección de idioma y formateo
├── types/        # modelo de datos
├── test/         # utilidades de prueba
└── styles/       # index.css (mobile-first)
```

## Almacenamiento

| Clave                 | Dónde            | Contenido                                                               |
| --------------------- | ---------------- | ----------------------------------------------------------------------- |
| `ldlc:users`          | `localStorage`   | Credenciales: usuario, salt y hash PBKDF2. Nunca la contraseña.         |
| `ldlc:data:<usuario>` | `localStorage`   | Listas e ítems de cada usuario, cifrados con AES-GCM-256.               |
| `ldlc:lang`           | `localStorage`   | Idioma elegido.                                                         |
| `ldlc:theme`          | `localStorage`   | Tema de la interfaz (`light` o `dark`).                                 |
| `ldlc:session`        | `sessionStorage` | Usuario con la sesión abierta; se pierde al cerrar la pestaña.          |
| `ldlc:key:<usuario>`  | `sessionStorage` | Clave AES-GCM (JWK) derivada de la contraseña; nunca en `localStorage`. |

> La clave de cifrado vive en `sessionStorage` mientras la pestaña está abierta, así que con la sesión iniciada se puede descifrar desde DevTools. La protección real es frente al dato en reposo: un volcado de `localStorage`, una copia de seguridad o la sincronización del navegador solo contienen texto cifrado.

## Rutas

`/:locale/login`, `/:locale/registro`, `/:locale/listas`, `/:locale/lista/:id`, `/:locale/por-prioridad` y `/:locale/por-lugar`, con `locale` igual a `es` o `ca`. Sin sesión activa solo son accesibles login y registro; el resto redirige a `/:locale/login`.

## Licencia

Ver [LICENSE](LICENSE).
