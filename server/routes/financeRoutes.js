const express = require('express');
const {
  createSalary,
  listSalaries,
  createExpense,
  listExpenses,
  listCategories,
  createCategoryHandler,
  deleteCategory,
  getSummary
} = require('../controllers/financeController');

const router = express.Router();

router.post('/salarios', createSalary);
router.get('/salarios', listSalaries);

router.post('/gastos', createExpense);
router.get('/gastos', listExpenses);

router.get('/categorias', listCategories);
router.post('/categorias', createCategoryHandler);
router.delete('/categorias/:id', deleteCategory);

router.get('/resumo', getSummary);

module.exports = router;
