import { describe, expect, it } from 'vitest';
import {
  detectBrowserLocale,
  dictionaries,
  formatDate,
  formatQuantity,
  localeFromPath,
  replaceLocaleInPath,
  resolveInitialLocale,
} from './index';

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('diccionarios', () => {
  it('es y ca tienen exactamente las mismas claves', () => {
    expect(flattenKeys(dictionaries.ca).sort()).toEqual(flattenKeys(dictionaries.es).sort());
  });

  it('ningún texto está vacío', () => {
    for (const locale of ['es', 'ca'] as const) {
      const values = flattenKeys(dictionaries[locale]).map((key) =>
        key
          .split('.')
          .reduce<unknown>(
            (acc, part) => (acc as Record<string, unknown>)[part],
            dictionaries[locale],
          ),
      );
      expect(values.every((v) => typeof v === 'string' && v.length > 0)).toBe(true);
    }
  });
});

describe('rutas con idioma', () => {
  it('detecta el idioma del prefijo', () => {
    expect(localeFromPath('/es/login')).toBe('es');
    expect(localeFromPath('/ca/lista/123')).toBe('ca');
    expect(localeFromPath('/en/login')).toBeNull();
    expect(localeFromPath('/')).toBeNull();
  });

  it('sustituye el prefijo conservando la ruta', () => {
    expect(replaceLocaleInPath('/es/lista/42', 'ca')).toBe('/ca/lista/42');
    expect(replaceLocaleInPath('/login', 'ca')).toBe('/ca/login');
  });
});

describe('idioma inicial', () => {
  it('prioriza el guardado, luego el navegador y por último castellano', () => {
    expect(resolveInitialLocale('ca', 'es-ES')).toBe('ca');
    expect(resolveInitialLocale(null, 'ca-ES')).toBe('ca');
    expect(resolveInitialLocale(null, 'fr-FR')).toBe('es');
    expect(resolveInitialLocale('xx', null)).toBe('es');
  });

  it('detecta el idioma del navegador por su base', () => {
    expect(detectBrowserLocale('ca-ES-valencia')).toBe('ca');
    expect(detectBrowserLocale('en-GB')).toBeNull();
    expect(detectBrowserLocale(undefined)).toBeNull();
  });
});

describe('formateo', () => {
  it('formatea fechas y cantidades según el idioma', () => {
    const timestamp = Date.UTC(2024, 0, 15);
    expect(formatDate('es', timestamp)).toContain('2024');
    expect(formatQuantity('ca', 1.5)).toMatch(/1[,.]5/);
  });
});
