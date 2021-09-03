import repl from 'repl';
import fs from 'fs/promises';
import path from 'path';
import unionWith from 'lodash/unionWith'
import isEqual from 'lodash/isEqual'
import ip from 'ip';

import {get_merkle_root_hash} from './utils/block/get_mrkl_root'
import socket from './socket';
import { Block, Blockchain, Transaction, TxInput, TxOutput, Wallet } from './utils'
import type { IBlock, ITx, ITxInput, ITxOutput, IWallet } from './interface'

const replServer = repl.start({ prompt: '> ' });

const WALLET_LIST_PATH = path.resolve(__dirname, 'data/wallet_list.json');
const PORT_LIST_PATH = path.resolve(__dirname, 'data/port_list.json');

type WalletList = {
    owner: string;
    address: string;
}

let myWallet;

let mempool: ITx[] = [];

let blockchain:any[] = []

let waitBlock   // 전송받은 블럭. 검증필요함

const getNearNode = async (): Promise<number> => {
    const ports = JSON.parse(await fs.readFile(PORT_LIST_PATH, 'utf-8')) as number[];
    const pickRandPort = ports.filter(v => v !== socket.address().port)
    const nearNodePort = pickRandPort[Math.floor(Math.random() * pickRandPort.length)]

    return nearNodePort;
}

const getAllPorts = async ():Promise<number[]> => {
    const ports = JSON.parse(await fs.readFile(PORT_LIST_PATH, 'utf-8')) as number[];
    return ports.filter(v => v !== socket.address().port);
}

replServer.displayPrompt();

// 내 지갑 주소 생성
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

// 나를 제외한 모든 지갑 주소 확인
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

// 개발자가 처음에 블록을 채굴함. 개발자에게 50BTC 전송
replServer.defineCommand('initFirstBlock', {
    help: '제네시스 블록 생성',
    action() {
        const txOutput = new TxOutput(myWallet.encodedAddress, 50);
        const coinbaseTx = new Transaction('coinbase', [txOutput], null);
        const firstBlock = new Block(myWallet, [coinbaseTx])
        firstBlock.pow(firstBlock.bits);
        blockchain.push(firstBlock);
        console.log('=======================================');
        console.log(blockchain)
        console.log('=======================================');
        console.log('제네시스 블록 생성!');
        this.displayPrompt();
    }
})

// 내 blockchain 확인하기
replServer.defineCommand('showMyBlockchain', {
    help: '내 블록체인을 보여줍니다.',
    action() {
        console.log('blockchain');
        console.log('=======================================')
        console.log(blockchain);
        console.log('=======================================')
        this.displayPrompt();
    }
})

// 내 mempool 확인하기
replServer.defineCommand('showMempool', {
    help: 'memory pool 을 보여줍니다.',
    action() {
        console.log('memory pool');
        console.log('=======================================')
        console.log(mempool);
        console.log('=======================================')
        this.displayPrompt();
    }
})

replServer.defineCommand('mining', {
    help: 'mempool 에 있는 모든 transaction들 채굴하기',
    async action() {
        const block = new Block(myWallet, mempool, blockchain[blockchain.length - 1]);
        console.log(block);
        block.pow(block.bits)
        // 채굴에 성공했다면 아래 코드를 실행
        // const nearNodePort = await getNearNode();
        const data: DataFormat = {
            type: 'block',
            data: block
        }
        const ports = await getAllPorts();
        for(let i = 0;i<ports.length;i++){
            socket.send(JSON.stringify(data), ports[i], 'localhost', (err) => {
                if (err) console.error(err)
                console.log(`${ports[i]}에게 전송 성공`)
                replServer.displayPrompt();
            })
        }
    }
})

