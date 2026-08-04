const { run, all, get } = require('../db');

async function createSalary(req, res) {
  try {
    const { valor, descricao = 'Salário' } = req.body;

    if (typeof valor !== 'number' || Number.isNaN(valor) || valor <= 0) {
      return res.status(400).json({ error: 'O valor do salário deve ser um número maior que zero.' });
    }

    const result = await run('INSERT INTO salarios (valor, descricao) VALUES (?, ?)', [valor, descricao]);
    return res.status(201).json({ id: result.id, valor, descricao, message: 'Salário cadastrado com sucesso.' });
  } catch (error) {
    console.error('Erro ao cadastrar salário:', error);
    return res.status(500).json({ error: 'Erro ao cadastrar salário.' });
  }
}

async function listSalaries(req, res) {
  try {
    const rows = await all('SELECT * FROM salarios ORDER BY data DESC');
    return res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar salários:', error);
    return res.status(500).json({ error: 'Erro ao buscar salários.' });
  }
}

async function createCategory(name) {
  const trimmedName = String(name || '').trim();
  if (!trimmedName) {
    throw new Error('Categoria inválida.');
  }

  const existing = await get('SELECT id FROM categorias WHERE nome = ?', [trimmedName]);
  if (existing) {
    return existing.id;
  }

  const result = await run('INSERT INTO categorias (nome) VALUES (?)', [trimmedName]);
  return result.id;
}

async function createExpense(req, res) {
  try {
    const { valor, descricao, categoria = 'Outros' } = req.body;

    if (typeof valor !== 'number' || Number.isNaN(valor) || valor <= 0) {
      return res.status(400).json({ error: 'O valor do gasto deve ser um número maior que zero.' });
    }

    if (!descricao || typeof descricao !== 'string' || descricao.trim() === '') {
      return res.status(400).json({ error: 'A descrição do gasto é obrigatória.' });
    }

    const categoriaId = await createCategory(categoria);
    const result = await run('INSERT INTO gastos (valor, descricao, categoria_id) VALUES (?, ?, ?)', [valor, descricao.trim(), categoriaId]);
    const categoriaRow = await get('SELECT nome FROM categorias WHERE id = ?', [categoriaId]);

    return res.status(201).json({
      id: result.id,
      valor,
      descricao: descricao.trim(),
      categoria: categoriaRow?.nome || 'Outros',
      message: 'Gasto cadastrado com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao cadastrar gasto:', error);
    return res.status(500).json({ error: 'Erro ao cadastrar gasto.' });
  }
}

async function listExpenses(req, res) {
  try {
    const rows = await all(`
      SELECT g.id, g.valor, g.descricao, g.data, c.nome AS categoria
      FROM gastos g
      LEFT JOIN categorias c ON c.id = g.categoria_id
      ORDER BY g.data DESC
    `);
    return res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar gastos:', error);
    return res.status(500).json({ error: 'Erro ao buscar gastos.' });
  }
}

async function listCategories(req, res) {
  try {
    const rows = await all('SELECT * FROM categorias ORDER BY nome ASC');
    return res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return res.status(500).json({ error: 'Erro ao buscar categorias.' });
  }
}

async function createCategoryHandler(req, res) {
  try {
    const { nome } = req.body;
    const trimmedName = String(nome || '').trim();

    if (!trimmedName) {
      return res.status(400).json({ error: 'O nome da categoria é obrigatório.' });
    }

    const existing = await get('SELECT id FROM categorias WHERE nome = ?', [trimmedName]);
    if (existing) {
      return res.status(409).json({ error: 'Essa categoria já existe.' });
    }

    const result = await run('INSERT INTO categorias (nome) VALUES (?)', [trimmedName]);
    return res.status(201).json({ id: result.id, nome: trimmedName, message: 'Categoria criada com sucesso.' });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return res.status(500).json({ error: 'Erro ao criar categoria.' });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    const categoria = await get('SELECT id FROM categorias WHERE id = ?', [id]);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }

    await run('UPDATE gastos SET categoria_id = NULL WHERE categoria_id = ?', [id]);
    await run('DELETE FROM categorias WHERE id = ?', [id]);

    return res.json({ message: 'Categoria excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    return res.status(500).json({ error: 'Erro ao excluir categoria.' });
  }
}

async function getSummary(req, res) {
  try {
    const salarios = await all('SELECT COALESCE(SUM(valor), 0) AS totalSalario FROM salarios');
    const gastos = await all('SELECT COALESCE(SUM(valor), 0) AS totalGastos, COUNT(*) AS quantidade FROM gastos');
    const categorias = await all(`
      SELECT c.nome AS categoria, SUM(g.valor) AS total
      FROM gastos g
      LEFT JOIN categorias c ON c.id = g.categoria_id
      GROUP BY c.nome
      ORDER BY total DESC
    `);

    const totalSalario = Number(salarios[0].totalSalario || 0);
    const totalGastos = Number(gastos[0].totalGastos || 0);
    const saldo = totalSalario - totalGastos;

    const gastosPorCategoria = categorias.reduce((acc, item) => {
      acc[item.categoria || 'Outros'] = Number(item.total || 0);
      return acc;
    }, {});

    return res.json({
      totalSalario,
      totalGastos,
      saldo,
      gastosPorCategoria,
      quantidadeDeGastos: Number(gastos[0].quantidade || 0)
    });
  } catch (error) {
    console.error('Erro ao gerar resumo:', error);
    return res.status(500).json({ error: 'Erro ao gerar resumo.' });
  }
}

module.exports = {
  createSalary,
  listSalaries,
  createExpense,
  listExpenses,
  listCategories,
  createCategoryHandler,
  deleteCategory,
  getSummary
};
