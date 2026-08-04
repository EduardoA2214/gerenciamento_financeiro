const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const path = require('path');
const fs = require('fs');

process.env.DB_PATH = path.join(__dirname, '..', 'server', 'test-banco.db');
process.env.JWT_SECRET = process.env.JWT_SECRET || 'segredo-de-teste';

const dbPath = process.env.DB_PATH;

function resetTestDb() {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
}

test('deve criar tabelas e retornar resumo financeiro', async () => {
  resetTestDb();

  const { app, closeDb, initializeDb } = require('../server/server');
  await initializeDb;

  const registroResponse = await request(app)
    .post('/api/auth/registrar')
    .send({ usuario: 'teste', senha: 'senha123' });

  assert.equal(registroResponse.status, 201);
  const token = registroResponse.body.token;

  const salarioResponse = await request(app)
    .post('/api/salarios')
    .set('Authorization', `Bearer ${token}`)
    .send({ valor: 3500, descricao: 'Salário principal' });

  assert.equal(salarioResponse.status, 201);

  const gastoResponse = await request(app)
    .post('/api/gastos')
    .set('Authorization', `Bearer ${token}`)
    .send({ valor: 320.75, descricao: 'Mercado', categoria: 'Alimentação' });

  assert.equal(gastoResponse.status, 201);

  const resumoResponse = await request(app)
    .get('/api/resumo')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(resumoResponse.status, 200);
  assert.equal(resumoResponse.body.totalSalario, 3500);
  assert.equal(resumoResponse.body.totalGastos, 320.75);
  assert.equal(resumoResponse.body.saldo, 3179.25);
  assert.equal(resumoResponse.body.gastosPorCategoria.Alimentação, 320.75);

  const semTokenResponse = await request(app).get('/api/resumo');
  assert.equal(semTokenResponse.status, 401);

  await closeDb();
});
