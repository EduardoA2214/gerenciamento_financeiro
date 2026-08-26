const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'banco.db');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function ensureColumn(table, column, definition) {
  return all(`PRAGMA table_info(${table})`).then((columns) => {
    const exists = columns.some((c) => c.name === column);
    if (!exists) {
      return run(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
    }
  });
}

function initializeSchema() {
  return run(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE
    )
  `)
    .then(() => run(`
      CREATE TABLE IF NOT EXISTS salarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        valor REAL NOT NULL,
        descricao TEXT,
        data DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `))
    .then(() => run(`
      CREATE TABLE IF NOT EXISTS gastos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        valor REAL NOT NULL,
        descricao TEXT NOT NULL,
        categoria_id INTEGER,
        data DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
      )
    `))
    .then(() => run(`
      CREATE TABLE IF NOT EXISTS rendas_fixas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT NOT NULL,
        valor REAL NOT NULL,
        dia_mes INTEGER NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `))
    .then(() => run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT NOT NULL UNIQUE,
        senha_hash TEXT NOT NULL,
        foto_perfil TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `))
    .then(() => ensureColumn('usuarios', 'foto_perfil', 'foto_perfil TEXT'));
}

function closeDb() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

module.exports = {
  db,
  run,
  get,
  all,
  initializeSchema,
  closeDb
};
