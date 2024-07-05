# Baileys com DB prisma para salvar as sessões em um DB (MySQL, Postgres, etc)

### Este é um exemplo inicial de como usar o projeto Baileys e armazenar as chaves de autenticação em um banco de dados.

## Como usar:

1. Crie uma instância do MySQL ou Postgres.
2. Clone este repositório e instale as dependências com `npm install`.
3. Copie o arquivo `sample.env` para `.env` e preencha os dados do seu banco.
4. Na linha 21 do arquivo `index.js`, você pode escolher o nome do bot que será salvo no banco de dados na coluna `sessionID`.
5. Por fim, execute o projeto com `npm start` . O QR code do bot aparecerá no console. Escaneie-o com seu WhatsApp.
6. Pronto! O bot foi criado e as chaves de autenticação estão sendo salvas no banco de dados (muito melhor do que armazená-las em arquivos JSON localmente).
- As auth keys estarão na tabela `sessions` com as colunas: `id, sessionID, creds` e `created_at`

## Dicas:

- O `index.js` é apenas o exemplo inicial do projeto Baileys. Sinta-se à vontade para modificá-lo.
- O `usePrismaDBAuthStore.js` já está preparado para usar múltiplos bots no mesmo script, bastando passar um nome diferente para cada um.
- O `usePrismaDBAuthStore.js` utiliza a mesma estrutura da função `useMultiFileAuthState` do Baileys, trocando apenas o salvamento do arquivo `creds.json` para o DB, o restante das keys são salvas no disco normalmente.
- O `logs.js` é uma instância do Pino para exibir os logs do Baileys de maneira mais legível no console.

## Finalizando:

- Sinta-se à vontade para modificar e melhorar este projeto. É bem simples mudar para outros bancos de dados relacionais.
- Pull requests são bem-vindos!
