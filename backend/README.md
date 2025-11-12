# Onboarding API

API REST construída com Express, MongoDB e GridFS para gerenciar o fluxo de onboarding de clientes.

## Requisitos
- Node.js 18+
- MongoDB Atlas ou compatível

## Variáveis de Ambiente
Defina as chaves abaixo antes de executar:
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN` *(opcional, padrão `7d`)*
- `ADMIN_REGISTRATION_KEY`

## Scripts
- `npm install` — instala dependências.
- `npm run dev` — inicia em modo desenvolvimento (porta 3000).
- `npm start` — inicia em produção.

## Deploy na Vercel
1. Configure o diretório raiz do projeto como `backend`.
2. Defina as variáveis de ambiente na Vercel (`Production`, opcionalmente `Preview`).
3. O `vercel.json` já aponta `src/server.js` como handler; não é necessário comando de build.

## Estrutura
- `src/app.js` — configuração do Express.
- `src/routes/` — rotas de autenticação e onboarding.
- `src/models/` — modelos Mongoose.
- `src/middleware/` — autenticação e uploads (GridFS).
- `src/config/database.js` — conexão com MongoDB com cache para ambientes serverless.

