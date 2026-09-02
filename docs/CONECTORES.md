# Conectores e fontes

Verificação realizada em 1º de setembro de 2026. Nenhum conector está configurado ou ativo.

| Fonte | Confirmado em documentação oficial | Não confirmado / não suportado no MVP | Estado |
|---|---|---|---|
| Facebook Marketplace | uso manual do Marketplace e orientações de segurança | API pública para pesquisar anúncios; login automatizado; coleta em massa | Não suportado; cadastro manual |
| OLX | OAuth e gestão/importação/status dos próprios anúncios, conforme categoria, plano e credenciais | pesquisa ampla de anúncios de terceiros | Indisponível sem credenciais |
| Mercado Livre | OAuth e recursos oficiais de itens; permissões variam por recurso | que preço anunciado represente venda; ativação sem revisar endpoints atuais | Indisponível sem credenciais |
| Tabela FIPE | consulta pública, mês de referência e preço médio para veículos | API oficial: a própria FIPE declara não oferecer | Digitação assistida futura |

## Referências oficiais

- Facebook: https://www.facebook.com/help/550954179351183/
- OLX: https://developers.olx.com.br/anuncio/api/home.html
- OLX OAuth: https://developers.olx.com.br/anuncio/api/oauth.html
- Mercado Livre: https://developers.mercadolivre.com.br/pt_br/api-docs-pt-br/
- Mercado Livre autenticação: https://developers.mercadolivre.com.br/pt_br/realizacao-de-testes/autenticacao-e-autorizacao
- FIPE: https://veiculos.fipe.org.br/

## Contrato obrigatório

Todo adaptador deve declarar fonte, URL oficial, autenticação, dados realmente disponíveis, limites, última sincronização, erro e estado. Um adaptador mock deve retornar explicitamente `INDISPONIVEL`; nunca dados silenciosamente fabricados.