// 내 블록체인을 업데이트하고 싶을 때
replServer.defineCommand('updateBlockchain', {
    help: '내 블록체인을 업데이트하기 위해 주변 노드에게 요청한다.',
    async action() {
        // const ports = JSON.parse(await fs.readFile(PORT_LIST_PATH, 'utf-8')) as number[];
        // const pickRandPort = ports.filter(v => v !== socket.address().port)
        // const nearNodePort = pickRandPort[Math.floor(Math.random() * pickRandPort.length)]
        const nearNodePort = await getNearNode();

        const data = {
            type: 'requestBlockchain',
            data: blockchain
        }

        socket.send(JSON.stringify(data), nearNodePort, 'localhost', (err) => {
            if (err) console.error(err)
            console.log('요청 성공');
            this.displayPrompt();
        })
    }
})

// 내가 채굴하고 나서 다른 노드에게 전파할 때!! 즉, 마이닝 성공하고 난 후에
replServer.defineCommand('broadcastBlockchain', {
    help: '근처 노드에게 블록체인을 브로드캐스트한다.',
    async action() {
        // const ports = JSON.parse(await fs.readFile(PORT_LIST_PATH, 'utf-8')) as number[];
        // const pickRandPort = ports.filter(v => v !== socket.address().port)
        // const nearNodePort = pickRandPort[Math.floor(Math.random() * pickRandPort.length)]
        // const nearNodePort = await getNearNode();

        const data = {
            type: 'blockchain',
            data: blockchain
        }

        const ports = await getAllPorts();
        for(let i = 0;i<ports.length;i++){
            socket.send(JSON.stringify(data), ports[i], 'localhost', (err) => {
                if (err) console.error(err)
                console.log(`${ports[i]}에게 전송 성공`)
                this.displayPrompt();
            })
        }

    }
})

replServer.defineCommand('sendBTC', {
    help: '송금하기',
    async action(data) {   // recipinetAddress_value
        const [recipient, value] = data.split('_');
        const isValidAddress = async (address: string) => {
            const list = JSON.parse(await fs.readFile(WALLET_LIST_PATH, 'utf-8'));
            return list.find(v => v.address === address)
        }

        const recipientInfo = await isValidAddress(recipient);
        if (recipientInfo) {
            console.log(`${recipientInfo.owner}님에게 ${value}BTC 만큼 전송합니다.`);
            let sum = 0;    // sender의 잔고를 저장. satoshi 단위
            let txinputs: ITxInput[] = [];   // transaction 생성을 위한 txinputs
            // 블록체인에 있는 모든 unspent이면서 송신자가 쓸 수 있는 트랜잭션을 찾는다 (반복문 돌면서) 
            blockchain.forEach((block) => {
                block.transactions.forEach(async tx => {
                    // 여기서 스크립트 연산 (잔액 조회)
                    for (let i = 0; i < tx.vout.length; i++) {
                        const vout = tx.vout[i];
                        if (vout.status === 'unspent') {
                            const inpTx = new TxInput(tx, i)
                            await inpTx.generateScriptSig(myWallet, tx.txid)
                            const isMyUTXO = await inpTx.executeScript(vout.scriptPubKey)
                            console.log(isMyUTXO)
                            if (isMyUTXO) {
                                txinputs.push(inpTx)
                                sum += vout.value;
                                // vout.updateStatus()
                                console.log(vout)
                            }

                            if (sum >= Number(value) * (10 ** 8)) break;
                        }
                    }
                    if (sum >= Number(value) * (10 ** 8)) {
                        console.log('잔고가 충분하네요!');
                        let txOutputs: ITxOutput[] = [];
                        const txOutput1 = new TxOutput(recipientInfo.address, 20);
                        txOutputs.push(txOutput1)
                        // if(sum - Number(value) >= 1){
                        // }
                        const diff = (sum - Number(value) * (10 ** 8)) * (10 ** -8)
                        const txOutput2 = new TxOutput(myWallet.encodedAddress, diff);
                        txOutputs.push(txOutput2)
                        console.log(txOutput2)
                        const transaction = new Transaction('tx', txOutputs, txinputs);
                        console.log('transaction 출력')
                        console.log(transaction);
                        mempool.push(transaction)
                        // 새로운 트랜잭션이 생성됐다고 노드들에게 알림;
                        // const nearNodePort = await getNearNode();
                        const ports = await getAllPorts();
                        const data: DataFormat = {
                            type: 'createNewTx',
                            data: mempool
                        }
                        for(let i = 0;i<ports.length;i++){
                            socket.send(JSON.stringify(data), ports[i], 'localhost', (err) => {
                                if (err) console.error(err)
                                console.log(`${ports[i]}님께 mempool 전송됨`)
                                this.displayPrompt()
                            })
                        }
                        this.displayPrompt()
                    } else {
                        console.log('잔액부족. 송금 불가');
                        this.displayPrompt()
                        return;
                    }
                })
            })
        } else {
            console.log('존재하지 않는 주소입니다. 주소를 올바르게 입력해주세요')
            this.displayPrompt()
            return false;
        }
    }
})

