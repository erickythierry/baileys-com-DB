import fs from 'fs/promises'
import path from 'path'
import { WAProto as proto, initAuthCreds, BufferJSON } from "@whiskeysockets/baileys"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const fixFileName = (file) => {
    if (!file) {
        return undefined;
    }
    const replacedSlash = file.replace(/\//g, '__');
    const replacedColon = replacedSlash.replace(/:/g, '-');
    return replacedColon;
};

export async function keyExists(sessionID) {
    try {
        let key = await prisma.session.findUnique({ where: { sessionID: sessionID } })
        return !!key
    } catch (error) {
        console.log(`${error}`)
        return false
    }
}

export async function saveKey(sessionID, keyJson) {
    const jaExiste = await keyExists(sessionID)
    try {
        if (!jaExiste) return await prisma.session.create({ data: { sessionID: sessionID, creds: JSON.stringify(keyJson) } });
        await prisma.session.update({ where: { sessionID: sessionID }, data: { creds: JSON.stringify(keyJson) } })

    } catch (error) {
        console.log(`${error}`)
        return null
    }
}

export async function getAuthKey(sessionID) {
    try {
        let registro = await keyExists(sessionID)
        if (!registro) return null
        let auth = await prisma.session.findUnique({ where: { sessionID: sessionID } })
        return JSON.parse(auth?.creds)
    } catch (error) {
        console.log(`${error}`)
        return null
    }
}

async function deleteAuthKey(sessionID) {

    try {
        let registro = await keyExists(sessionID)
        if (!registro) return;
        await prisma.session.delete({ where: { sessionID: sessionID } })
    } catch (error) {
        console.log('2', `${error}`)
    }
}

async function fileExists(file) {
    try {
        const stat = await fs.stat(file);
        if (stat.isFile()) return true
    } catch (error) {
        return;
    }
}

export default async function usePrismaDBAuthStore(sessionID) {

    const localFolder = path.join(process.cwd(), 'sessions', sessionID)
    const localFile = (key) => path.join(localFolder, (fixFileName(key) + '.json'))
    await fs.mkdir(localFolder, { recursive: true });


    async function writeData(data, key) {
        const dataString = JSON.stringify(data, BufferJSON.replacer);

        if (key != 'creds') {
            await fs.writeFile(localFile(key), dataString)
            return;
        }
        await saveKey(sessionID, dataString)
        return;
    };

    async function readData(key) {
        try {

            let rawData;

            if (key != 'creds') {
                if (!(await fileExists(localFile(key)))) return null;
                rawData = await fs.readFile(localFile(key), { encoding: 'utf-8' })
            } else {
                rawData = (await getAuthKey(sessionID))
            }

            const parsedData = JSON.parse(rawData, BufferJSON.reviver);
            return parsedData;
        } catch (error) {
            return null;
        }
    }

    async function removeData(key) {
        try {
            if (key != 'creds') {
                await fs.unlink(localFile(key))
            } else {
                await deleteAuthKey(sessionID)
            }
        } catch (error) {
            return;
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