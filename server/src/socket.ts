import dgram from 'dgram';
import path from 'path';
import fs from 'fs/promises';

const socket = dgram.createSocket('udp4');
const PORT = Math.floor(Math.random() * 1000 + 3000);
const FILE_PATH = path.resolve(__dirname, 'data/port_list.json');

socket.bind(PORT);

// socket.send(msg, 0, msg.length, PORT, 'localhost', (err) => {
//     if(err) console.error(err)
// })

const init = async (address:string) => {
    const ports = JSON.parse(await fs.readFile(FILE_PATH, 'utf-8')) as number[]
    ports.push(PORT);
    await fs.writeFile(FILE_PATH, JSON.stringify(ports));
}

socket.once('listening', async () => {
    console.log(`소켓이 ${PORT}번에서 실행중`)
    await init(socket.address().address);
})

export default socket;