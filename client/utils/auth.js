const TOKEN_KEY = 'financas.token';
const USUARIO_KEY = 'financas.usuario';
const FOTO_KEY = 'financas.foto';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUsuario() {
  return localStorage.getItem(USUARIO_KEY);
}

export function getFoto() {
  return localStorage.getItem(FOTO_KEY);
}

export function setSession(token, usuario, foto) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USUARIO_KEY, usuario);
  if (foto !== undefined) {
    setFoto(foto);
  }
}

export function setFoto(foto) {
  if (foto) {
    localStorage.setItem(FOTO_KEY, foto);
  } else {
    localStorage.removeItem(FOTO_KEY);
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
  localStorage.removeItem(FOTO_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}
