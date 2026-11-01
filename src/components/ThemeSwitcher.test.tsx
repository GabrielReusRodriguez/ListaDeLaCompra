import { afterEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp } from '../test/utils';

const originalMatchMedia = window.matchMedia;

function stubColorScheme(prefersDark: boolean): void {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('dark') && prefersDark,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  delete document.documentElement.dataset.theme;
  window.matchMedia = originalMatchMedia;
});

describe('tema de la interfaz', () => {
  it('alterna entre claro y oscuro y guarda la preferencia', async () => {
    const { user } = renderApp('/es/login');
    await screen.findByRole('heading', { name: 'Iniciar sesión' });

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(screen.getByRole('button', { name: 'Cambiar a tema oscuro' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cambiar a tema oscuro' }));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('ldlc:theme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Cambiar a tema claro' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cambiar a tema claro' }));

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('ldlc:theme')).toBe('light');
  });

  it('aplica el tema guardado al cargar la app', async () => {
    localStorage.setItem('ldlc:theme', 'dark');
    renderApp('/es/login');
    await screen.findByRole('heading', { name: 'Iniciar sesión' });

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('button', { name: 'Cambiar a tema claro' })).toBeInTheDocument();
  });

  it('usa el tema oscuro si el sistema lo prefiere y no hay preferencia guardada', async () => {
    stubColorScheme(true);
    renderApp('/es/login');
    await screen.findByRole('heading', { name: 'Iniciar sesión' });

    expect(document.documentElement.dataset.theme).toBe('dark');
    // La preferencia del sistema no se persiste hasta que el usuario elige.
    expect(localStorage.getItem('ldlc:theme')).toBeNull();
  });

  it('traduce la etiqueta del botón al catalán', async () => {
    renderApp('/ca/login');
    await screen.findByRole('heading', { name: 'Inicia la sessió' });

    expect(screen.getByRole('button', { name: 'Canvia al tema fosc' })).toBeInTheDocument();
  });
});
