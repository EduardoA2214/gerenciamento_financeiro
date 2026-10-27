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

  const gastoFixoResponse = await request(app)
    .post('/api/gastos-fixos')
    .set('Authorization', `Bearer ${token}`)
    .send({ descricao: 'Netflix', valor: 39.9, diaMes: 10, categoria: 'Assinaturas' });
  assert.equal(gastoFixoResponse.status, 201);
  assert.equal(gastoFixoResponse.body.categoria, 'Assinaturas');

  const gastosFixosResponse = await request(app)
    .get('/api/gastos-fixos')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(gastosFixosResponse.status, 200);
  assert.equal(gastosFixosResponse.body.length, 1);
  assert.equal(gastosFixosResponse.body[0].diaMes, 10);

  const lancarResponse = await request(app)
    .post(`/api/gastos-fixos/${gastoFixoResponse.body.id}/lancar`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(lancarResponse.status, 201);

  const resumoAposLancarResponse = await request(app)
    .get('/api/resumo')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(resumoAposLancarResponse.body.totalGastos, 360.65);
  assert.equal(resumoAposLancarResponse.body.gastosPorCategoria.Assinaturas, 39.9);

  const excluirFixoResponse = await request(app)
    .delete(`/api/gastos-fixos/${gastoFixoResponse.body.id}`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(excluirFixoResponse.status, 200);

  await closeDb();
});

test('cada perfil tem o próprio sistema financeiro', async () => {
  resetTestDb();

  // Recarrega o servidor do zero, com um banco novo
  Object.keys(require.cache).forEach((key) => {
    if (key.includes(`${path.sep}server${path.sep}`)) delete require.cache[key];
  });
  const { app, closeDb, initializeDb } = require('../server/server');
  await initializeDb;

  async function registrar(usuario) {
    const response = await request(app).post('/api/auth/registrar').send({ usuario, senha: 'senha123' });
    assert.equal(response.status, 201);
    return response.body.token;
  }

  const tokenAna = await registrar('ana');
  const tokenBruno = await registrar('bruno');
  const auth = (token) => ({ Authorization: `Bearer ${token}` });

  await request(app).post('/api/salarios').set(auth(tokenAna)).send({ valor: 5000, descricao: 'Salário Ana' });
  const gastoAna = await request(app)
    .post('/api/gastos')
    .set(auth(tokenAna))
    .send({ valor: 100, descricao: 'Mercado', categoria: 'Alimentação' });
  const rendaFixaAna = await request(app)
    .post('/api/rendas-fixas')
    .set(auth(tokenAna))
    .send({ descricao: 'Salário', valor: 5000, diaMes: 5 });
  const gastoFixoAna = await request(app)
    .post('/api/gastos-fixos')
    .set(auth(tokenAna))
    .send({ descricao: 'Netflix', valor: 40, diaMes: 10, categoria: 'Assinaturas' });

  await request(app).post('/api/salarios').set(auth(tokenBruno)).send({ valor: 2000, descricao: 'Salário Bruno' });
  await request(app)
    .post('/api/gastos')
    .set(auth(tokenBruno))
    .send({ valor: 50, descricao: 'Lanche', categoria: 'Alimentação' });

  const resumoAna = await request(app).get('/api/resumo').set(auth(tokenAna));
  assert.equal(resumoAna.body.totalSalario, 5000);
  assert.equal(resumoAna.body.totalGastos, 100);

  const resumoBruno = await request(app).get('/api/resumo').set(auth(tokenBruno));
  assert.equal(resumoBruno.body.totalSalario, 2000);
  assert.equal(resumoBruno.body.totalGastos, 50);

  const gastosBruno = await request(app).get('/api/gastos').set(auth(tokenBruno));
  assert.deepEqual(gastosBruno.body.map((g) => g.descricao), ['Lanche']);

  const rendasFixasBruno = await request(app).get('/api/rendas-fixas').set(auth(tokenBruno));
  assert.equal(rendasFixasBruno.body.length, 0);

  const gastosFixosBruno = await request(app).get('/api/gastos-fixos').set(auth(tokenBruno));
  assert.equal(gastosFixosBruno.body.length, 0);

  // Cada perfil tem as próprias categorias, mesmo com o mesmo nome
  const categoriasBruno = await request(app).get('/api/categorias').set(auth(tokenBruno));
  assert.deepEqual(categoriasBruno.body.map((c) => c.nome), ['Alimentação']);
  const categoriasAna = await request(app).get('/api/categorias').set(auth(tokenAna));
  assert.deepEqual(categoriasAna.body.map((c) => c.nome), ['Alimentação', 'Assinaturas']);

  // Um perfil não consegue mexer nos dados de outro
  const excluirGasto = await request(app).delete(`/api/gastos/${gastoAna.body.id}`).set(auth(tokenBruno));
  assert.equal(excluirGasto.status, 404);
  const lancarRenda = await request(app).post(`/api/rendas-fixas/${rendaFixaAna.body.id}/lancar`).set(auth(tokenBruno));
  assert.equal(lancarRenda.status, 404);
  const lancarGasto = await request(app).post(`/api/gastos-fixos/${gastoFixoAna.body.id}/lancar`).set(auth(tokenBruno));
  assert.equal(lancarGasto.status, 404);
  const excluirCategoria = await request(app)
    .delete(`/api/categorias/${categoriasAna.body[1].id}`)
    .set(auth(tokenBruno));
  assert.equal(excluirCategoria.status, 404);

  // Limpar dados e lançar renda fixa só afetam o próprio perfil
  await request(app).post('/api/limpar-dados').set(auth(tokenBruno));
  const resumoAnaDepois = await request(app).get('/api/resumo').set(auth(tokenAna));
  assert.equal(resumoAnaDepois.body.totalSalario, 5000);
  assert.equal(resumoAnaDepois.body.totalGastos, 100);

  await request(app).post(`/api/rendas-fixas/${rendaFixaAna.body.id}/lancar`).set(auth(tokenAna));
  const resumoAnaLancado = await request(app).get('/api/resumo').set(auth(tokenAna));
  assert.equal(resumoAnaLancado.body.totalSalario, 9900);
  assert.equal(resumoAnaLancado.body.totalGastos, 0);

  await closeDb();
});

