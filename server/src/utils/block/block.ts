import {get_merkle_root_hash} from './get_mrkl_root';
import {little_endian, reverse_order, getHash} from '../helper';
import type {IBlock, ITransaction} from '../../interface';
import {CoinbaseTransaction} from '../transaction'

export class Block implements IBlock{
    hash;
    ver;
    prev_block;
    mrkl_root;
    time;
    bits;
    height;
    tranactions:ITransaction[];

    constructor(txs:ITransaction[], prev_block?:string) {
        this.time = Math.floor(Date.now() * 0.001);
        this.ver = 1;
        this.hash = '';
        this.mrkl_root = ''
        this.prev_block = prev_block || ''
        this.bits = this.generateBits();
        this.tranactions = txs
    }

    // 첫번째 트랜잭션은 miner한테 보상으로 제공되는 coinbase여야함.
    addCoinbaseTx(){

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

        // bigint로 바꾸기 => 근데 몫만 나오니깐 잘 해보기
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

        return target;
        // return {
        //     currentTarget: target,
        //     currentTargetHex: '0x' + target_hex,
        //     difficulty
        // }
    }

    generateMrklRoot() {
        const txids = this.tranactions.map(v => v.txID as string)
        this.mrkl_root = get_merkle_root_hash(txids);
    }

    generateBlockHash(nonce:number){
        const headerItems = little_endian(String(this.ver)) + reverse_order(this.prev_block) + reverse_order(this.mrkl_root) + little_endian(String(this.time)) + reverse_order(String(this.bits)) + little_endian(String(nonce));
        const hash1 = getHash.binHash(headerItems);
        const hash2 = getHash.hexHash(hash1);
        return reverse_order(hash2);
    }

    pow(target:string){
        let nonce = 0;
        console.time('채굴 중');
        while(true){
            const blockHash = this.generateBlockHash(nonce);
            if(blockHash < target){
                break;
            } else{
                nonce++;
            }
        }
        console.timeEnd('채굴 중');
        console.log('채굴 성공');
        return true;
    }
}