type SocketMsgType = 'transaction' | 'blockchain' | 'block' | 'requestBlockchain' | 'createNewTx';

type DataFormat = {
    type: SocketMsgType;
    data: any | Blockchain;
}

socket.on('message', async (msg, { port }) => {
    // const data = JSON.parse(msg.toString('utf-8')) as DataFormat;

    // if(isBlockchainType(data)){
    //     const { type, data: d } = data
    // }

    // const { type, data: d } = JSON.parse(msg.toString('utf-8')) as DataFormat<EnumMsgType>;
    const {type, data: d } = JSON.parse(msg.toString('utf-8')) as DataFormat

    // typescript is 공부하기
    // never 는 절대 못들어간다(2중 방어막 느낌)
    // const abc: never = 'abc';

    switch (type) {
        // case EnumMsgType.Blockchain:
        case 'blockchain':
            if (port !== socket.address().port) {
                blockchain = d
                console.log(blockchain)
                console.log('내 블록체인 업데이트 성공!');
            }
            break;
        case "transaction":
            break;
        case 'block':
            // 채굴에 성공한 블록을 받았을 때 검증해야함.
            if (port !== socket.address().port) {
                const ports = await getAllPorts();
                const valid = verifyBlock(blockchain, d, mempool)
                waitBlock = d
                if(valid) waitBlock.confirmed++
                if(waitBlock.confirmed >= Math.floor(ports.length / 2)){
                    console.log('유효한 블럭!');
                    blockchain.push(waitBlock)
                    console.log('update 된 블럭')
                    console.log(blockchain)
                    waitBlock = null
                    console.log('blockchain 보내기')
                    const _data:DataFormat = {
                        type: 'blockchain',
                        data: blockchain
                    }
                    const nearNodePort = await getNearNode()
                    socket.send(JSON.stringify(_data), nearNodePort, 'localhost', (err) => {
                        if(err) console.error(err)
                        console.log('전송 성공')
                    })
                } else{
                    console.log('검증 실패')
                }
            }
            break;
        case 'requestBlockchain':
            if (port !== socket.address().port) {
                const data: DataFormat = {
                    type: 'blockchain',
                    data: blockchain
                }
                socket.send(JSON.stringify(data), port, 'localhost', (err) => {
                    if (err) console.error(err)
                    console.log('다른 노드에게 내 블록체인을 전송함');
                    console.log('전송 성공');
                    replServer.displayPrompt();
                })
            }
            break;
        case 'createNewTx':
            if (port !== socket.address().port) {
                // update memery pool
                mempool = unionWith(mempool, d, isEqual);
                console.log('mempool')
                console.log(mempool)
                console.log('새로운 트랜잭션 도착!');
            }
        default:
            break;
    }

    replServer.displayPrompt();
})

function verifyBlock(blockchain, block, mempool) {
    let isValid = true;
    if(blockchain[blockchain.length - 1].hash !== block.prev_block){
        isValid = false;
    }
    return isValid
}