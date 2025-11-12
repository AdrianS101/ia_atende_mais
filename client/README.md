# Frontend IA Atende+

Aplicação React + Vite usada pelos usuários e administradores para interagir com a API de onboarding.

## Requisitos
- Node.js 18+

## Configuração
1. `npm install`
2. Configure o arquivo `.env` ou `.env.local` com a variável:
   - `VITE_API_BASE_URL` — endpoint público do backend.

## Scripts Principais
- `npm run dev` — ambiente de desenvolvimento (http://localhost:5173).
- `npm run build` — gera bundle de produção.
- `npm run preview` — pré-visualiza o bundle localmente.

## Deploy
- Para Vercel/Netlify: execute `npm run build` e aponte a pasta `dist/` como saída.
- Garanta que `VITE_API_BASE_URL` esteja configurada no provedor de hospedagem.

## Estrutura
- `src/pages/` — telas principais (login, painel, onboarding).
- `src/components/` — UI compartilhada (inclui componentes shadcn/ui).
- `src/services/` — chamadas HTTP e rotas da API.
- `src/hooks/` — hooks utilitários (ex.: responsividade, toasts).

