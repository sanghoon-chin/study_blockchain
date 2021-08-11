import { ec as EC } from 'elliptic';
const ec = new EC('secp256k1');

import { generateKeyPair, getAddress } from '../wallet/index';
import { OP_CODES } from './script'
import { bs58_decode, little_endian, getHash, reverse_order } from '../helper';
import type { ITxInput, ITransaction, ITxOutput } from '../../interface';
import { Blockchain } from '../blockchain';
import { Stack } from './stack';

// http://royalforkblog.github.io/2014/11/20/txn-demo/

export class TxInput implements ITxInput {
    txid    // 참조한 출력의 txid
    scriptSig
    vout
    sequence = 0xFFFFFFFF;

    keyPair: EC.KeyPair
    msgHash

    constructor(senderKeyPair: EC.KeyPair) {
        this.keyPair = senderKeyPair;
        this.vout = this.updateVout();
        this.scriptSig = this.generateScriptSig();
    }

    updateVout() {
        return '0'    // 수정 필요
    }

    generateMsgHash(){
        // 트랜잭션 메세지는 일단 임의로!! => txid로 하면 됨
        // transaction msg를 출력값의 pubkey로만 했음. SIGHASH는 0x03인듯?
        // msg는 all이니깐 그냥 txid를 넣어버리는걸로 
        // return msg
        const msg: number[] = [];
        msg.push(1, 2, 3, 4, 5)
        this.msgHash = msg
        return '8190374a5a1feb54fab4417fac1a3d9185de06fd8dcac34822c7cd00083638b1'   // test
    }

    // 서명크기 + SIGHASH를 포함하는 사용자의 개인 키에서 사용자의 지갑이 생성하는 서명(서명직렬화, toDER) + 공개 키 길이(바이트) + 해시되지 않은 공개키
    generateScriptSig(){
        const signLen = (this.generateSignature().length / 2).toString(16);
        // console.log(`signLen: ${signLen}`)
        // console.log(`signature: ${this.generateSignature()}`)
        const pubKey = this.keyPair.getPublic(true, 'hex');
        const pubKeyLen = (pubKey.length / 2).toString(16)
        return signLen + this.generateSignature() + pubKeyLen + pubKey;
    }

    // 서명직렬화를 return하는 함수 (9가지 요소로 구성됨)
    // 아래 식이 결국 DER 형식임.
    // DER 시퀀스의 시작 + 시퀀스의 길이 + 정수 값이 뒤따릅니다. + 정수의 길이 + R + 다음에 또 다른 정수가 옵니다. +  정수의 길이 + S + SIGHASH
    generateSignature():string{
        return this.keyPair.sign(this.generateMsgHash()).toDER('hex')
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
    status: 'spent'|'unspent';

    constructor(recipientAddress: string, value: number) { // bs58 encoding format
        this.recipientAddress = recipientAddress;
        this.value = this.btc2satoshi(value);
        this.scriptPubKey = this.createOutput();
        this.status = 'unspent';
    }

    // 1BTC = 10^8 satoshi
    btc2satoshi(value: number){
        return value * (10 ** 8);
    }

    createOutput() { 
        const decodedRecipientAddress = bs58_decode(this.recipientAddress);
        // 14 정체??
        const scriptPubKey = OP_CODES['OP_DUP'] + OP_CODES['OP_HASH160'] + '14' + decodedRecipientAddress + OP_CODES["OP_EQUALVERIFY"] + OP_CODES['OP_CHECKSIG'];
        console.log(`scriptPubKey: ${scriptPubKey}`);
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
            const satoshi = (v.value * (10 ** 8)).toString(16);   // 0.009 같은 수는 문제... 정수로 저장하면 됨.
            const val = (little_endian(satoshi) as string).length < 16 ? little_endian(satoshi) + '00000000' : little_endian(satoshi);
            const len = (v.scriptPubKey.length / 2).toString(16);    // bytes 길이 (hex). 스크립트 길이
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
            txID: this.txID
        }
    }
}

