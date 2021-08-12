import { ec as EC } from 'elliptic';
const ec = new EC('secp256k1');

import { OP_CODES } from './script'
import { bs58_decode, little_endian, getHash, reverse_order } from '../helper';
import type { ITxInput, ITransaction, ITxOutput } from '../../interface';

export class TxInput implements ITxInput {
    txid    // 참조한 출력의 txid
    scriptSig
    vout
    sequence = 0xFFFFFFFF;

    keyPair: EC.KeyPair
    msgHash: string
    prevUTXO:ITransaction

    constructor(senderKeyPair: EC.KeyPair, prevTx:ITransaction) {
        this.keyPair = senderKeyPair;
        this.prevUTXO = prevTx;
        this.msgHash = prevTx.txID
        this.scriptSig = this.generateScriptSig();
        // this.vout = this.updateVout();
    }

    // updateVout() {
    //     return '0'
    // }

    generateMsgHash(){
        // const msg: number[] = [];
        // msg.push(1, 2, 3, 4, 5)
        // this.msgHash = msg
        // this.msgHash = '8190374a5a1feb54fab4417fac1a3d9185de06fd8dcac34822c7cd00083638b1'
        // return '8190374a5a1feb54fab4417fac1a3d9185de06fd8dcac34822c7cd00083638b1'   // test
    }

    // 서명크기 + SIGHASH를 포함하는 사용자의 개인 키에서 사용자의 지갑이 생성하는 서명(서명직렬화, toDER) + 공개 키 길이(바이트) + 해시되지 않은 공개키
    generateScriptSig(){
        const signLen = (this.generateSignature().length / 2).toString(16);
        const pubKey = this.keyPair.getPublic(true, 'hex');
        const pubKeyLen = (pubKey.length / 2).toString(16);
        return signLen + this.generateSignature() + pubKeyLen + pubKey;
    }

    // 서명직렬화를 return하는 함수 (9가지 요소로 구성됨)
    // 아래 식이 결국 DER 형식임.
    // DER 시퀀스의 시작 + 시퀀스의 길이 + 정수 값이 뒤따릅니다. + 정수의 길이 + R + 다음에 또 다른 정수가 옵니다. +  정수의 길이 + S + SIGHASH
    generateSignature(type?:string):string{
        if(type){
            return this.keyPair.sign(this.msgHash).toDER()
        }
        return this.keyPair.sign(this.msgHash).toDER('hex')
    }

    // transaction hash(출력의 참조 txid) + '00000000' + 스크립트의 길이 + scriptSig(this.generateScriptSig) + 시퀀스(FFFFFFFF)
    get __oneLine__(){
        return 
    }

    // 트랜잭션해시(32) + 출력인덱스(4) + 잠금해제스크립트길이(varInt) + 잠금해제스크립트 + 시퀀스번호
    get __str__() {
        return {
            txid: this.txid,
            vout: this.vout,
            scriptSig: this.scriptSig,
            sequence: this.sequence
        }
    }
}

export class TxOutput implements ITxOutput {
    recipientAddress: string;
    value: number;
    scriptPubKey: string;

    constructor(recipientAddress: string, value: number) { // bs58 encoding format
        this.recipientAddress = recipientAddress;
        this.value = this.btc2satoshi(value);
        this.scriptPubKey = this.createOutput();
    }

    // 1BTC = 10^8 satoshi
    btc2satoshi(value: number){
        return value * (10 ** 8);
    }

    // scriptPubKey(Locking script 생성하는 로직)
    createOutput() { 
        const decodedRecipientAddress = bs58_decode(this.recipientAddress);
        // 14 정체?? => 수정 필요
        const scriptPubKey = OP_CODES['OP_DUP'] + OP_CODES['OP_HASH160'] + '14' + decodedRecipientAddress + OP_CODES["OP_EQUALVERIFY"] + OP_CODES['OP_CHECKSIG'];
        // console.log(`scriptPubKey: ${scriptPubKey}`);
        return scriptPubKey;
    }

    // 8bytes + 1bytes + pubkey
    get __oneLine__(){
        return `${little_endian(this.value.toString(16), 8)}${(this.createOutput().length / 2).toString(16)}${this.createOutput()}`
    }

    get __str__() {
        return {
            value: this.value,
            scriptPubKey: this.scriptPubKey
        }
    }
}

export class Transaction implements ITransaction {
    version = 1;
    locktime = 0;
    txID:string
    vin: ITxInput[]
    vout: ITxOutput[]
    status: 'spent'|'unspent'  // spent 인지 unspent인지

    constructor(vin: ITxInput[], vout: ITxOutput[]) {
        this.vin = vin;
        this.vout = vout;
        this.txID = this.generateTxID()
        this.status = 'unspent'
    }

    generateTxID() {
        const _txid = this.generateTransaction();
        return getHash.hexHash(getHash.binHash(_txid))
    }
    
    generateTransaction(){
        const inpLen = reverse_order(String(this.vin.length));
        const outLen = reverse_order(String(this.vout.length));
        let IN = '';
        let OUT = '';
        this.vin.forEach(v => {
            IN += (little_endian(v.txid as string) as string) + little_endian(v.vout as string) + Number(v.scriptSig.length / 2).toString(16) + v.scriptSig + 'FFFFFFFF'
        })
        this.vout.forEach(v => {
            const satoshi = (v.value * (10 ** 8)).toString(16);
            const val = (little_endian(satoshi) as string).length < 16 ? little_endian(satoshi) + '00000000' : little_endian(satoshi);
            const len = (v.scriptPubKey.length / 2).toString(16);
            // 송금금액 + 스크립트 길이 + scriptPubKey
            OUT += (val + len + v.scriptPubKey);
        })
        return little_endian(String(this.version)) + inpLen + IN + outLen + OUT;
    }

    get __str__() {
        return {
            version: this.version,
            locktime: this.locktime,
            vin: this.vin,
            vout: this.vout,
            txID: this.txID,
            status: this.status
        }
    }
}

// input이 없고 output만 존재함. output은 하나
export class CoinbaseTransaction implements ITransaction {
    version = 1;
    locktime = 0;
    txID:string;
    vin = [];
    vout:ITxOutput[];
    status: 'spent'|'unspent'

    constructor(txOutput: ITxOutput){
        this.vout = [txOutput];
        this.status = 'unspent'
        this.txID = this.generateTxID();
    }

    generateTransaction(){
        const outLen = reverse_order(String(this.vout.length));
        let OUT = '';
        this.vout.forEach(v => {
            const satoshi = (v.value).toString(16);
            const val = (little_endian(satoshi) as string).length
            const len = (v.scriptPubKey.length / 2).toString(16);
            // 송금금액 + 스크립트 길이 + scriptPubKey
            OUT += (val + len + v.scriptPubKey);
        })
        return little_endian(String(this.version)) + outLen + OUT;
    }

    generateTxID() {
        const _txid = this.generateTransaction();
        return getHash.hexHash(getHash.binHash(_txid))
    }

    get __str__() {
        return {
            version: this.version,
            locktime: this.locktime,
            vin: this.vin,
            vout: this.vout,
            txID: this.txID,
            status: this.status
        }
    }
}