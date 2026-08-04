const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get } = require('../db');

const SALT_ROUNDS = 12;

function gerarToken(usuarioRow) {
  return jwt.sign(
    { id: usuarioRow.id, usuario: usuarioRow.usuario },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

async function registrar(req, res) {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || typeof usuario !== 'string' || usuario.trim().length < 3) {
      return res.status(400).json({ error: 'O usuário deve ter pelo menos 3 caracteres.' });
    }

    if (!senha || typeof senha !== 'string' || senha.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const usuarioNormalizado = usuario.trim();
    const existente = await get('SELECT id FROM usuarios WHERE usuario = ?', [usuarioNormalizado]);
    if (existente) {
      return res.status(409).json({ error: 'Esse usuário já está cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    const result = await run('INSERT INTO usuarios (usuario, senha_hash) VALUES (?, ?)', [usuarioNormalizado, senhaHash]);

    const token = gerarToken({ id: result.id, usuario: usuarioNormalizado });
    return res.status(201).json({ token, usuario: usuarioNormalizado, fotoPerfil: null });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
}

async function login(req, res) {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    const usuarioRow = await get('SELECT * FROM usuarios WHERE usuario = ?', [String(usuario).trim()]);
    if (!usuarioRow) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuarioRow.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }

    const token = gerarToken(usuarioRow);
    return res.json({ token, usuario: usuarioRow.usuario, fotoPerfil: usuarioRow.foto_perfil || null });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao fazer login.' });
  }
}

async function atualizarUsuario(req, res) {
  try {
    const { usuario } = req.body;

    if (!usuario || typeof usuario !== 'string' || usuario.trim().length < 3) {
      return res.status(400).json({ error: 'O usuário deve ter pelo menos 3 caracteres.' });
    }

    const usuarioNormalizado = usuario.trim();
    const existente = await get('SELECT id FROM usuarios WHERE usuario = ? AND id != ?', [usuarioNormalizado, req.usuario.id]);
    if (existente) {
      return res.status(409).json({ error: 'Esse nome de usuário já está em uso.' });
    }

    await run('UPDATE usuarios SET usuario = ? WHERE id = ?', [usuarioNormalizado, req.usuario.id]);

    const token = gerarToken({ id: req.usuario.id, usuario: usuarioNormalizado });
    return res.json({ token, usuario: usuarioNormalizado });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
}

async function atualizarSenha(req, res) {
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ error: 'Informe a senha atual e a nova senha.' });
    }

    if (typeof novaSenha !== 'string' || novaSenha.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    const usuarioRow = await get('SELECT * FROM usuarios WHERE id = ?', [req.usuario.id]);
    if (!usuarioRow) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const senhaValida = await bcrypt.compare(senhaAtual, usuarioRow.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Senha atual incorreta.' });
    }

    const novoHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);
    await run('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [novoHash, req.usuario.id]);

    return res.json({ message: 'Senha atualizada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar senha.' });
  }
}

const MAX_FOTO_LENGTH = 2_000_000;

async function atualizarFoto(req, res) {
  try {
    const { foto } = req.body;

    if (!foto || typeof foto !== 'string' || !foto.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Envie uma imagem válida.' });
    }

    if (foto.length > MAX_FOTO_LENGTH) {
      return res.status(400).json({ error: 'A imagem é muito grande. Escolha uma foto menor.' });
    }

    await run('UPDATE usuarios SET foto_perfil = ? WHERE id = ?', [foto, req.usuario.id]);
    return res.json({ fotoPerfil: foto });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar foto de perfil.' });
  }
}

async function removerFoto(req, res) {
  try {
    await run('UPDATE usuarios SET foto_perfil = NULL WHERE id = ?', [req.usuario.id]);
    return res.json({ message: 'Foto removida com sucesso.' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao remover foto de perfil.' });
  }
}

module.exports = { registrar, login, atualizarUsuario, atualizarSenha, atualizarFoto, removerFoto };
