import { ec as EC } from 'elliptic';
const ec = new EC('secp256k1');

import {Block} from '../block';
import {CoinbaseTransaction, TxOutput, executeScript} from '../transaction';
import type {IBlockchain, IBlock, ITransaction, ITxInput, ITxOutput} from '../../interface'

export class Blockchain implements IBlockchain{
    blockchain:IBlock[];
    mempool:ITransaction[]; // pending transaction 들의 집합
    private rewardCoin = 50;

    constructor(){
        this.mempool = [];
        this.blockchain = [];
    }

    generateCoinbaseTransaction(minerAddress:string){
        console.log('coinbase transaction을 추가합니다')
        // 100개의 블록이 생성될 때마다 보상 코인은 절반으로 줄어든다.
        if(this.blockchain.length !== 0 && this.blockchain.length % 100 === 0){
            this.rewardCoin /= 2;
        }
        const txOutput = new TxOutput(minerAddress, this.rewardCoin);
        const coinbaseTx = new CoinbaseTransaction(txOutput.__str__);
        console.log('coinbase transaction 정보')
        console.log(coinbaseTx.__str__);
        return coinbaseTx.__str__;
    }

    genesisBlock(transaction:ITransaction){
        const block = new Block([transaction]);
        const isMiningSuccess = block.pow(block.bits);
        if(isMiningSuccess){
            block.height = this.blockchain.length + 1
            this.addBlock(block);
        }
    }

    // 아직 다른 입력으로 참조되지 않은 모든 utxo를 찾는다.
    // 내 키를 전달해주면 내가 쉽게 열 수 있는 utxo의 value를 확인할 수 있다.
    // 모든 블록에 있는(블록에 있는건 검증이 된거니깐) tx들을 돌면서 status=unspent && 내가 열 수 있는 utxo를 찾는다.
    getBalance(txInput: ITxInput, txOutput:ITxOutput){
        this.blockchain.forEach(block => {
            block.tranactions.forEach(tx => {
                const bool = executeScript(txInput, txOutput)
                console.log(bool)
                if(bool){
                    console.log('내 돈!')
                    tx.status = 'spent'
                }
                // if(tx.status === 'unspent'){
                //     tx.vin.forEach(vin => {
                //     })
                // }
            })
        })
    }

    addBlock(block:IBlock){
        this.blockchain.push(block);
    }

    get chain() {
        return this.blockchain
    }
}