# BriqueGO

Sistema local e gratuito para analisar oportunidades, controlar compras, estoque, vendas e caixa de uma operação individual de revenda.

## Como abrir

Requisitos: Node.js 22 ou superior.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. Não há login: o sistema foi preparado para uma única pessoa no próprio computador.

## Dados e backup

O banco SQLite fica em `data/briquego.db` e as fotos em `data/uploads`. Nada disso é publicado no Git. A tela **Backup local** baixa uma cópia consistente do banco completo e também oferece uma exportação JSON legível. Para restaurar, feche o sistema e substitua `data/briquego.db` pela cópia escolhida.

## Funções disponíveis

- Tabela pessoal editável com histórico das últimas alterações.
- Radar que destaca anúncios até o teto de compra mais uma tolerância configurável.
- Captura em lote por texto, favoritos e comparação lado a lado.
- Detector de expressões de risco e regras específicas de iPhones e videogames.
- Assistente e diário de negociação.
- Fotos locais e inspeções salvas em modo visita.
- Compra, custos, estoque, anúncio, venda, garantia e recibo imprimível em PDF.
- Sugestão de preço de anúncio e alerta de estoque parado.
- Caixa disponível preservando uma reserva mínima e meta mensal.
- Relatório por produto, fechamento mensal e pesquisa global.
- Calculadoras gratuitas para carros e motos usando valores informados manualmente.

O sistema não faz scraping automático. Facebook Marketplace, OLX, Mercado Livre e FIPE são fontes para consulta e cadastro manual; isso evita depender de serviços pagos ou de automações frágeis.

## Comandos

- `npm run dev`: abre o sistema local.
- `npm run build`: valida a compilação de produção.
- `npm run start`: abre a compilação de produção.
- `npm run db:migrate`: aplica as migrações ao banco local.
- `npm test`: executa os testes unitários e de integração.
- `npm run test:e2e`: executa o fluxo completo no navegador.
- `npm run typecheck`: verifica os tipos.
