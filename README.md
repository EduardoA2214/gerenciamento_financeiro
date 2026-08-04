# Gerenciamento Financeiro

Aplicativo pessoal de controle financeiro (salários, gastos e categorias), com backend em Node.js/Express + SQLite e frontend em React. Pode rodar como site local ou como aplicativo desktop (Windows) empacotado com Electron.

## Requisitos

- [Node.js](https://nodejs.org/) 18 ou superior (recomendado: a versão LTS mais recente)
- No Windows, pra compilar o módulo nativo do SQLite: **Visual Studio Build Tools** (workload "Desenvolvimento para desktop com C++") e o [Microsoft Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe)
- Só é necessário pra gerar o instalador `.exe`: as mesmas ferramentas acima (o `electron-builder` recompila o SQLite pra rodar dentro do Electron)

## Instalação

```bash
npm install
```

## Rodando como site local (modo web)

Esse modo exige um arquivo `.env` na raiz do projeto (ele **não vem no repositório** por segurança). Copie o exemplo e ajuste:

```bash
cp .env.example .env
```

Abra o `.env` e troque o valor de `JWT_SECRET` por uma string aleatória e longa (o `.env.example` só tem um placeholder). Sem isso o servidor recusa iniciar.

Depois, suba backend e frontend juntos:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend (API): http://localhost:4001

Na primeira vez, crie uma conta pela tela "Criar conta" — o banco de dados (`server/banco.db`) é criado automaticamente, vazio, na primeira execução.

## Rodando como aplicativo desktop (Electron)

Esse modo **não precisa de `.env`** — o app gera sozinho uma chave de segurança e um banco de dados próprios, guardados na pasta de dados do usuário do Windows (fora da pasta do projeto).

Testar em modo desenvolvimento (sem gerar instalador):

```bash
npm run build
npm run electron
```

Gerar o instalador `.exe` (Windows):

```bash
npm run dist:win
```

O instalador final fica em `release/Gerenciamento Financeiro Setup <versão>.exe`. Ele instala o app, cria atalho no Desktop e no Menu Iniciar, e abre em tela cheia (aperte **Esc** pra sair do modo tela cheia).

## Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe backend + frontend juntos, em modo desenvolvimento |
| `npm start` / `npm run server` | Sobe só o backend (`node server/server.js`) |
| `npm run client` | Sobe só o frontend (Vite dev server) |
| `npm run build` | Compila o frontend pra produção (pasta `dist/`) |
| `npm run preview` | Serve o build de produção do frontend localmente |
| `npm test` | Roda os testes automatizados do backend |
| `npm run electron` | Roda o app empacotado como janela do Electron (usa o `dist/` já compilado) |
| `npm run dist:win` | Compila o frontend e gera o instalador `.exe` (Windows) |

## Variáveis de ambiente (`.env`, só no modo web)

| Variável | Descrição | Padrão |
|---|---|---|
| `PORT` | Porta do backend | `4001` |
| `JWT_SECRET` | Chave usada pra assinar os tokens de login. **Obrigatória, sem valor padrão.** | — |
| `JWT_EXPIRES_IN` | Validade do token de login | `1d` |

## Estrutura do projeto

```
client/     → Frontend React (páginas, componentes, services)
server/     → Backend Express (rotas, controllers, middlewares, banco SQLite)
electron/   → Processo principal do Electron (app desktop)
tests/      → Testes automatizados do backend
build/      → Ícone do app (usado pelo electron-builder)
```

## Créditos

Veja [CREDITS.md](CREDITS.md) para atribuição de recursos visuais usados no app.
