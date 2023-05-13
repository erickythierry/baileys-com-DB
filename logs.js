import pino, { multistream } from 'pino'
import stream from 'stream'

// função para exibir os logs do Baileys de maneira mais legivel

let bufferStream = new stream.PassThrough();

bufferStream.on('data', (chunk) => {
    
    try {
        let logData = JSON.parse(chunk.toString())
        let params = logData?.params ? logData?.params[0] : ''
        let msg = logData?.msg ? logData?.msg : ''
        console.log('❗', params, '|', msg)
    } catch (error) {
        console.log('❗', error.message)
    }

})

const logger = pino({}, multistream([
    //{ stream: process.stdout },
    { stream: bufferStream }
]))


export default logger