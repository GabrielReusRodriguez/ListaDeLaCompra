export const es: Dictionary = {
  appName: 'Lista de la compra',
  appTagline: 'Privada, local y sin nube',
  language: 'Idioma',
  languageEs: 'Castellano',
  languageCa: 'Català',

  theme: {
    light: 'Claro',
    dark: 'Oscuro',
    switchToLight: 'Cambiar a tema claro',
    switchToDark: 'Cambiar a tema oscuro',
  },

  nav: {
    lists: 'Listas',
    byPriority: 'Por prioridad',
    byStore: 'Por lugar',
    logout: 'Cerrar sesión',
    menu: 'Menú',
  },

  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    add: 'Añadir',
    close: 'Cerrar',
    loading: 'Cargando…',
    confirm: 'Confirmar',
    required: 'Este campo es obligatorio.',
    none: '—',
  },

  auth: {
    loginTitle: 'Iniciar sesión',
    registerTitle: 'Crear cuenta',
    username: 'Nombre de usuario',
    password: 'Contraseña',
    passwordConfirm: 'Repite la contraseña',
    loginAction: 'Entrar',
    registerAction: 'Registrarme',
    toRegister: '¿No tienes cuenta? Regístrate',
    toLogin: '¿Ya tienes cuenta? Inicia sesión',
    invalidCredentials: 'Usuario o contraseña incorrectos.',
    userExists: 'Ese nombre de usuario ya está en uso.',
    invalidInput: 'Revisa los datos del formulario.',
    usernameHint: 'De 3 a 32 caracteres: letras, números, punto, guion o guion bajo.',
    passwordHint: 'Mínimo 6 caracteres.',
    passwordMismatch: 'Las contraseñas no coinciden.',
    cryptoUnavailable:
      'El navegador no permite cifrar la contraseña en este contexto. Abre la app en HTTPS o en localhost.',
    localOnly:
      'Tus datos se guardan solo en este navegador. La contraseña nunca se almacena en claro.',
    loggedInAs: 'Sesión iniciada como {username}',
  },

  lists: {
    title: 'Tus listas',
    empty: 'Todavía no tienes listas. Crea la primera.',
    newList: 'Nueva lista',
    listName: 'Nombre de la lista',
    rename: 'Renombrar lista',
    deleteTitle: 'Eliminar lista',
    deleteConfirm:
      'Se eliminará la lista «{name}» y todos sus ítems. Esta acción no se puede deshacer.',
    itemCount: '{count} ítems pendientes',
    itemCountOne: '1 ítem pendiente',
    itemCountZero: 'Sin ítems pendientes',
    open: 'Abrir lista',
  },

  detail: {
    title: 'Lista',
    empty: 'No hay ítems pendientes en esta lista.',
    emptyFiltered: 'Ningún ítem coincide con los filtros.',
    notFound: 'La lista no existe o se ha eliminado.',
    backToLists: 'Volver a las listas',
  },

  byPriority: {
    title: 'Pendientes por prioridad',
    empty: 'No hay ítems pendientes.',
    emptyFiltered: 'Ningún ítem coincide con los filtros.',
  },

  byStore: {
    title: 'Pendientes por lugar de compra',
    empty: 'No hay ítems pendientes.',
    emptyFiltered: 'Ningún ítem coincide con los filtros.',
  },

  item: {
    newItem: 'Añadir ítem',
    editItem: 'Editar ítem',
    name: 'Producto',
    quantity: 'Cantidad',
    unit: 'Unidad',
    unitPlaceholder: 'kg, l, paquete…',
    store: 'Lugar de compra',
    storeCustom: 'Otro lugar',
    storeCustomPlaceholder: 'Escribe el lugar',
    priority: 'Prioridad',
    list: 'Lista',
    markPurchased: 'Marcar como comprado',
    purchased: 'Comprado',
    deleteTitle: 'Eliminar ítem',
    deleteConfirm: 'Se eliminará «{name}» de la lista.',
    quantityLabel: 'Cantidad: {quantity}',
    invalidQuantity: 'La cantidad debe ser mayor que 0.',
    invalidName: 'Escribe el nombre del producto.',
    invalidStore: 'Elige o escribe un lugar de compra.',
    invalidList: 'Elige una lista.',
  },

  priority: {
    alta: 'Alta',
    media: 'Media',
    baja: 'Baja',
  },

  store: {
    supermercado: 'Supermercado',
    panaderia: 'Panadería',
    fruteria: 'Frutería',
    carniceria: 'Carnicería',
    farmacia: 'Farmacia',
    papeleria: 'Papelería',
    'centro-comercial': 'Centro comercial',
    otros: 'Otros',
  },

  filters: {
    legend: 'Buscar y filtrar',
    search: 'Buscar por nombre',
    searchPlaceholder: 'Buscar…',
    list: 'Lista',
    priority: 'Prioridad',
    store: 'Lugar',
    all: 'Todos',
    allLists: 'Todas las listas',
    allPriorities: 'Todas las prioridades',
    allStores: 'Todos los lugares',
    clear: 'Limpiar filtros',
    resultCount: '{count} resultados',
    resultCountOne: '1 resultado',
    resultCountZero: 'Sin resultados',
  },

  a11y: {
    mainNavigation: 'Navegación principal',
    skipToContent: 'Saltar al contenido',
  },
};

