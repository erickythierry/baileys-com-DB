import { WAProto as proto, initAuthCreds, BufferJSON } from "@whiskeysockets/baileys"

import getDbConnection from "./db.js"

export default async function usePostgresAuthState(sessionID) {

    async function writeData(data, key) {
        const dataString = JSON.stringify(data, BufferJSON.replacer);
        await insertOrUpdateAuthKey(sessionID, key, dataString)
        return;
    };

    async function readData(key) {
        try {
            const rawData = await getAuthKey(sessionID, key)
            const parsedData = JSON.parse(rawData, BufferJSON.reviver);
            return parsedData;
        } catch (error) {
            console.log('❌', error.message)
            return null;
        }
    }

    async function removeData(key) {
        try {
            await deleteAuthKey(sessionID, key)
        } catch (error) {
            // Não fazer nada em caso de erro
        }
    }

    let creds = await readData('creds');
    if (!creds) {
        creds = initAuthCreds();
        await writeData(creds, 'creds');
    }

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(ids.map(async (id) => {
                        let value = await readData(`${type}-${id}`);
                        if (type === 'app-state-sync-key' && value) {
                            value = proto.Message.AppStateSyncKeyData.fromObject(value);
                        }
                        data[id] = value;
                    }));
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            tasks.push(value ? writeData(value, key) : removeData(key));
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => {
            return writeData(creds, 'creds');
        }
    };
}


async function insertOrUpdateAuthKey(botId, keyId, keyJson) {
    const db = await getDbConnection();

    // Verifica se o registro já existe na tabela
    const selectQuery = `SELECT id FROM auth_keys WHERE bot_id = $1 AND key_id = $2`;
    const { rows } = await db.query(selectQuery, [botId, keyId]);

    // Se o registro já existe, faz um update
    if (rows.length > 0) {
        const updateQuery = `UPDATE auth_keys SET key_json = $1, updated_at = NOW() WHERE id = $2`;
        await db.query(updateQuery, [keyJson, rows[0].id]);
        //console.log('Registro atualizado na tabela auth_keys');
    } else { // Se o registro não existe, faz um insert
        const insertQuery = `INSERT INTO auth_keys (bot_id, key_id, key_json) VALUES ($1, $2, $3)`;
        await db.query(insertQuery, [botId, keyId, keyJson]);
        //console.log('Registro inserido na tabela auth_keys');
    }
}

// Função que busca um registro na tabela auth_keys
async function getAuthKey(botId, keyId) {
    const db = await getDbConnection();

    // Faz a consulta na tabela auth_keys
    const query = `SELECT key_json FROM auth_keys WHERE bot_id = $1 AND key_id = $2`;
    const { rows } = await db.query(query, [botId, keyId]);

    // Retorna o conteúdo do key_json ou null, caso não tenha encontrado nenhum registro
    return rows.length > 0 ? rows[0].key_json : null;
}

// Função que deleta um registro da tabela auth_keys
async function deleteAuthKey(botId, keyId) {
    const db = await getDbConnection();

    // Faz a exclusão na tabela auth_keys
    const query = `DELETE FROM auth_keys WHERE bot_id = $1 AND key_id = $2`;
    await db.query(query, [botId, keyId]);
}