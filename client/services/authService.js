import { api } from './api';
import { setSession, setFoto, clearSession } from '../utils/auth';

const PROFILE_UPDATED_EVENT = 'auth:profile-updated';

function notifyProfileUpdated() {
  window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT));
}

export async function login(usuario, senha) {
  const data = await api.post('/auth/login', { usuario, senha }, { auth: false });
  setSession(data.token, data.usuario, data.fotoPerfil ?? null);
  return data;
}

export async function registrar(usuario, senha) {
  const data = await api.post('/auth/registrar', { usuario, senha }, { auth: false });
  setSession(data.token, data.usuario, data.fotoPerfil ?? null);
  return data;
}

export function logout() {
  clearSession();
}

export async function atualizarUsuario(usuario) {
  const data = await api.put('/auth/usuario', { usuario });
  setSession(data.token, data.usuario);
  notifyProfileUpdated();
  return data;
}

export async function atualizarSenha(senhaAtual, novaSenha) {
  return api.put('/auth/senha', { senhaAtual, novaSenha });
}

export async function atualizarFoto(foto) {
  const data = await api.put('/auth/foto', { foto });
  setFoto(data.fotoPerfil);
  notifyProfileUpdated();
  return data;
}

export async function removerFoto() {
  const data = await api.delete('/auth/foto');
  setFoto(null);
  notifyProfileUpdated();
  return data;
}
