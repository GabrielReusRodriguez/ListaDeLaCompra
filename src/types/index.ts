export type Priority = 'alta' | 'media' | 'baja';

export type Store = 
  | 'supermercado'
  | 'panaderia'
  | 'fruteria'
  | 'carniceria'
  | 'centro comercial'
  | 'otros';

export interface User {
  username: string;
  salt: string;
  passwordHash: string;
  createdAt: number;
}

export interface ShoppingList {
  id: string;
  name: string;
  createdAt: number;
}

export interface Item {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  unit?: string;
  store: Store | string;
  priority: Priority;
  createdAt: number;
  updatedAt: number;
}

export interface AppData {
  lists: ShoppingList[];
  items: Item[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface ShoppingState {
  lists: ShoppingList[];
  items: Item[];
  activeListId: string | null;
}

export type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER'; payload: User };

export type ShoppingAction =
  | { type: 'SET_LISTS'; payload: ShoppingList[] }
  | { type: 'ADD_LIST'; payload: ShoppingList }
  | { type: 'UPDATE_LIST'; payload: { id: string; name: string } }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'SET_ITEMS'; payload: Item[] }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'UPDATE_ITEM'; payload: Item }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'SET_ACTIVE_LIST'; payload: string | null }
  | { type: 'MARK_AS_PURCHASED'; payload: string };
