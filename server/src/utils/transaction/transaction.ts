import { ec as EC } from 'elliptic';
const ec = new EC('secp256k1');

import { generateKeyPair } from '../wallet/index';
import { OP_CODES } from './script'
import { bs58_decode, little_endian, getHash, reverse_order } from '../helper';
import type { ITxInput, ITransaction, ITxOutput } from '../../interface';

// http://royalforkblog.github.io/2014/11/20/txn-demo/

export class TxInput implements ITxInput {
    txid    // 참조한 출력의 txid
    scriptSig
    vout
    sequence

    keyPair: EC.KeyPair
    signature
    msgHash

    constructor(keyPair: EC.KeyPair) {
        this.keyPair = keyPair;
        this.scriptSig = this.updateScriptSig(keyPair)
        this.vout = this.updateVout();
    }

    generateCoinbase() {

    }

    updateVout() {
        return 0    // 수정 필요
    }

    // 서명크기 + 서명(SIGHASH를 포함하는 사용자 개인키로부터 나온 서명) + 공개키크기 + 공개키(해시되지 않은 공개 키)
    updateScriptSig(keyPair: EC.KeyPair) {
        // 랜덤한 값(테스트용)
        const sign = this.signTx([{ value: 1, scriptPubKey: '038a8fac6518d48c111156f99352300df2a0eaffce2f4837be039e3d1ef95ed73a' }]);
        const pubKey = keyPair.getPublic(true, 'hex');
        return String(sign.length) + sign + String(pubKey.length) + pubKey;
    }

    // 트랜잭션을 서명하기 위해선 트랜잭션 입력이 참조하고 있는 모든 이전 출력값들이 필요
    // 주의. 코인베이스는 입력값이 없으므로 서명하지 않아야함.
    signTx(previous_txs: ITxOutput[]) {
        const msg: string[] = [];
        previous_txs.forEach(v => {
            msg.push(v.scriptPubKey);
        })
        // transaction msg를 출력값의 pubkey로만 했음. SIGHASH는 0x03인듯?
        this.msgHash = msg.join('');

        // 사용자의 개인키를 이용해 메세지를 사인! => 결과로 R과 S 값이 생성되고 이를 der 인코딩 형식을 사용해 바이트 스트림으로 직렬화
        this.signature = this.keyPair.sign(this.msgHash);
        const der = this.signature.toDER('hex');
        console.log(`der: ${der}`)
        // console.log(signature.r);
        // console.log(signature.s)
        return der;
    }

    // 서명, msg, 공개키 필요
    verifySignature(pubKey: EC.KeyPair) {
        if (!this.signature) {
            console.log('서명이 없습니다');
            return false;
        }
        return pubKey.verify(this.msgHash, this.signature);
    }

    calculateFee() {

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
    sequence = 'FFFFFFFF';

    constructor(recipientAddress: string, value: number) { // bs58 encoding format
        this.recipientAddress = recipientAddress;
        this.value = value;
        this.scriptPubKey = this.createOutput();
    }

    createOutput() { // bitcoin 단위. 1BTC = 10^8 satoshi
        const decodedRecipientAddress = bs58_decode(this.recipientAddress);
        const scriptPubKey = OP_CODES['OP_DUP'] + OP_CODES['OP_HASH160'] + '14' + decodedRecipientAddress + OP_CODES["OP_EQUALVERIFY"] + OP_CODES['OP_CHECKSIG'];
        console.log(`scriptPubKey: ${scriptPubKey}`);
        return scriptPubKey
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
    txID
    vin: ITxInput[]
    vout: ITxOutput[]

    constructor(vin: ITxInput[], vout: ITxOutput[]) {
        this.vin = vin;
        this.vout = vout;
        this.txID = this.generateTxID()
    }

    generateTxID() {
        const inpLen = reverse_order(String(this.vin.length));
        const outLen = reverse_order(String(this.vout.length));
        let IN = '';
        let OUT = '';
        this.vin.forEach(v => {
            IN += (little_endian(v.txid as string) as string) + little_endian(v.vout as string) + Number(v.scriptSig.length / 2).toString(16) + v.scriptSig + 'FFFFFFFF'
        })
        this.vout.forEach(v => {
            const satoshi = (v.value * (10 ** 8)).toString(16);   // 0.009 같은 수는 문제...
            const val = (little_endian(satoshi) as string).length < 16 ? little_endian(satoshi) + '00000000' : little_endian(satoshi);
            const len = (v.scriptPubKey.length / 2).toString(16);    // bytes 길이 (hex). 스크립트 길이
            // 송금금액 + 스크립트 길이 + scriptPubKey
            OUT += (val + len + v.scriptPubKey)
        })
        const _txid = little_endian(String(this.version)) + inpLen + IN + outLen + OUT;
        this.txID = getHash.hexHash(getHash.binHash(_txid))
    }

    get __str__() {
        return {
            version: this.version,
            locktime: this.locktime,
            vin: this.vin,
            vout: this.vout
        }
    }
}

// 의문점. 1. msg가 의미하는게 저게 맞는건가??
// 2. der 인코딩 형식이 저게 맞는건가??