import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp, VALID_PASSWORD } from '../test/utils';

describe('autenticación', () => {
  it('redirige a login cuando se intenta ver una ruta protegida sin sesión', async () => {
    renderApp('/es/listas');
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    // No se muestra ningún dato de la app.
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('registra un usuario y entra en sus listas', async () => {
    const { user } = renderApp('/es/registro');
    await user.type(screen.getByLabelText('Nombre de usuario'), 'ana');
    await user.type(screen.getByLabelText('Contraseña'), VALID_PASSWORD);
    await user.type(screen.getByLabelText('Repite la contraseña'), VALID_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Registrarme' }));

    expect(await screen.findByRole('heading', { name: 'Tus listas' })).toBeInTheDocument();
    expect(screen.getByText(/Sesión iniciada como ana/)).toBeInTheDocument();
  });

  it('no guarda la contraseña en claro en el almacenamiento', async () => {
    const { user } = renderApp('/es/registro');
    await user.type(screen.getByLabelText('Nombre de usuario'), 'ana');
    await user.type(screen.getByLabelText('Contraseña'), VALID_PASSWORD);
    await user.type(screen.getByLabelText('Repite la contraseña'), VALID_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Registrarme' }));
    await screen.findByRole('heading', { name: 'Tus listas' });

    expect(JSON.stringify({ ...localStorage })).not.toContain(VALID_PASSWORD);
  });

  it('avisa si las contraseñas no coinciden', async () => {
    const { user } = renderApp('/es/registro');
    await user.type(screen.getByLabelText('Nombre de usuario'), 'ana');
    await user.type(screen.getByLabelText('Contraseña'), VALID_PASSWORD);
    await user.type(screen.getByLabelText('Repite la contraseña'), 'otra-cosa');
    await user.click(screen.getByRole('button', { name: 'Registrarme' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Las contraseñas no coinciden.');
  });

  it('rechaza credenciales incorrectas al iniciar sesión', async () => {
    const { user } = renderApp('/es/registro');
    await user.type(screen.getByLabelText('Nombre de usuario'), 'ana');
    await user.type(screen.getByLabelText('Contraseña'), VALID_PASSWORD);
    await user.type(screen.getByLabelText('Repite la contraseña'), VALID_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Registrarme' }));
    await screen.findByRole('heading', { name: 'Tus listas' });

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Nombre de usuario'), 'ana');
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos.');
  });

  it('permite iniciar sesión con un usuario ya registrado', async () => {
    const first = renderApp('/es/registro');
    await first.user.type(first.getByLabelText('Nombre de usuario'), 'ana');
    await first.user.type(first.getByLabelText('Contraseña'), VALID_PASSWORD);
    await first.user.type(first.getByLabelText('Repite la contraseña'), VALID_PASSWORD);
    await first.user.click(first.getByRole('button', { name: 'Registrarme' }));
    await first.findByRole('heading', { name: 'Tus listas' });
    first.unmount();
    sessionStorage.clear();

    const { user } = renderApp('/es/login');
    await user.type(screen.getByLabelText('Nombre de usuario'), 'ana');
    await user.type(screen.getByLabelText('Contraseña'), VALID_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('heading', { name: 'Tus listas' })).toBeInTheDocument();
  });
});
