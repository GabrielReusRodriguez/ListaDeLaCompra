# Especificación de ListaDeLaCompra

Aplicación web en React para gestionar listas de la compra de forma privada: sin servidor y sin nube. Todos los datos viven en el navegador del usuario y el acceso está protegido por autenticación local.

## Objetivos

- Crear y gestionar varias listas de la compra (por ejemplo, «Semana» o «Compra del sábado»).
- Añadir ítems pendientes con nombre, cantidad, prioridad y lugar de compra.
- Marcar ítems como comprados, lo que los elimina de la lista.
- Editar y eliminar ítems pendientes en cualquier momento.
- Visualizar los pendientes ordenados por prioridad y agrupados por lugar de compra.
- Exigir autenticación local antes de mostrar o modificar cualquier dato.
- Mostrar la app en castellano y catalán, con el idioma elegible desde la app y desde la URL.

## Fuera de alcance

- Sincronización entre dispositivos, copias de seguridad en la nube o cualquier llamada de red.
- Cuentas en servidor, OAuth o autenticación con terceros.
- Aplicación móvil nativa.

## Modelo de datos

Toda la información se guarda en `localStorage` como JSON, aislada por usuario. Las claves son `ldlc:users` para las credenciales y `ldlc:data:<username>` para los datos de cada usuario.

### Usuario

| Campo | Tipo | Descripción |
|---|---|---|
| `username` | string | Nombre de usuario; clave primaria. |
| `salt` | string | Salt aleatorio de 16 bytes en base64. |
| `passwordHash` | string | Hash PBKDF2-SHA-256 de la contraseña con el salt, en base64. |
| `createdAt` | number | Fecha de registro en milisegundos. |

### Lista de la compra

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | UUID generado en el cliente con `crypto.randomUUID()`. |
| `name` | string | Nombre de la lista. |
| `createdAt` | number | Fecha de creación en milisegundos. |

### Ítem

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | UUID generado en el cliente. |
| `listId` | string | Lista a la que pertenece. |
| `name` | string | Nombre del producto. |
| `quantity` | number | Cantidad; por defecto 1. |
| `unit` | string | Unidad opcional: kg, l, paquete, etc. |
| `store` | string | Lugar de compra (ver catálogo). |
| `priority` | `'alta' \| 'media' \| 'baja'` | Prioridad del ítem. |
| `createdAt` | number | Fecha de creación en milisegundos. |
| `updatedAt` | number | Fecha de la última modificación en milisegundos. |

Un ítem no tiene estado `purchased` persistente: al marcarse como comprado se elimina definitivamente del almacenamiento, sin papelera.

### Catálogo de lugares de compra

Valores predefinidos: `supermercado`, `panadería`, `frutería`, `carnicería`, `centro comercial` y `otros`. El formulario permite también escribir un lugar personalizado como texto libre.

### Prioridades

Tres niveles ordenados de mayor a menor urgencia: `alta`, `media` (valor por defecto) y `baja`. Cada nivel se muestra con una etiqueta de color distinta.

## Autenticación local

- Registro: el usuario elige nombre de usuario y contraseña. Se genera un salt aleatorio con `crypto.getRandomValues()` y se deriva el hash con PBKDF2 (SHA-256, 100 000 iteraciones, clave de 256 bits) mediante Web Crypto API. Solo el hash y el salt se guardan; la contraseña nunca se almacena ni sale del navegador.
- Inicio de sesión: se recalcula el hash con el salt guardado y, si coincide, se abre una sesión.
- Sesión: el nombre de usuario activo se guarda en `sessionStorage` bajo `ldlc:session`, así la sesión cierra al cerrar la pestaña.
- Sin sesión activa solo son accesibles `/:locale/login` y `/:locale/registro`; cualquier otra ruta redirige a `/:locale/login`.
- Los datos de cada usuario viven bajo su propia clave, así varias personas pueden usar el mismo navegador sin ver los datos ajenos.
- Limitación conocida: esta autenticación es una barrera de conveniencia, no de seguridad; quien tenga acceso al perfil del navegador puede leer `localStorage`. TODO: valorar cifrar los datos con una clave derivada de la contraseña.

## Internacionalización (i18n)

