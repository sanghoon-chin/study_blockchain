import {getHash} from '../../index';
import { ec as EC } from 'elliptic';
const ec = new EC('secp256k1');

import {generateKeyPair} from '../wallet/index';

export class Transaction{
    senderAddress:string = '';
    recipientAddress:string = '';
    amount:number = 0;
    signature: string = ''; // ECDSA 서명 => 잠금 해제할 때 필요함.

    constructor(senderAddress:string, recipientAddress:string, amount:number){
        this.senderAddress = senderAddress;
        this.recipientAddress = recipientAddress;
        this.amount = amount;
    }

    generateCoinbase(address:string){
        this.senderAddress = '';    // 블록의 가장 처음에 오는 transaction으로 sender가 없음. amount를 miner한테 줌
    }

    generateHash(){
        const concatStr = this.senderAddress + this.recipientAddress + this.amount;
        return getHash.hash(concatStr);
    }

    signTx(keyPair:EC.KeyPair){
        const sig = keyPair.sign(this.generateHash(), '')
        this.signature = sig.toDER('hex');  // this.checkValid로 체크 가능
        console.log('서명 완료');
    } 

    // 다른 노드들이 검증할 수 있게!
    checkValid(){
        // coinbase transaction
        if(this.senderAddress == null){
            return true
        }
        // 서명이 안되있으면 false
        if(!this.signature){
            return false
        }
        
        const pubKey = ec.keyFromPublic(this.senderAddress, 'hex');
        console.log(`Public Key: ${pubKey}`)
        return pubKey.verify(this.generateHash(), this.signature);
    }
}

// const myKey = generateKeyPair();