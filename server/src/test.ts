import {generateKeyPair, getAddress} from './utils/wallet';
import { v4 as uuidv4 } from 'uuid';
import { Blockchain } from './utils/blockchain';

import type {IWallet} from './interface'
import { TxInput, TxOutput } from './utils/transaction';

// 지갑 생성
const createNewUser = (name:string, secretKey?:string):IWallet => {
    const keyPair = generateKeyPair(secretKey);
    const encodedAddress = getAddress(keyPair.getPublic(true, 'hex'));
    return {
        id: uuidv4(),
        name, 
        keyPair, 
        encodedAddress,
        createdAt: new Date()
    };
}

const alice = createNewUser('alice', 'brettonwoods_7_1_1944');
const bob = createNewUser('bob', 'random');
const charlie = createNewUser('charlie', 'random2');
console.log(alice);

// 처음 블록체인을 만들때만 실행
const blockchain = new Blockchain();
const coinbase = blockchain.generateCoinbaseTransaction(alice.encodedAddress)
blockchain.genesisBlock(coinbase)

console.log('block chain 출력');
console.log('==============================')
console.log(blockchain.chain)
console.log('==============================')

// 여기서부터 거래 시작
console.log('alice가 bob에게 20btc를 보냅니다.');
console.log('transaction output 생성')
console.log('==============================')
const a2b20TxOutput = new TxOutput(bob.encodedAddress, 20);
console.log(a2b20TxOutput.__str__);
console.log('==============================');
console.log('transaction input 생성. 내가 사용할 수 있는 utxo 찾기!');
const ab2b20TxInput = new TxInput(alice.keyPair, blockchain.blockchain[0].tranactions[0]);
blockchain.getBalance(ab2b20TxInput, a2b20TxOutput)
