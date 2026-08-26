const express = require('express');
const {
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
} = require('../controllers/financeController');

const router = express.Router();

router.post('/salarios', createSalary);
router.get('/salarios', listSalaries);
router.delete('/salarios/:id', deleteSalary);

router.post('/rendas-fixas', createRendaFixa);
router.get('/rendas-fixas', listRendasFixas);
router.delete('/rendas-fixas/:id', deleteRendaFixa);
router.post('/rendas-fixas/:id/lancar', lancarRendaFixa);

router.post('/gastos', createExpense);
router.get('/gastos', listExpenses);
router.delete('/gastos/:id', deleteExpense);

router.get('/categorias', listCategories);
router.post('/categorias', createCategoryHandler);
router.delete('/categorias/:id', deleteCategory);

router.get('/resumo', getSummary);
router.post('/limpar-dados', limparDados);

module.exports = router;
