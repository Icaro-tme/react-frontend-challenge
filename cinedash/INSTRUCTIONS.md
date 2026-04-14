# Instruções - CineDash

## Projeto escolhido

- Caso: **CineDash** (`../cases/01-cinedash.md`)

## Requisitos

- Node.js 20+
- npm 10+

## Configuração

Crie um arquivo `.env` na raiz de `cinedash/` com:

```env
VITE_TMDB_API_READ_ACCESS_TOKEN=seu_token_tmdb
# opcional
VITE_TMDB_API_KEY=sua_api_key_tmdb
# opcional
VITE_TMDB_API_URL=https://api.themoviedb.org/3
```

## Como rodar

```bash
npm install
npm run dev
```

## Comandos úteis

- `npm run lint`
- `npm run build`
- `npm run test`
- `npm run test:watch`

## Fluxo de acesso (auth mock)

- Usuário seed inicial:
  - email: `operador@cinedash.dev`
- No login, o campo senha é validado no formulário (mínimo de 7 caracteres).
- A sessão é mockada no frontend com token + expiração.

## Documentação complementar

- Decisões de arquitetura: `ARCHITECTURE.md`
- Contexto geral, stack e bibliotecas: `README.md`