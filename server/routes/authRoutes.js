const express = require('express');
const { registrar, login, atualizarUsuario, atualizarSenha, atualizarFoto, removerFoto } = require('../controllers/authController');
const { authRateLimiter } = require('../middlewares/rateLimiter');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.post('/registrar', authRateLimiter, registrar);
router.post('/login', authRateLimiter, login);
router.put('/usuario', authMiddleware, atualizarUsuario);
router.put('/senha', authMiddleware, authRateLimiter, atualizarSenha);
router.put('/foto', authMiddleware, atualizarFoto);
router.delete('/foto', authMiddleware, removerFoto);

module.exports = router;
