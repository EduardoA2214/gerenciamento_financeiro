const { run, all, get } = require('../db');

async function createSalary(req, res) {
  try {
    const { valor, descricao = 'Renda' } = req.body;

    if (typeof valor !== 'number' || Number.isNaN(valor) || valor <= 0) {
      return res.status(400).json({ error: 'O valor da renda deve ser um número maior que zero.' });
    }

    const result = await run('INSERT INTO salarios (valor, descricao) VALUES (?, ?)', [valor, descricao]);
    return res.status(201).json({ id: result.id, valor, descricao, message: 'Renda cadastrada com sucesso.' });
  } catch (error) {
    console.error('Erro ao cadastrar renda:', error);
    return res.status(500).json({ error: 'Erro ao cadastrar renda.' });
  }
}

async function listSalaries(req, res) {
  try {
    const rows = await all('SELECT * FROM salarios ORDER BY data DESC');
    return res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar renda:', error);
    return res.status(500).json({ error: 'Erro ao buscar renda.' });
  }
}

async function deleteSalary(req, res) {
  try {
    const { id } = req.params;

    const salario = await get('SELECT id FROM salarios WHERE id = ?', [id]);
    if (!salario) {
      return res.status(404).json({ error: 'Renda não encontrada.' });
    }

    await run('DELETE FROM salarios WHERE id = ?', [id]);
    return res.json({ message: 'Renda excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir renda:', error);
    return res.status(500).json({ error: 'Erro ao excluir renda.' });
  }
}

async function createRendaFixa(req, res) {
  try {
    const { descricao, valor, diaMes } = req.body;

    if (!descricao || typeof descricao !== 'string' || descricao.trim() === '') {
      return res.status(400).json({ error: 'A descrição da renda é obrigatória.' });
    }

    if (typeof valor !== 'number' || Number.isNaN(valor) || valor <= 0) {
      return res.status(400).json({ error: 'O valor da renda deve ser um número maior que zero.' });
    }

    const dia = Number(diaMes);
    if (!Number.isInteger(dia) || dia < 1 || dia > 31) {
      return res.status(400).json({ error: 'O dia do mês deve ser um número entre 1 e 31.' });
    }

    const result = await run(
      'INSERT INTO rendas_fixas (descricao, valor, dia_mes) VALUES (?, ?, ?)',
      [descricao.trim(), valor, dia]
    );

    return res.status(201).json({
      id: result.id,
      descricao: descricao.trim(),
      valor,
      diaMes: dia,
      message: 'Renda fixa cadastrada com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao cadastrar renda fixa:', error);
    return res.status(500).json({ error: 'Erro ao cadastrar renda fixa.' });
  }
}

async function listRendasFixas(req, res) {
  try {
    const rows = await all('SELECT id, descricao, valor, dia_mes AS diaMes, criado_em AS criadoEm FROM rendas_fixas ORDER BY dia_mes ASC');
    return res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar rendas fixas:', error);
    return res.status(500).json({ error: 'Erro ao buscar rendas fixas.' });
  }
}

async function deleteRendaFixa(req, res) {
  try {
    const { id } = req.params;

    const rendaFixa = await get('SELECT id FROM rendas_fixas WHERE id = ?', [id]);
    if (!rendaFixa) {
      return res.status(404).json({ error: 'Renda fixa não encontrada.' });
    }

    await run('DELETE FROM rendas_fixas WHERE id = ?', [id]);
    return res.json({ message: 'Renda fixa excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir renda fixa:', error);
    return res.status(500).json({ error: 'Erro ao excluir renda fixa.' });
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

async function deleteExpense(req, res) {
  try {
    const { id } = req.params;

    const gasto = await get('SELECT id FROM gastos WHERE id = ?', [id]);
    if (!gasto) {
      return res.status(404).json({ error: 'Gasto não encontrado.' });
    }

    await run('DELETE FROM gastos WHERE id = ?', [id]);
    return res.json({ message: 'Gasto excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir gasto:', error);
    return res.status(500).json({ error: 'Erro ao excluir gasto.' });
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

async function lancarRendaFixa(req, res) {
  try {
    const { id } = req.params;

    const rendaFixa = await get('SELECT * FROM rendas_fixas WHERE id = ?', [id]);
    if (!rendaFixa) {
      return res.status(404).json({ error: 'Renda fixa não encontrada.' });
    }

    const salariosResumo = await all('SELECT COALESCE(SUM(valor), 0) AS total FROM salarios');
    const gastosResumo = await all('SELECT COALESCE(SUM(valor), 0) AS total FROM gastos');
    const saldoAnterior = Number(salariosResumo[0].total || 0) - Number(gastosResumo[0].total || 0);
    const novoValor = saldoAnterior + Number(rendaFixa.valor);

    await run('BEGIN TRANSACTION');
    try {
      // Ao entrar um novo salário, os gastos do mês anterior são zerados (a % gasta
      // recomeça do zero) e o saldo que restava é somado à nova renda, sem se perder.
      await run('DELETE FROM gastos');
      await run('DELETE FROM salarios');
      await run('INSERT INTO salarios (valor, descricao) VALUES (?, ?)', [novoValor, rendaFixa.descricao]);
      await run('COMMIT');
    } catch (transactionError) {
      await run('ROLLBACK');
      throw transactionError;
    }

    return res.status(201).json({
      message: 'Renda lançada com sucesso.',
      valor: novoValor,
      saldoAnteriorIncluido: saldoAnterior
    });
  } catch (error) {
    console.error('Erro ao lançar renda fixa:', error);
    return res.status(500).json({ error: 'Erro ao lançar renda fixa.' });
  }
}

async function limparDados(req, res) {
  try {
    await run('BEGIN TRANSACTION');
    try {
      await run('DELETE FROM gastos');
      await run('DELETE FROM salarios');
      await run('COMMIT');
    } catch (transactionError) {
      await run('ROLLBACK');
      throw transactionError;
    }

    return res.json({ message: 'Dados limpos com sucesso.' });
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    return res.status(500).json({ error: 'Erro ao limpar dados.' });
  }
}

module.exports = {
  createSalary,
  listSalaries,
  deleteSalary,
  createRendaFixa,
  listRendasFixas,
  deleteRendaFixa,
  lancarRendaFixa,
  createExpense,
  listExpenses,
  deleteExpense,
  listCategories,
  createCategoryHandler,
  deleteCategory,
  getSummary,
  limparDados
};
