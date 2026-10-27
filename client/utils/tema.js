const TEMA_KEY = 'financas.tema';
const TEMA_ALTERADO_EVENT = 'tema:alterado';

function lerTemaSalvo() {
  try {
    return localStorage.getItem(TEMA_KEY);
  } catch {
    return null;
  }
}

export function getTema() {
  return lerTemaSalvo() === 'escuro' ? 'escuro' : 'claro';
}

export function aplicarTema(tema = getTema()) {
  document.documentElement.classList.toggle('dark', tema === 'escuro');
}

export function alternarTema() {
  const novoTema = getTema() === 'escuro' ? 'claro' : 'escuro';
  try {
    localStorage.setItem(TEMA_KEY, novoTema);
  } catch {
    // Sem armazenamento disponível: o tema vale só até recarregar a página
  }
  aplicarTema(novoTema);
  window.dispatchEvent(new CustomEvent(TEMA_ALTERADO_EVENT, { detail: novoTema }));
  return novoTema;
}
