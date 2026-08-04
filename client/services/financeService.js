import { api } from './api';

export const getResumo = () => api.get('/resumo');

export const listSalarios = () => api.get('/salarios');
export const createSalario = (valor, descricao) => api.post('/salarios', { valor, descricao });

export const listGastos = () => api.get('/gastos');
export const createGasto = (valor, descricao, categoria) => api.post('/gastos', { valor, descricao, categoria });

export const listCategorias = () => api.get('/categorias');
export const createCategoria = (nome) => api.post('/categorias', { nome });
export const deleteCategoria = (id) => api.delete(`/categorias/${id}`);