test('alterar senha e excluir conta exigem a senha', async () => {
  resetTestDb();

  Object.keys(require.cache).forEach((key) => {
    if (key.includes(`${path.sep}server${path.sep}`)) delete require.cache[key];
  });
  const { app, closeDb, initializeDb } = require('../server/server');
  await initializeDb;

  const registro = await request(app).post('/api/auth/registrar').send({ usuario: 'carla', senha: 'senha123' });
  const auth = { Authorization: `Bearer ${registro.body.token}` };
  await request(app).post('/api/salarios').set(auth).send({ valor: 1000 });

  const senhaErrada = await request(app)
    .put('/api/auth/senha')
    .set(auth)
    .send({ senhaAtual: 'errada', novaSenha: 'nova12345' });
  assert.equal(senhaErrada.status, 403);

  const senhaCerta = await request(app)
    .put('/api/auth/senha')
    .set(auth)
    .send({ senhaAtual: 'senha123', novaSenha: 'nova12345' });
  assert.equal(senhaCerta.status, 200);

  const excluirSemSenha = await request(app).delete('/api/auth/conta').set(auth).send({});
  assert.equal(excluirSemSenha.status, 400);

  const excluirSenhaErrada = await request(app).delete('/api/auth/conta').set(auth).send({ senha: 'senha123' });
  assert.equal(excluirSenhaErrada.status, 403);

  const excluir = await request(app).delete('/api/auth/conta').set(auth).send({ senha: 'nova12345' });
  assert.equal(excluir.status, 200);

  const loginDepois = await request(app).post('/api/auth/login').send({ usuario: 'carla', senha: 'nova12345' });
  assert.equal(loginDepois.status, 401);

  // O token antigo da conta excluída deixa de funcionar
  const tokenAntigo = await request(app).get('/api/resumo').set(auth);
  assert.equal(tokenAntigo.status, 401);

  // Os dados financeiros da conta excluída também somem
  const novoRegistro = await request(app).post('/api/auth/registrar').send({ usuario: 'carla', senha: 'senha123' });
  const resumo = await request(app)
    .get('/api/resumo')
    .set({ Authorization: `Bearer ${novoRegistro.body.token}` });
  assert.equal(resumo.body.totalSalario, 0);

  await closeDb();
});
