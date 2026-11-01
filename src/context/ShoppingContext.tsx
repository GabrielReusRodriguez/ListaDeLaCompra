import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ShoppingList, Item, ShoppingState, ShoppingAction } from '../types';
import storage from '../services/storage';
import { getActiveUser } from '../services/auth';

const initialState: ShoppingState = {
  lists: [],
  items: [],
  activeListId: null,
};

function shoppingReducer(state: ShoppingState, action: ShoppingAction): ShoppingState {
  switch (action.type) {
    case 'SET_LISTS':
      return { ...state, lists: action.payload };
    case 'ADD_LIST':
      return { ...state, lists: [...state.lists, action.payload] };
    case 'UPDATE_LIST':
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.id ? { ...list, name: action.payload.name } : list
        ),
      };
    case 'DELETE_LIST':
      return {
        ...state,
        lists: state.lists.filter(list => list.id !== action.payload),
        items: state.items.filter(item => item.listId !== action.payload),
        activeListId: state.activeListId === action.payload ? null : state.activeListId,
      };
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? { ...action.payload, updatedAt: Date.now() } : item
        ),
      };
    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter(item => item.id !== action.payload) };
    case 'SET_ACTIVE_LIST':
      return { ...state, activeListId: action.payload };
    case 'MARK_AS_PURCHASED':
      return { ...state, items: state.items.filter(item => item.id !== action.payload) };
    default:
      return state;
  }
}

interface ShoppingContextType extends ShoppingState {
  addList: (name: string) => void;
  updateList: (id: string, name: string) => void;
  deleteList: (id: string) => void;
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (item: Item) => void;
  deleteItem: (id: string) => void;
  markAsPurchased: (id: string) => void;
  setActiveList: (id: string | null) => void;
  saveData: () => void;
  loadData: () => void;
}

const ShoppingContext = createContext<ShoppingContextType | undefined>(undefined);

interface ShoppingProviderProps {
  children: ReactNode;
}

export function ShoppingProvider({ children }: ShoppingProviderProps) {
  const [state, dispatch] = useReducer(shoppingReducer, initialState);

  const username = getActiveUser();

  useEffect(() => {
    if (username) {
      loadData();
    }
  }, [username]);

  const loadData = () => {
    if (!username) return;
    const data = storage.getAppData(username);
    dispatch({ type: 'SET_LISTS', payload: data.lists });
    dispatch({ type: 'SET_ITEMS', payload: data.items });
  };

  const saveData = () => {
    if (!username) return;
    const data = { lists: state.lists, items: state.items };
    storage.saveAppData(username, data);
  };

  const addList = (name: string) => {
    const newList: ShoppingList = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
    };
    dispatch({ type: 'ADD_LIST', payload: newList });
    saveData();
  };

  const updateList = (id: string, name: string) => {
    dispatch({ type: 'UPDATE_LIST', payload: { id, name } });
    saveData();
  };

  const deleteList = (id: string) => {
    dispatch({ type: 'DELETE_LIST', payload: id });
    saveData();
  };

  const addItem = (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: Item = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: 'ADD_ITEM', payload: newItem });
    saveData();
  };

  const updateItem = (item: Item) => {
    dispatch({ type: 'UPDATE_ITEM', payload: item });
    saveData();
  };

  const deleteItem = (id: string) => {
    dispatch({ type: 'DELETE_ITEM', payload: id });
    saveData();
  };

  const markAsPurchased = (id: string) => {
    dispatch({ type: 'MARK_AS_PURCHASED', payload: id });
    saveData();
  };

  const setActiveList = (id: string | null) => {
    dispatch({ type: 'SET_ACTIVE_LIST', payload: id });
  };

  const value: ShoppingContextType = {
    ...state,
    addList,
    updateList,
    deleteList,
    addItem,
    updateItem,
    deleteItem,
    markAsPurchased,
    setActiveList,
    saveData,
    loadData,
  };

  return <ShoppingContext.Provider value={value}>{children}</ShoppingContext.Provider>;
}

export function useShopping(): ShoppingContextType {
  const context = useContext(ShoppingContext);
  if (context === undefined) {
    throw new Error('useShopping must be used within a ShoppingProvider');
  }
  return context;
}

export default ShoppingContext;
