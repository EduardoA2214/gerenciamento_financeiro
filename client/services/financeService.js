import { api } from './api';

export const getResumo = () => api.get('/resumo');
export const limparDados = () => api.post('/limpar-dados', {});

export const listSalarios = () => api.get('/salarios');
export const createSalario = (valor, descricao) => api.post('/salarios', { valor, descricao });
export const deleteSalario = (id) => api.delete(`/salarios/${id}`);

export const listRendasFixas = () => api.get('/rendas-fixas');
export const createRendaFixa = (descricao, valor, diaMes) => api.post('/rendas-fixas', { descricao, valor, diaMes });
export const deleteRendaFixa = (id) => api.delete(`/rendas-fixas/${id}`);
export const lancarRendaFixa = (id) => api.post(`/rendas-fixas/${id}/lancar`, {});

export const listGastos = () => api.get('/gastos');
export const createGasto = (valor, descricao, categoria) => api.post('/gastos', { valor, descricao, categoria });
export const deleteGasto = (id) => api.delete(`/gastos/${id}`);

export const listGastosFixos = () => api.get('/gastos-fixos');
export const createGastoFixo = (descricao, valor, diaMes, categoria) =>
  api.post('/gastos-fixos', { descricao, valor, diaMes, categoria });
export const deleteGastoFixo = (id) => api.delete(`/gastos-fixos/${id}`);
export const lancarGastoFixo = (id) => api.post(`/gastos-fixos/${id}/lancar`, {});

export const listCategorias = () => api.get('/categorias');
export const createCategoria = (nome) => api.post('/categorias', { nome });
export const deleteCategoria = (id) => api.delete(`/categorias/${id}`);
