import repl from 'repl';
import fs from 'fs/promises';
import path from 'path';

import socket from './socket';
import { Block, Blockchain, Transaction, TxInput, TxOutput, Wallet } from './utils'
import type { IBlock, IBlockchain, IWallet } from './interface'

const replServer = repl.start({ prompt: '> ' });

const WALLET_LIST_PATH = path.resolve(__dirname, 'data/wallet_list.json');
const PORT_LIST_PATH = path.resolve(__dirname, 'data/port_list.json');

type WalletList = {
    owner: string;
    address: string;
}

let myWallet;

let blockchain = new Blockchain();

replServer.displayPrompt();

replServer.defineCommand('createWallet', {
    help: '지갑을 생성합니다. (이름 입력 필수)',
    async action(name) {
        if (!name) {
            console.error('이름을 입력해주세요');
            this.displayPrompt();
            return false;
        }
        const secretKey = Math.random();
        myWallet = new Wallet(name, String(secretKey));
        console.log('지갑 생성 완료!')
        console.log(myWallet.info)
        const walletList = JSON.parse(await fs.readFile(WALLET_LIST_PATH, { encoding: 'utf-8' })) as WalletList[];
        walletList.push({
            owner: name,
            address: myWallet.info.encodedAddress
        });
        await fs.writeFile(WALLET_LIST_PATH, JSON.stringify(walletList));
        this.displayPrompt();
    }
})

replServer.defineCommand('getWalletList', {
    help: '내 주소를 제외한 다른 사람들의 주소 리스트를 확인하는 명령어입니다.',
    async action() {
        const walletList = JSON.parse(await fs.readFile(WALLET_LIST_PATH, { encoding: 'utf-8' })) as WalletList[];
        // 내 지갑 주소 제외하고 다른 사람들 지갑 주소만 보여줌
        const filteredWallet = walletList.filter(v => v.address != myWallet.encodedAddress);
        console.log(filteredWallet?.map(v => ({ address: v.address, owner: v.owner })));
        this.displayPrompt();
    }
})

replServer.defineCommand('initFirstBlock', {
    help: '제네시스 블록 생성',
    action() {
        const developerWallet = new Wallet('developer', 'admin')
        const txOutput = new TxOutput(myWallet.encodedAddress, 50);
        const coinbaseTx = new Transaction('coinbase', [txOutput], null);
        const firstBlock = new Block(developerWallet, [coinbaseTx])
        firstBlock.pow(firstBlock.bits);
        console.log(blockchain.chain[0].transactions)
        blockchain.appendBlock(firstBlock);
        console.log('제네시스 블록 생성!');
        this.displayPrompt();
    }
})

replServer.defineCommand('showMyBlockchain', {
    help: '내 블록체인을 보여줍니다.',
    action(name) {
        console.log(blockchain.chain);
        this.displayPrompt();
    }
})

replServer.defineCommand('', {
    help: 'memory pool 을 보여줍니다.',
    action(name) {
        console.log();
        this.displayPrompt();
    }
})

replServer.defineCommand('updateBlockchain', {
    help: '내 블록체인을 업데이트하기 위해 주변 노드에게 요청한다.',
    async action() {
        const ports = JSON.parse(await fs.readFile(PORT_LIST_PATH, 'utf-8')) as number[];
        const pickRandPort = ports.filter(v => v !== socket.address().port)
        const nearNodePort = pickRandPort[Math.floor(Math.random() * pickRandPort.length)]

        const data = {
            type: 'requestBlockchain',
            data: blockchain.chain
        }

        socket.send(JSON.stringify(data), nearNodePort, 'localhost', (err) => {
            if (err) console.error(err)
            console.log('요청 성공');
            this.displayPrompt();
        })
    }
})

replServer.defineCommand('broadcastBlockchain', {
    help: '근처 노드에게 블록체인을 브로드캐스트한다.',
    async action() {
        const ports = JSON.parse(await fs.readFile(PORT_LIST_PATH, 'utf-8')) as number[];
        const pickRandPort = ports.filter(v => v !== socket.address().port)
        const nearNodePort = pickRandPort[Math.floor(Math.random() * pickRandPort.length)]

        const data = {
            type: 'blockchain',
            data: blockchain
        }

        socket.send(JSON.stringify(data), nearNodePort, 'localhost', (err) => {
            if (err) console.error(err)
            console.log('전송 성공')
            this.displayPrompt();
        })
    }
})

replServer.defineCommand('getBlock', {
    help: '블록을 업데이트합니다.',
    async action() {

    }
})

replServer.defineCommand('sendBTC', {
    help: '송금하기',
    async action(data) {   // recipinetAddress_value
        const [recipient, value] = data.split('_');
        const isValidAddress = async (address:string) => {
            const list = JSON.parse(await fs.readFile(WALLET_LIST_PATH, 'utf-8'));
            return list.find(v => v.encodedAddress === address)
        }

        const recipientInfo = await isValidAddress(recipient); 
        if(recipientInfo){
            console.log(`${(recipientInfo as IWallet).name}님에게 ${value}BTC 만큼 전송합니다.`);
            const txOutput = new TxOutput(recipient, Number(value));
            console.log(txOutput.info)
            // 블록체인에 있는 모든 unspent이면서 송신자가 쓸 수 있는 트랜잭션을 찾는다 (반복문 돌면서) 
            blockchain.chain.forEach(({transactions}) => {
                transactions.forEach(tx => {
                    console.log(tx)
                })
            })
            this.displayPrompt()
        } else{
            console.log('존재하지 않는 주소입니다. 주소를 올바르게 입력해주세요')
            this.displayPrompt()
            return false;
        }
    }
})

type SocketMsgType = 'transaction' | 'blockchain' | 'block' | 'requestBlockchain';
// SocketMsgType 에 따라서 data property의 타입이 정해지려면 어떻게 해야되나!?
type DataFormat = {
    type: SocketMsgType;
    data: any | Blockchain;
}

socket.on('message', (msg, { port }) => {
    const { type, data: d } = JSON.parse(msg.toString('utf-8')) as DataFormat;
    console.log(d)

    switch (type) {
        case "blockchain":
            if (port === socket.address().port) {
                blockchain = d.data
                console.log('내 블록체인 업데이트 성공!');
            }
            break;
        case "transaction":
            break;
        case 'block':
            break;
        case 'requestBlockchain':
            if (port !== socket.address().port) {
                const data: DataFormat = {
                    type: 'blockchain',
                    data: blockchain.chain
                }
                socket.send(JSON.stringify(data), port, 'localhost', (err) => {
                    if (err) console.error(err)
                    console.log('다른 노드로부터 내 블록체인을 전송함');
                    console.log('전송 성공');
                })
            }
            break;
        default:
            break;
    }
    replServer.displayPrompt();
})