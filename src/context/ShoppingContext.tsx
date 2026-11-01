import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import type { Item, ItemInput, ShoppingList } from '../types';
import { loadData, persistData } from '../services/secureStorage';
import { createId } from '../services/crypto';
import {
  applyItemInput,
  buildItem,
  buildList,
  initialShoppingState,
  shoppingReducer,
  type ShoppingState,
} from '../lib/shopping';
import { useAuth } from './AuthContext';

export interface ShoppingContextValue extends ShoppingState {
  /** `true` mientras se descifran los datos del usuario activo. */
  loading: boolean;
  addList: (name: string) => ShoppingList | null;
  renameList: (id: string, name: string) => void;
  deleteList: (id: string) => void;
  addItem: (input: ItemInput) => Item | null;
  updateItem: (id: string, input: ItemInput) => void;
  deleteItem: (id: string) => void;
  markAsPurchased: (id: string) => void;
}

export const ShoppingContext = createContext<ShoppingContextValue | null>(null);

interface ShoppingProviderProps {
  children: ReactNode;
}

export function ShoppingProvider({ children }: ShoppingProviderProps) {
  const { username, dataKey } = useAuth();
  const [state, dispatch] = useReducer(shoppingReducer, initialShoppingState);
  // Los datos se descifran de forma asíncrona: mientras tanto no se muestra "vacío".
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!username || !dataKey) {
      setLoading(false);
      dispatch({ type: 'RESET' });
      return;
    }
    let cancelled = false;
    setLoading(true);
    void loadData(dataKey, username).then(({ data }) => {
      if (cancelled) return;
      dispatch({ type: 'LOAD', payload: data });
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [username, dataKey]);

  // Persistencia: cada cambio de datos se cifra y se guarda en la clave del usuario activo.
  useEffect(() => {
    if (!username || !dataKey || !state.loaded) return;
    void persistData(dataKey, username, { lists: state.lists, items: state.items });
  }, [username, dataKey, state.loaded, state.lists, state.items]);

  const addList = useCallback((name: string): ShoppingList | null => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const list = buildList(trimmed, Date.now(), createId());
    dispatch({ type: 'ADD_LIST', payload: list });
    return list;
  }, []);

  const renameList = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch({ type: 'RENAME_LIST', payload: { id, name: trimmed } });
  }, []);

  const deleteList = useCallback((id: string) => {
    dispatch({ type: 'DELETE_LIST', payload: id });
  }, []);

  const addItem = useCallback((input: ItemInput): Item | null => {
    if (!input.name.trim() || !input.listId) return null;
    const item = buildItem(input, Date.now(), createId());
    dispatch({ type: 'ADD_ITEM', payload: item });
    return item;
  }, []);

  const updateItem = useCallback(
    (id: string, input: ItemInput) => {
      if (!input.name.trim() || !input.listId) return;
      const current = state.items.find((item) => item.id === id);
      if (!current) return;
      dispatch({ type: 'UPDATE_ITEM', payload: applyItemInput(current, input, Date.now()) });
    },
    [state.items],
  );

  const deleteItem = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ITEM', payload: id });
  }, []);

  const markAsPurchased = useCallback((id: string) => {
    // Un ítem comprado se elimina definitivamente del almacenamiento.
    dispatch({ type: 'DELETE_ITEM', payload: id });
  }, []);

  const value = useMemo<ShoppingContextValue>(
    () => ({
      ...state,
      loading,
      addList,
      renameList,
      deleteList,
      addItem,
      updateItem,
      deleteItem,
      markAsPurchased,
    }),
    [
      state,
      loading,
      addList,
      renameList,
      deleteList,
      addItem,
      updateItem,
      deleteItem,
      markAsPurchased,
    ],
  );

  return <ShoppingContext.Provider value={value}>{children}</ShoppingContext.Provider>;
}

export function useShopping(): ShoppingContextValue {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error('useShopping debe usarse dentro de ShoppingProvider');
  }
  return context;
}
