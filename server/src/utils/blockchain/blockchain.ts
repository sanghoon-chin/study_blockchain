import { ec as EC } from 'elliptic';
const ec = new EC('secp256k1');

import {Block} from '../block';
import type {IBlockchain, IBlock, ITransaction} from '../../interface'

export class Blockchain implements IBlockchain{
    blockchain:IBlock[];
    mempool:ITransaction[]; // pending transaction 들의 집합

    constructor(){
        this.mempool = [];
        this.blockchain = [];
        if(this.blockchain.length === 0){
            // this.genesisBlock()
        }
    }

    genesisBlock(transaction:ITransaction){
        this.mempool.push(transaction);
    }

    // 아직 참조되지 않은 모든 utxo를 찾는다.
    // 내 키를 전달해주면 내가 쉽게 열 수 있는 utxo의 value를 확인할 수 있다.
    // 모든 블록에 있는(블록에 있는건 검증이 된거니깐) tx들을 돌면서 status=unspent && 내가 열 수 있는 utxo를 찾는다.
    getBalance(key:EC.KeyPair){
        this.blockchain.forEach(block => {
            block.tranactions.forEach(tx => {
                
            })
        })
    }

    get chain() {
        return this.blockchain
    }
}