/**
 * Forma de los diccionarios. `ca` se tipa contra este tipo, así que TypeScript
 * falla si a un idioma le falta o le sobra una clave.
 */
export interface Dictionary {
  appName: string;
  appTagline: string;
  language: string;
  languageEs: string;
  languageCa: string;
  theme: { light: string; dark: string; switchToLight: string; switchToDark: string };
  nav: { lists: string; byPriority: string; byStore: string; logout: string; menu: string };
  common: {
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    add: string;
    close: string;
    loading: string;
    confirm: string;
    required: string;
    none: string;
  };
  auth: {
    loginTitle: string;
    registerTitle: string;
    username: string;
    password: string;
    passwordConfirm: string;
    loginAction: string;
    registerAction: string;
    toRegister: string;
    toLogin: string;
    invalidCredentials: string;
    userExists: string;
    invalidInput: string;
    usernameHint: string;
    passwordHint: string;
    passwordMismatch: string;
    cryptoUnavailable: string;
    localOnly: string;
    loggedInAs: string;
  };
  lists: {
    title: string;
    empty: string;
    newList: string;
    listName: string;
    rename: string;
    deleteTitle: string;
    deleteConfirm: string;
    itemCount: string;
    itemCountOne: string;
    itemCountZero: string;
    open: string;
  };
  detail: {
    title: string;
    empty: string;
    emptyFiltered: string;
    notFound: string;
    backToLists: string;
  };
  byPriority: { title: string; empty: string; emptyFiltered: string };
  byStore: { title: string; empty: string; emptyFiltered: string };
  item: {
    newItem: string;
    editItem: string;
    name: string;
    quantity: string;
    unit: string;
    unitPlaceholder: string;
    store: string;
    storeCustom: string;
    storeCustomPlaceholder: string;
    priority: string;
    list: string;
    markPurchased: string;
    purchased: string;
    deleteTitle: string;
    deleteConfirm: string;
    quantityLabel: string;
    invalidQuantity: string;
    invalidName: string;
    invalidStore: string;
    invalidList: string;
  };
  priority: { alta: string; media: string; baja: string };
  store: {
    supermercado: string;
    panaderia: string;
    fruteria: string;
    carniceria: string;
    farmacia: string;
    papeleria: string;
    'centro-comercial': string;
    otros: string;
  };
  filters: {
    legend: string;
    search: string;
    searchPlaceholder: string;
    list: string;
    priority: string;
    store: string;
    all: string;
    allLists: string;
    allPriorities: string;
    allStores: string;
    clear: string;
    resultCount: string;
    resultCountOne: string;
    resultCountZero: string;
  };
  a11y: { mainNavigation: string; skipToContent: string };
}
