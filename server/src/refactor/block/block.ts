import { getHash, little_endian, reverse_order } from '../helper';
import {Transaction, TxOutput} from '../transaction/transaction'
import {get_merkle_root_hash} from '../block/get_mrkl_root'

export class Block {
    hash = '';
    ver = 1;
    time = Math.floor(Date.now() * 0.001);
    prev_block
    mrkl_root
    bits
    height
    nonce
    transactions:any[] = []

    confirmed?:number;  // 몇 명이나 합의했는지

    constructor(miner, txs:any[]){
        this.bits = this.generateBits();
        this.generateCoinbaseTx(miner);
        this.updateTx(txs)
        this.mrkl_root = this.generateMrklRoot()
    }

    // 다른 사람들이 이 블록이 유효한지 검증할 수 있게 돌려볼 수 있는 코드
    verifyBlock(){

    }

    update_height_n_prevblockHash(height:number, prevBlockHash:string){
        this.height = height + 1;
        this.prev_block = prevBlockHash;
    }

    private generateCoinbaseTx(miner){
        const initValue = 50;   //50btc
        const txOutput = new TxOutput(miner.info.encodedAddress, initValue)
        const tx = new Transaction('coinbase', [txOutput], null)
        this.transactions.push(tx)
    }

    private updateTx(txs:any[]){
        this.transactions.push(...txs)
    }

    private generateMrklRoot() {
        console.log(this.transactions)
        const txids = this.transactions.map(v => v.txID as string)
        return get_merkle_root_hash(txids);
    }

    private generateBlockHash(nonce:number){
        const headerItems = little_endian(String(this.ver)) + reverse_order(this.prev_block) + 
                    reverse_order(this.mrkl_root) + little_endian(String(this.time)) + 
                    reverse_order(String(this.bits)) + little_endian(String(nonce));
        const hash1 = getHash.binHash(headerItems);
        const hash2 = getHash.hexHash(hash1);
        return reverse_order(hash2);
    }

    pow(target:string){
        let nonce = 0;
        console.time('채굴에 걸린시간');
        while(true){
            const blockHash = this.generateBlockHash(nonce);
            if(blockHash < target){
                this.hash = blockHash;
                break;
            } else{
                nonce++;
            }
        }
        console.timeEnd('채굴에 걸린시간');
        this.nonce = nonce;
        return true;
    }

    // https://medium.com/@dongha.sohn/bitcoin-6-%EB%82%9C%EC%9D%B4%EB%8F%84%EC%99%80-%EB%AA%A9%ED%91%AF%EA%B0%92-9e5c0c12a580
    private generateBits() {
        // 0x1e0001(1_966_081) ~ 0x1effff(2_031_615) => 앞에 0의 개수가 6~9개 사이로 나옴. 적당한 듯
        const getRandBits = (min, max) => {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        const bits = getRandBits(0x1e0001, 0x1effff);

        const hexBits = bits.toString(16);
        // const MAXIMUM_TARGET = 0x0000 0000 FFFF 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000; 고정된 상수값
        const MAXIMUM_TARGET = 2 ** 224;
        const _coefficient = '0x' + hexBits.slice(2);
        const _exponent = '0x' + hexBits.slice(0, 2);

        const coefficient = +Number(_coefficient).toString();
        const exponent = +Number(_exponent).toString();

        const target = coefficient * (2 ** (8 * (exponent - 3)));
        const target_hex = target.toString(16).padStart(64, '0');
        const difficulty = MAXIMUM_TARGET / target;

        console.log(`difficulty: ${difficulty}, current target: ${target_hex}`);
        // test 용. 시간이 너무 오래 걸려서...
        return `0001115490000000000000000000000000000000000000000000000000000000`
        // return target;
        // return {
        //     currentTarget: target,
        //     currentTargetHex: '0x' + target_hex,
        //     difficulty
        // }
    }


    get info(){
        return {
            version: this.ver,
            merkle_root: this.mrkl_root,
            bits: this.bits,
            time: this.time,
            prev_block_hash: this.prev_block,
            nonce: this.nonce,
            block_hash: this.hash
        }
    }
}


import {Wallet} from '../wallet/wallet'

const myWallet = new Wallet('tom', 'brettonwoods_7_1_1944')
console.log(myWallet.info)
const txOutput = new TxOutput(myWallet.info.encodedAddress, 20)
const tx = new Transaction('coinbase', [txOutput], null)

