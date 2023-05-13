import pg from 'pg';
const { Pool } = pg;

import config from "./config.js"

// Configurações de conexão com o banco de dados
const dbConfig = config

// Cria um pool de conexões com o banco de dados
const pool = new Pool(dbConfig);

// Variável global para armazenar a conexão e checar se a tabela auth_keys já foi criada
let dbConnection = null;
let authKeysTableCreated = false;

// Função que retorna a conexão previamente criada ou cria uma nova conexão se ainda não existir
async function getDbConnection() {
    if (dbConnection) {
        return dbConnection;
    }

    console.log('Criando nova conexão com o banco de dados');
    dbConnection = await pool.connect();

    // Checa se a tabela auth_keys já foi criada
    if (!authKeysTableCreated) {
        const query = `SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'auth_keys'
      )`;
        const { rows } = await dbConnection.query(query);
        const authKeysTableExists = rows[0].exists;

        // tabela é criada caso nao exista
        if (!authKeysTableExists) {
            console.log('❗Criando tabela auth_keys');
            const createTableQuery = `
          CREATE TABLE auth_keys (
            id serial NOT NULL,
            bot_id VARCHAR(255),
            key_id VARCHAR(255),
            key_json TEXT,
            CONSTRAINT auth_keys_pk PRIMARY KEY (id)
          ) WITH (
            OIDS=FALSE
          );
          ALTER TABLE auth_keys
          ADD COLUMN created_at TIMESTAMP DEFAULT NOW(),
          ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
        `;
            await dbConnection.query(createTableQuery);
            console.log('Tabela auth_keys criada com sucesso');
        }

        authKeysTableCreated = true;
    }

    return dbConnection;
}

// Exporta a função para ser utilizada em outros módulos
export default getDbConnection;
