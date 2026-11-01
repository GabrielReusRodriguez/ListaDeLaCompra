import { describe, expect, it } from 'vitest';
import {
  buildItem,
  buildList,
  collectStores,
  filterItems,
  groupByPriority,
  groupByStore,
  normalizeText,
  shoppingReducer,
  sortByPriority,
  type ShoppingState,
} from './shopping';
import { createEmptyFilters, type Item } from '../types';

function item(partial: Partial<Item> & Pick<Item, 'id' | 'name'>): Item {
  return {
    listId: 'l1',
    quantity: 1,
    unit: '',
    store: 'supermercado',
    priority: 'media',
    createdAt: 0,
    updatedAt: 0,
    ...partial,
  };
}

const alta = item({ id: 'a', name: 'Pan', priority: 'alta', createdAt: 3 });
const media = item({ id: 'm', name: 'Leche', priority: 'media', createdAt: 1 });
const baja = item({ id: 'b', name: 'Galletas', priority: 'baja', createdAt: 2 });
const mediaVieja = item({ id: 'm2', name: 'Huevos', priority: 'media', createdAt: 0 });

const state: ShoppingState = {
  lists: [buildList('Semana', 1, 'l1'), buildList('Sábado', 2, 'l2')],
  items: [alta, media, baja, mediaVieja, item({ id: 'x', name: 'Queso', listId: 'l2' })],
  loaded: true,
};

describe('shoppingReducer', () => {
  it('elimina la lista junto con sus ítems', () => {
    const next = shoppingReducer(state, { type: 'DELETE_LIST', payload: 'l1' });
    expect(next.lists.map((l) => l.id)).toEqual(['l2']);
    expect(next.items.map((i) => i.id)).toEqual(['x']);
  });

  it('renombra una lista sin tocar las demás', () => {
    const next = shoppingReducer(state, {
      type: 'RENAME_LIST',
      payload: { id: 'l2', name: 'Compra del sábado' },
    });
    expect(next.lists.find((l) => l.id === 'l2')?.name).toBe('Compra del sábado');
    expect(next.lists.find((l) => l.id === 'l1')?.name).toBe('Semana');
  });

  it('marca como comprado eliminando el ítem (sin papelera)', () => {
    const next = shoppingReducer(state, { type: 'DELETE_ITEM', payload: 'm' });
    expect(next.items.some((i) => i.id === 'm')).toBe(false);
  });

  it('actualiza un ítem existente', () => {
    const updated = { ...media, name: 'Leche entera', quantity: 2 };
    const next = shoppingReducer(state, { type: 'UPDATE_ITEM', payload: updated });
    expect(next.items.find((i) => i.id === 'm')).toEqual(updated);
  });
});

describe('buildItem / buildList', () => {
  it('recorta espacios y normaliza los campos', () => {
    const created = buildItem(
      {
        listId: 'l1',
        name: '  Pan  ',
        quantity: 2,
        unit: ' kg ',
        store: ' panaderia ',
        priority: 'alta',
      },
      100,
      'id-1',
    );
    expect(created).toMatchObject({
      id: 'id-1',
      name: 'Pan',
      unit: 'kg',
      store: 'panaderia',
      createdAt: 100,
      updatedAt: 100,
    });
  });

  it('crea listas con nombre recortado', () => {
    expect(buildList('  Semana ', 5, 'l9')).toEqual({ id: 'l9', name: 'Semana', createdAt: 5 });
  });
});

describe('ordenación por prioridad', () => {
  it('ordena alta → media → baja y, dentro de cada nivel, por creación', () => {
    const sorted = sortByPriority([baja, media, alta, mediaVieja]);
    expect(sorted.map((i) => i.id)).toEqual(['a', 'm2', 'm', 'b']);
  });
});

describe('agrupaciones', () => {
  it('agrupa por prioridad omitiendo grupos vacíos', () => {
    const groups = groupByPriority([baja, alta]);
    expect(groups.map((g) => g.priority)).toEqual(['alta', 'baja']);
  });

  it('agrupa por lugar en orden alfabético y ordena cada grupo por prioridad', () => {
    const groups = groupByStore([
      item({ id: '1', name: 'Zanahoria', store: 'fruteria', priority: 'baja' }),
      item({ id: '2', name: 'Manzana', store: 'fruteria', priority: 'alta' }),
      item({ id: '3', name: 'Pan', store: 'panaderia', priority: 'media' }),
    ]);
    expect(groups.map((g) => g.store)).toEqual(['fruteria', 'panaderia']);
    expect(groups[0].items.map((i) => i.name)).toEqual(['Manzana', 'Zanahoria']);
  });

  it('usa «otros» para ítems sin lugar', () => {
    const groups = groupByStore([item({ id: '1', name: 'Algo', store: '' })]);
    expect(groups[0].store).toBe('otros');
  });

  it('recoge los lugares únicos ordenados', () => {
    expect(
      collectStores([
        item({ id: '1', name: 'a', store: 'panaderia' }),
        item({ id: '2', name: 'b', store: 'fruteria' }),
        item({ id: '3', name: 'c', store: 'panaderia' }),
      ]),
    ).toEqual(['fruteria', 'panaderia']);
  });
});

describe('filtros', () => {
  it('busca por nombre sin distinguir mayúsculas ni acentos', () => {
    expect(normalizeText('Café  Ñandú')).toBe('cafe nandu');
    const result = filterItems([item({ id: '1', name: 'Café molido' })], {
      ...createEmptyFilters(),
      search: 'cafe',
    });
    expect(result).toHaveLength(1);
  });

  it('combina filtros de lista, prioridad y lugar', () => {
    const items = [
      item({ id: '1', name: 'Pan', listId: 'l1', priority: 'alta', store: 'panaderia' }),
      item({ id: '2', name: 'Leche', listId: 'l1', priority: 'baja', store: 'supermercado' }),
      item({ id: '3', name: 'Pan', listId: 'l2', priority: 'alta', store: 'panaderia' }),
    ];
    const result = filterItems(items, {
      search: 'pan',
      listId: 'l1',
      priority: 'alta',
      store: 'panaderia',
    });
    expect(result.map((i) => i.id)).toEqual(['1']);
  });
});
