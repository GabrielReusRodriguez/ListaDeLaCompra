import type { Dictionary } from './es';

export const ca: Dictionary = {
  appName: 'Llista de la compra',
  appTagline: 'Privada, local i sense núvol',
  language: 'Idioma',
  languageEs: 'Castellano',
  languageCa: 'Català',

  theme: {
    light: 'Clar',
    dark: 'Fosc',
    switchToLight: 'Canvia al tema clar',
    switchToDark: 'Canvia al tema fosc',
  },

  nav: {
    lists: 'Llistes',
    byPriority: 'Per prioritat',
    byStore: 'Per lloc',
    logout: 'Tancar la sessió',
    menu: 'Menú',
  },

  common: {
    save: 'Desa',
    cancel: 'Cancel·la',
    edit: 'Edita',
    delete: 'Elimina',
    add: 'Afegeix',
    close: 'Tanca',
    loading: 'Carregant…',
    confirm: 'Confirma',
    required: 'Aquest camp és obligatori.',
    none: '—',
  },

  auth: {
    loginTitle: 'Inicia la sessió',
    registerTitle: 'Crea un compte',
    username: "Nom d'usuari",
    password: 'Contrasenya',
    passwordConfirm: 'Repeteix la contrasenya',
    loginAction: 'Entra',
    registerAction: "Registra'm",
    toRegister: 'No tens compte? Registra’t',
    toLogin: 'Ja tens compte? Inicia la sessió',
    invalidCredentials: 'Usuari o contrasenya incorrectes.',
    userExists: "Aquest nom d'usuari ja està en ús.",
    invalidInput: 'Revisa les dades del formulari.',
    usernameHint: 'De 3 a 32 caràcters: lletres, xifres, punt, guionet o guió baix.',
    passwordHint: 'Mínim 6 caràcters.',
    passwordMismatch: 'Les contrasenyes no coincideixen.',
    cryptoUnavailable:
      'El navegador no permet xifrar la contrasenya en aquest context. Obre l’aplicació en HTTPS o en localhost.',
    localOnly:
      'Les teves dades es guarden xifrades només en aquest navegador. La contrasenya no s’emmagatzema mai en clar.',
    loggedInAs: 'Sessió iniciada com a {username}',
  },

  lists: {
    title: 'Les teves llistes',
    empty: 'Encara no tens cap llista. Crea la primera.',
    newList: 'Nova llista',
    listName: 'Nom de la llista',
    rename: 'Canvia el nom de la llista',
    deleteTitle: 'Elimina la llista',
    deleteConfirm:
      'S’eliminarà la llista «{name}» i tots els seus ítems. Aquesta acció no es pot desfer.',
    itemCount: '{count} ítems pendents',
    itemCountOne: '1 ítem pendent',
    itemCountZero: 'Sense ítems pendents',
    open: 'Obre la llista',
  },

  detail: {
    title: 'Llista',
    empty: 'No hi ha ítems pendents en aquesta llista.',
    emptyFiltered: 'Cap ítem coincideix amb els filtres.',
    notFound: 'La llista no existeix o s’ha eliminat.',
    backToLists: 'Torna a les llistes',
  },

  byPriority: {
    title: 'Pendents per prioritat',
    empty: 'No hi ha ítems pendents.',
    emptyFiltered: 'Cap ítem coincideix amb els filtres.',
  },

  byStore: {
    title: 'Pendents per lloc de compra',
    empty: 'No hi ha ítems pendents.',
    emptyFiltered: 'Cap ítem coincideix amb els filtres.',
  },

  item: {
    newItem: 'Afegeix un ítem',
    editItem: 'Edita l’ítem',
    name: 'Producte',
    quantity: 'Quantitat',
    unit: 'Unitat',
    unitPlaceholder: 'kg, l, paquet…',
    store: 'Lloc de compra',
    storeCustom: 'Un altre lloc',
    storeCustomPlaceholder: 'Escriu el lloc',
    priority: 'Prioritat',
    list: 'Llista',
    markPurchased: 'Marca com a comprat',
    purchased: 'Comprat',
    deleteTitle: 'Elimina l’ítem',
    deleteConfirm: 'S’eliminarà «{name}» de la llista.',
    quantityLabel: 'Quantitat: {quantity}',
    invalidQuantity: 'La quantitat ha de ser més gran que 0.',
    invalidName: 'Escriu el nom del producte.',
    invalidStore: 'Tria o escriu un lloc de compra.',
    invalidList: 'Tria una llista.',
  },

  priority: {
    alta: 'Alta',
    media: 'Mitjana',
    baja: 'Baixa',
  },

  store: {
    supermercado: 'Supermercat',
    panaderia: 'Fleca',
    fruteria: 'Fruiteria',
    carniceria: 'Carnisseria',
    farmacia: 'Farmàcia',
    papeleria: 'Papereria',
    'centro-comercial': 'Centre comercial',
    otros: 'Altres',
  },

  filters: {
    legend: 'Cerca i filtra',
    search: 'Cerca pel nom',
    searchPlaceholder: 'Cerca…',
    list: 'Llista',
    priority: 'Prioritat',
    store: 'Lloc',
    all: 'Tots',
    allLists: 'Totes les llistes',
    allPriorities: 'Totes les prioritats',
    allStores: 'Tots els llocs',
    clear: 'Neteja els filtres',
    resultCount: '{count} resultats',
    resultCountOne: '1 resultat',
    resultCountZero: 'Sense resultats',
  },

  a11y: {
    mainNavigation: 'Navegació principal',
    skipToContent: 'Ves al contingut',
  },
};
