# Formato JSON interno

O backup gerado em `/api/export/json` usa `format: "briquego-export"`, `version: 1`, valores em centavos (`moneyUnit: "BRL_CENTS"`) e datas ISO 8601. Coleções: `opportunities`, `comparables`, `inventory`, `sales` e `ledger`.

Antes de uma futura restauração, validar versão, proprietário, IDs, relacionamentos, enums, limites de tamanho e totais financeiros. Importações nunca devem sobrescrever lançamentos existentes; use novos IDs e uma trilha de auditoria.
