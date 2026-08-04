require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const financeRoutes = require('./routes/financeRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/auth');
const { initializeSchema, closeDb } = require('./db');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado. Defina essa variável no arquivo .env.');
}

// 'null' cobre o app empacotado no Electron, que carrega a interface via file://
const allowedOrigins = new Set(['null', 'http://localhost:5173']);
if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(',').forEach((origin) => allowedOrigins.add(origin.trim()));
}

const app = express();
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origem não permitida pelo CORS.'));
  }
}));
app.use(express.json({ limit: '3mb' }));
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API funcionando' });
});
app.use('/api/auth', authRoutes);
app.use('/api', authMiddleware, financeRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  const status = error.message === 'Origem não permitida pelo CORS.' ? 403 : 500;
  res.status(status).json({ error: status === 403 ? error.message : 'Erro interno do servidor.' });
});

const initializeDb = initializeSchema().catch((error) => {
  console.error('Erro ao inicializar o banco de dados:', error);
});

function startServer(preferredPort = Number(process.env.PORT) || 4001, attempts = 9) {
  return new Promise((resolve, reject) => {
    function tryListen(port, attemptsLeft) {
      const server = app.listen(port, () => {
        console.log(`Servidor rodando na porta ${port}`);
        resolve({ server, port });
      });

      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE' && attemptsLeft > 0) {
          console.warn(`Porta ${port} ocupada, tentando ${port + 1}...`);
          tryListen(port + 1, attemptsLeft - 1);
          return;
        }
        reject(error);
      });
    }

    tryListen(preferredPort, attempts);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  });
}

module.exports = { app, closeDb, initializeDb, startServer };
