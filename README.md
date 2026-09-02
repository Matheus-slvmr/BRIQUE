# BriqueGO

Sistema local para analisar oportunidades, controlar compras, estoque, vendas e caixa de uma operação individual de revenda em Goiânia.

## Como abrir

Requisitos: Node.js 22 ou superior.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. Não há login: o sistema foi preparado para uso por uma única pessoa no próprio computador.

## Banco local

Os dados ficam em `data/briquego.db`, um arquivo SQLite criado automaticamente na primeira inicialização. Para fazer backup, feche o sistema e copie os arquivos `data/briquego.db*` para outro local. O Git ignora essa pasta para não publicar seus dados pessoais.

## Tabela pessoal de valores

A tela **Tabela** contém os tetos de compra, referências de venda e regras informadas em 05/08/2026 para videogames, iPhones, televisões, bicicletas, motos e carros. Ao analisar uma oportunidade, o sistema reconhece modelos compatíveis, mostra o teto aplicável, reduz o teto de iPhones com bateria/tela trocada e bloqueia itens marcados como “não comprar”.

Essa tabela é uma regra pessoal, não uma cotação automática. Os comparáveis continuam separados e exigem fonte, data e tipo de preço.

## Comandos

- `npm run dev`: abre o sistema local.
- `npm run build`: valida a compilação de produção.
- `npm run start`: abre a compilação de produção.
- `npm run db:migrate`: aplica as migrações ao banco local.
- `npm test`: executa os testes unitários e de integração.
- `npm run test:e2e`: executa o fluxo completo no navegador.
- `npm run typecheck`: verifica os tipos.

## O que funciona

Cadastro manual e importação, comparáveis, estatísticas, cenários financeiros, recomendação explicável, tabela pessoal, checklists, compra, custos, estoque, anúncio, venda, livro-caixa, exportação CSV e backup JSON.

Não há scraping nem integrações externas ativas. Facebook Marketplace, OLX, Mercado Livre e FIPE são referências para cadastro/consulta manual até que uma API oficial adequada seja configurada.
