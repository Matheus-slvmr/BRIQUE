# Arquitetura

Aplicação monolítica modular em Next.js 16, React e TypeScript. As páginas e ações do servidor acessam um banco SQLite local por meio do Drizzle ORM; fórmulas financeiras e regras de recomendação permanecem em módulos puros e testáveis.

O arquivo padrão do banco é `data/briquego.db`. Migrações versionadas ficam em `database/migrations/` e são aplicadas automaticamente ao iniciar a aplicação. O usuário lógico único (`local-user`) separa a modelagem sem exigir autenticação para o uso pessoal no próprio computador.

Fluxo principal: oportunidade → comparáveis → cenários/recomendação → compra → estoque/custos → anúncio → venda → livro-caixa. A tabela pessoal em `lib/price-guide.ts` complementa, mas não substitui, comparáveis reais.
