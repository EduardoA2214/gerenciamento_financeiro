const TOKEN_KEY = 'financas.token';
const USUARIO_KEY = 'financas.usuario';
const FOTO_KEY = 'financas.foto';
const ULTIMO_USUARIO_KEY = 'financas.ultimoUsuario';
const ULTIMA_FOTO_KEY = 'financas.ultimaFoto';

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

export function getUltimoUsuario() {
  return localStorage.getItem(ULTIMO_USUARIO_KEY);
}

export function getUltimaFoto() {
  return localStorage.getItem(ULTIMA_FOTO_KEY);
}

function lembrarUltimoUsuario() {
  const usuario = getUsuario();
  if (!usuario) return;
  localStorage.setItem(ULTIMO_USUARIO_KEY, usuario);
  const foto = getFoto();
  if (foto) {
    localStorage.setItem(ULTIMA_FOTO_KEY, foto);
  } else {
    localStorage.removeItem(ULTIMA_FOTO_KEY);
  }
}

export function esquecerUltimoUsuario() {
  localStorage.removeItem(ULTIMO_USUARIO_KEY);
  localStorage.removeItem(ULTIMA_FOTO_KEY);
}

export function clearSession() {
  lembrarUltimoUsuario();
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
  localStorage.removeItem(FOTO_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}