// input이 없고 output만 존재함. output은 하나
export class CoinbaseTransaction {
    version = 1;
    locktime = 0;
    vin = null
    vout:ITxOutput[]
    txID:string;

    constructor(txOutput:ITxOutput){
        this.vout = [txOutput];
        this.txID = this.generateTxID();
    }

    generateTransaction(){
        const outLen = reverse_order(String(this.vout.length));
        let OUT = '';
        this.vout.forEach(v => {
            const satoshi = (v.value * (10 ** 8)).toString(16);   // 0.009 같은 수는 문제...
            const val = (little_endian(satoshi) as string).length < 16 ? little_endian(satoshi) + '00000000' : little_endian(satoshi);
            const len = (v.scriptPubKey.length / 2).toString(16);    // bytes 길이 (hex). 스크립트 길이
            // 송금금액 + 스크립트 길이 + scriptPubKey
            OUT += (val + len + v.scriptPubKey);
        })
        return little_endian(String(this.version)) + outLen + OUT;
    }

    generateTxID() {
        const _txid = this.generateTransaction();
        return getHash.hexHash(getHash.binHash(_txid))
    }
}

// const wallet = generateKeyPair('temp');
// const txInput = new TxInput(wallet);
// const res = txInput.verifySignature(wallet)
// console.log(txInput.__str__, res)

type ParsedScriptPubKey = {
    type: 'OP'|'VALUE';
    code: string;
}

const executeScript = (txInput, pubK, txOutput):boolean => {

    const parseScriptPubKey = (_scriptPubKey:string):ParsedScriptPubKey[] => {
        const op1 = _scriptPubKey.slice(0, 2);
        const op2 = _scriptPubKey.slice(2, 4);
        const address = _scriptPubKey.slice(6, -4);
        const op3 = _scriptPubKey.slice(-4, -2);
        const op4 = _scriptPubKey.slice(-2);

        return [
            {type: 'OP', code: op1}, 
            {type: 'OP', code: op2}, 
            {type: 'VALUE', code: address}, 
            {type: 'OP', code: op3}, 
            {type: 'OP', code: op4}, 
        ]
    }

    const sig = txInput.__str__.scriptSig
    const scriptPubKey = txOutput.__str__.scriptPubKey;

    const stack = new Stack(txInput);
    const arr = parseScriptPubKey(scriptPubKey);
    stack.push(sig, 'VALUE');
    stack.push(pubK, 'VALUE');
    for (const obj of arr){
        const {code, type} = obj;
        stack.push(code, type)
    }
    console.log(stack.__str__)
    // console.log('파싱된 scriptPubKey 배열')
    // console.log(arr)

    // 스크립트 연산이 끝나고 stack에 남아있는 최종 값이 TRUE이면 return true
    // 거기 있는 value와 txid 등의 정보도 필요할 듯??
    if(stack.top){
        return true;
    } else{
        return false;
    }
}


// test
const sender = generateKeyPair('brettonwoods_7_1_1944');
const recipient = generateKeyPair('temp2');
const recipientAddress = getAddress(recipient.getPublic(true, 'hex'));

// const blockchain = new Blockchain();
// console.log(blockchain)

// const txoutput = new TxOutput(recipientAddress, 0.015);
// console.log(txoutput.__oneLine__)

/**
 * 1. 일단 내가 돈을 보내야되니깐 내 지갑에 잔고가 있는지 확인
 * 2. utxo 찾기 (status가 unspent인것만)
 */

const txInput = new TxInput(sender)
const sig = txInput.generateScriptSig()
console.log(`sig 출력`)
console.log(sig)

const txOutput = new TxOutput(recipientAddress, 0.1);

// executeScript(txInput.__str__.scriptSig, recipient.getPublic(true, 'hex'), txOutput.__str__.scriptPubKey)
executeScript(txInput, recipient.getPublic(true, 'hex'), txOutput)