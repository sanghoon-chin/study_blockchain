import { BlockType, Utxo } from '../../interface';
import { little_endian, reverse_order, getHash } from '../index';
import { get_merkle_root_hash } from './merkle_root';
import { UTXO } from '../utxo/utxo';

export class Block {
    hash: string;
    ver: number;
    prev_block: string;
    mrkl_root: string;
    time: number;
    bits: string;
    tx: Utxo[]

    constructor(txs: Utxo[], blockchain) {
        this.hash = '';
        this.time = Math.floor(Date.now() * 0.001);
        this.ver = 1;
        this.mrkl_root = ''
        this.prev_block = blockchain[blockchain.length - 1]?.hash || ''
        this.bits = ''
        this.tx = txs
    }

    private generateMrklRoot() {
        const txids = this.tx.map(v => v.txid as string)
        this.mrkl_root = get_merkle_root_hash(txids);
    }

    // 난이도 조절
    // https://medium.com/@dongha.sohn/bitcoin-6-%EB%82%9C%EC%9D%B4%EB%8F%84%EC%99%80-%EB%AA%A9%ED%91%AF%EA%B0%92-9e5c0c12a580
    private generateBits() {
        // const rand = Math.floor(Math.random() * 5) + 3;
        const rand = Math.floor(Math.random()) + 5;
        console.log(rand)
        const randHash = getHash.hash('temp').slice(rand)
        const target = randHash.padStart(64, '0');
        console.log(`target: ${target}`)
        this.bits = target
        return target
    }

    init(){
        this.generateBits();       // 난이도 조절
        this.generateMrklRoot();   // 전달받은 txid로 머클루트값 생성
    }

    miningBlock(nonce, blockchain) {
        const block: BlockType = {
            bits: this.bits,
            hash: this.hash,
            mrkl_root: this.mrkl_root,
            nonce,
            prev_block: this.prev_block,
            time: this.time,
            ver: this.ver,
            tx: this.tx
        }
        blockchain.appendBlock(block)
    }

    pow(nonce: number, blockchain) {
        // version + preHash + merkleRoot + time + bits + nonce 순서로!!
        const headerItems = little_endian(String(this.ver)) + reverse_order(this.prev_block) + reverse_order(this.mrkl_root) + little_endian(String(this.time)) + reverse_order(String(this.bits)) + little_endian(String(nonce))
        const hash1 = getHash.binHash(headerItems);
        const hash2 = getHash.hexHash(hash1);
        const blockHash = reverse_order(hash2);

        // 난이도보다 작은 blockhash라면 성공
        if (this.bits > blockHash) {
            console.log('채굴 성공');
            console.log(this.bits, blockHash)
            this.hash = blockHash;
            this.miningBlock(nonce, blockchain);
            // 50 코인 제공
            return 50
        } else {
            // console.log('채굴 실패');
            return false;
        }
    }

    // generateGenesisBlock(recipient: string, blockchain) {
    //     if (blockchain.length === 0) {
    //         const utxo = new UTXO(50, null, recipient);
            
    //     } else {
    //         throw new Error('already have genesis block!');
    //     }
    // }
}

// let txids = [
//     "a8684779e6e305c8ebfa11c030b4fa867668b6bf07efd08b10d3ed4a3d079556",
//     "64ba90af72a7df2fa00f5e91286af8996f0c73cee947e233ca4705a73f56f637",
//     "63f74e2a81f24f47c2605e3c1637556a2fe20dd1872f7f75f77fb56ee452306b",
//     "f4b432258566696081251add5f6246a0cce10bd4160ace60c7461b68bf27adae",
//     "71db26047cf6d96840bd3f6fbc5bf05c9e36424b67b78f26187cbc1194568d32",
//     "f1940be7a6402b9cb38146557389e3b1ab41b6f6929505ec466b05a97a32e736",
//     "c0a41086841f25f05e63c907692e70df6149a3bfd86e2c6020ed2f6463e0f306",
//     "872d3c07654effe2f98f7fbd7a7a9ebb8d72b4aadfd3c0bbc930054cea6a21ae",
//     "39dfd44f1b1af4b8b67c7bad6ee2babe264c9ee1ab86988afe7400dba0322b2e",
//     "ae8a5530ee64371660802cf8f6c66121b4577feaabca2cb5c2e11b80161a0390",
//     "39f1e09bf729b4cbf7fec6edeb9a7d6102f10dec3860016a6097f9cb69eaa326",
//     "b77c48b4f4d4850b82aebe41c3b93972d49da356fa5620906018e76246390182",
//     "2020fc001ae7384c921a123e27b0ff01d9ff5007c3b7eb8f130525b4ae48eb78",
//     "436d2a1fca8ae1e546a8227377fb067c414b4b20bd4945cb0abe2c82f5ab1b3e",
//     "a99edf26800c39e9a7f8b8cc4afb67b597461040db61e9c5c0dfbd31a9295a95",
//     "e4f5d909582e1daa0ab2ab22614d24559083113bd4766ceffe5b1c0d18801851"
// ]

// const block = new Block(txids)
// console.log(block.bits)