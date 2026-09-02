# Execução local

O BriqueGO foi definido como sistema exclusivamente local. Instale Node.js 22+, execute `npm install` e depois `npm run dev`. Acesse `http://localhost:3000`.

Para uso diário com a compilação validada, execute `npm run build` uma vez e depois `npm run start`.

O banco fica em `data/briquego.db`. Feche o processo antes de copiar o arquivo para backup. Não sincronize a pasta `data/` com o repositório Git.

Não existe implantação online ativa. Se isso mudar no futuro, autenticação, controle de acesso, segredos, backup remoto e revisão de segurança deverão ser implementados antes de expor o sistema à internet.
