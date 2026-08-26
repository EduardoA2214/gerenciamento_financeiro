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

export const listCategorias = () => api.get('/categorias');
export const createCategoria = (nome) => api.post('/categorias', { nome });
export const deleteCategoria = (id) => api.delete(`/categorias/${id}`);
