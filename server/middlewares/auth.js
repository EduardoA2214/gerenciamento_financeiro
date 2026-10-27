const jwt = require('jsonwebtoken');
const { get } = require('../db');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token de autenticação não informado.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }

  try {
    // O token continua válido até expirar, então confere se a conta ainda existe
    // (ela pode ter sido excluída depois do login)
    const usuarioRow = await get('SELECT id FROM usuarios WHERE id = ?', [payload.id]);
    if (!usuarioRow) {
      return res.status(401).json({ error: 'Conta não encontrada. Faça login novamente.' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao validar autenticação.' });
  }

  req.usuario = { id: payload.id, usuario: payload.usuario };
  return next();
}

module.exports = authMiddleware;
