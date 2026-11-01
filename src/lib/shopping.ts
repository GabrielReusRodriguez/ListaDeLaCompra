import {
  PRIORITIES,
  type Filters,
  type Item,
  type ItemInput,
  type Priority,
  type ShoppingList,
  type UserData,
} from '../types';

/* --------------------------------- Reducer -------------------------------- */

export interface ShoppingState extends UserData {
  loaded: boolean;
}

export type ShoppingAction =
  | { type: 'LOAD'; payload: UserData }
  | { type: 'RESET' }
  | { type: 'ADD_LIST'; payload: ShoppingList }
  | { type: 'RENAME_LIST'; payload: { id: string; name: string } }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'UPDATE_ITEM'; payload: Item }
  | { type: 'DELETE_ITEM'; payload: string };

export const initialShoppingState: ShoppingState = {
  lists: [],
  items: [],
  loaded: false,
};

export function shoppingReducer(state: ShoppingState, action: ShoppingAction): ShoppingState {
  switch (action.type) {
    case 'LOAD':
      return { lists: action.payload.lists, items: action.payload.items, loaded: true };
    case 'RESET':
      return initialShoppingState;
    case 'ADD_LIST':
      return { ...state, lists: [...state.lists, action.payload] };
    case 'RENAME_LIST':
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.payload.id ? { ...list, name: action.payload.name } : list,
        ),
      };
    case 'DELETE_LIST':
      return {
        ...state,
        lists: state.lists.filter((list) => list.id !== action.payload),
        items: state.items.filter((item) => item.listId !== action.payload),
      };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item) => (item.id === action.payload.id ? action.payload : item)),
      };
    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) };
    default:
      return state;
  }
}

/* ------------------------------ Construcción ------------------------------ */

export function buildList(name: string, now: number, id: string): ShoppingList {
  return { id, name: name.trim(), createdAt: now };
}

export function buildItem(input: ItemInput, now: number, id: string): Item {
  return {
    id,
    listId: input.listId,
    name: input.name.trim(),
    quantity: input.quantity,
    unit: input.unit.trim(),
    store: input.store.trim(),
    priority: input.priority,
    createdAt: now,
    updatedAt: now,
  };
}

export function applyItemInput(item: Item, input: ItemInput, now: number): Item {
  return {
    ...item,
    listId: input.listId,
    name: input.name.trim(),
    quantity: input.quantity,
    unit: input.unit.trim(),
    store: input.store.trim(),
    priority: input.priority,
    updatedAt: now,
  };
}

/* -------------------------------- Ordenación ------------------------------- */

export function priorityRank(priority: Priority): number {
  return PRIORITIES.indexOf(priority);
}

/** Prioridad ascendente (alta primero) y, a igual prioridad, creación más antigua primero. */
export function compareByPriority(a: Item, b: Item): number {
  const byPriority = priorityRank(a.priority) - priorityRank(b.priority);
  if (byPriority !== 0) return byPriority;
  if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
  return a.name.localeCompare(b.name);
}

export function sortByPriority(items: Item[]): Item[] {
  return [...items].sort(compareByPriority);
}

export function sortByCreatedAt(items: Item[]): Item[] {
  return [...items].sort((a, b) => a.createdAt - b.createdAt || a.name.localeCompare(b.name));
}

/* -------------------------------- Filtrado -------------------------------- */

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function filterItems(items: Item[], filters: Filters): Item[] {
  const needle = normalizeText(filters.search);
  return items.filter((item) => {
    if (filters.listId !== 'all' && item.listId !== filters.listId) return false;
    if (filters.priority !== 'all' && item.priority !== filters.priority) return false;
    if (filters.store !== 'all' && item.store !== filters.store) return false;
    if (needle && !normalizeText(item.name).includes(needle)) return false;
    return true;
  });
}

/* ------------------------------ Agrupaciones ------------------------------ */

export interface PriorityGroup {
  priority: Priority;
  items: Item[];
}

/** Agrupa por prioridad en orden alta → media → baja, omitiendo grupos vacíos. */
export function groupByPriority(items: Item[]): PriorityGroup[] {
  const sorted = sortByPriority(items);
  return PRIORITIES.map((priority) => ({
    priority,
    items: sorted.filter((item) => item.priority === priority),
  })).filter((group) => group.items.length > 0);
}

export interface StoreGroup {
  store: string;
  items: Item[];
}

/** Agrupa por lugar (orden alfabético) y ordena cada grupo por prioridad. */
export function groupByStore(items: Item[]): StoreGroup[] {
  const groups = new Map<string, Item[]>();
  for (const item of items) {
    const key = item.store || 'otros';
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([store, groupItems]) => ({ store, items: sortByPriority(groupItems) }));
}

/** Lugares presentes en los ítems, para el filtro. */
export function collectStores(items: Item[]): string[] {
  return [...new Set(items.map((item) => item.store || 'otros'))].sort((a, b) =>
    a.localeCompare(b),
  );
}