- Idiomas soportados: castellano (`es`) y catalán (`ca`). El idioma por defecto es `es`.
- Selección por URL: todas las rutas llevan el prefijo del idioma (`/es/login`, `/ca/listas`, `/es/lista/:id`...). Al acceder a `/` se redirige con esta precedencia: idioma guardado en `localStorage` (`ldlc:lang`) → idioma del navegador (`navigator.language`) → `es`.
- Selección dentro de la app: un selector de idioma visible en todas las vistas que cambia el prefijo de la URL conservando la ruta actual.
- La preferencia elegida se guarda en `ldlc:lang` en `localStorage`.
- Los textos de la interfaz viven en diccionarios paralelos `src/i18n/es.ts` y `src/i18n/ca.ts` con las mismas claves, servidos por un `LocaleContext` y un hook `useTranslation`. Sin librería de i18n externa.
- El atributo `lang` del documento se actualiza al idioma activo y las fechas se formatean con `Intl.DateTimeFormat` según el idioma.
- Los datos del usuario (nombres de listas e ítems, lugares personalizados) no se traducen; solo las etiquetas fijas de la interfaz. Los valores predefinidos del catálogo de lugares y las prioridades se muestran traducidos, pero se guardan como identificadores estables.

## Funcionalidades

### Gestión de listas

- Crear, renombrar y eliminar listas. Al eliminar una lista se eliminan también todos sus ítems.
- Seleccionar la lista activa desde la vista general.

### Gestión de ítems

- Crear un ítem con nombre (obligatorio), cantidad, unidad, lugar de compra y prioridad.
- Editar cualquiera de esos campos en cualquier momento.
- Eliminar un ítem pendiente.
- Marcar como comprado: el ítem desaparece de la vista y se elimina del almacenamiento.

### Visualizaciones

- Vista de lista (`/:locale/lista/:id`): pendientes de la lista activa ordenados por prioridad y, dentro de cada prioridad, por fecha de creación.
- Vista por prioridad (`/:locale/por-prioridad`): pendientes de todas las listas ordenados `alta` → `media` → `baja`, mostrando la lista y el lugar de cada ítem.
- Vista por lugar (`/:locale/por-lugar`): pendientes agrupados por lugar de compra y, dentro de cada grupo, ordenados por prioridad.
- Buscador por nombre y filtros por lista, prioridad y lugar aplicables a las tres vistas.

## Diseño responsive

- Enfoque mobile-first: la base del CSS está pensada para pantallas pequeñas y las media queries añaden estilos para pantallas mayores (por ejemplo, desde 768 px para tablet y desde 1024 px para escritorio).
- Una columna en móvil; varias columnas en escritorio para las vistas de listas y agrupaciones.
- La navegación se adapta al ancho: en móvil, menú compacto; en escritorio, barra completa.
- Objetivos táctiles de al menos 44 × 44 px y ninguna interacción que dependa de hover.
- Meta viewport configurada (`width=device-width, initial-scale=1`) y sin scroll horizontal en ningún ancho de pantalla.

## Requisitos técnicos

- React 18 con Vite y TypeScript.
- React Router para las rutas con prefijo de idioma: `/:locale/login`, `/:locale/registro`, `/:locale/listas`, `/:locale/lista/:id`, `/:locale/por-prioridad` y `/:locale/por-lugar`.
- Internacionalización propia en `es` y `ca` con diccionarios en `src/i18n` y prefijo de idioma en la URL; sin librería de i18n externa.
- Estado global con React Context y `useReducer`; toda la persistencia pasa por un servicio `storage.ts` que serializa a `localStorage`.
- Hash de contraseñas con Web Crypto API (PBKDF2) y UUID con `crypto.randomUUID()`.
- Cero llamadas de red: sin `fetch`, sin backend y sin telemetría.
- Pruebas con Vitest y React Testing Library que cubran registro, inicio de sesión, crear/editar/eliminar ítem, marcar como comprado y las agrupaciones por prioridad y lugar.
- Accesibilidad básica: etiquetas en todos los campos, foco visible y contraste suficiente.
- Entorno de desarrollo en devcontainer (`.devcontainer/devcontainer.json`); las dependencias se instalan dentro del contenedor y no se instala nada en el host.
- Diseño responsive con CSS plano y media queries (mobile-first), sin librería de componentes UI; la app debe ser usable en pantallas de PC y de móvil.

## Criterios de aceptación

- [ ] Sin sesión iniciada no es posible ver ni modificar ningún dato.
- [ ] El registro guarda únicamente el hash de la contraseña, nunca la contraseña en claro.
- [ ] Los ítems se crean, editan y eliminan, y al marcarlos como comprados desaparecen.
- [ ] Existen vistas ordenadas por prioridad y agrupadas por lugar de compra.
- [ ] Tras recargar la página los datos siguen disponibles.
- [ ] Ninguna funcionalidad utiliza la red.
- [ ] La interfaz se adapta y es usable en pantallas de PC y de móvil, comprobado en ambos tamaños de viewport.
- [ ] La app está disponible en castellano y catalán, y el idioma se puede elegir desde la app y desde la URL (`/es/...` y `/ca/...`).
