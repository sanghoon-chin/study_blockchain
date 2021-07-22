import express from 'express';
import {createServer} from 'http';
import cors from 'cors'
import { Server, Socket } from "socket.io"

import router from './router/index';
import {createCoinAddress} from './utils/wallet/createCoinAddress'
import type {Wallet, SocketResponse, Utxo} from './interface'
import {Block} from './utils/block/block'
import {BlockChain} from './utils/blockchain/blockchain';
import {UTXO} from './utils/utxo/utxo';

const app = express();
const server = createServer(app);

const io = new Server(server);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({extended: false}));

app.use('/api', router);

app.use((req, res, next) => {
    res.status(404).send('404 error!!')
})

server.listen(4000, () => {
    console.log(`Running at ${4000} port`);
})

type DB<T> = {
    [T: string]: Wallet|null
}

const db:DB<string> = {};
const mempool:Utxo[] = [] // pending tx들

const blockchain = new BlockChain();

io.of('/api').on('connection', (socket:Socket) => {
    console.log('Welcome ', socket.id)
    
    socket.on('create wallet', (data?:string) => {
        const {formatPrivKey, address, privKey, pubKey} = createCoinAddress(data);
        db[socket.id] = {address, formatPrivKey, privKey, pubKey};

        socket.emit('add user', {
            success: true,
            data: db[socket.id]
        });

        const walletList = (Object.values(db) as Wallet[]).map((v) => ({
            pubKey: v.pubKey,
            address: v.address
        }))

        socket.broadcast.emit('other user', {
            success: true,
            data: walletList
        })
    })

    socket.on('mining block', () => {
        const tx = new UTXO(10, 'aaaaa', 'bbbbb');
        const block = new Block([tx] as Utxo[], blockchain.chain);
        let nonce:number = 0
        console.log(block.bits)
        console.time('get nonce')
        while(true){
            const result = block.generateBlockHash(nonce, blockchain)
            console.log(result)
            if(result) break;
            else {
                nonce++;
            }
        }
        console.timeEnd('get nonce')
        console.log(`nonce: ${nonce}`)
        socket.emit('mining success', 'good')
    })
})

const exitRoutine = () => {
    server.close(() => {
        process.exit(0);
    })
}

process.on('SIGTERM', exitRoutine);
process.on('SIGINT', exitRoutine);