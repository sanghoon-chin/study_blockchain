import secp256k1 from 'secp256k1';
import eccrypto from 'eccrypto';

import { OP_CODES } from './script';
import { Stack } from './stack';
import { bs58_decode, getHash, reverse_order, little_endian } from '../helper';

import type {ITx, ITxInput, ITxOutput} from '../../interface'

type TypeTxOutput = 'spent' | 'unspent';
type TypeTxStatus = 'unconfirm' | 'confirm';
type TypeTx = 'coinbase' | 'tx';

type ParsedScriptPubKey = {
    type: 'OP' | 'VALUE';
    code: string;
}


export class TxInput implements ITxInput {
    sequence = 0xFFFFFFFF;
    txid: string;
    scriptSig?: string;
    vout: number;

    signatureDER?: string;
    msg?: Buffer;

    constructor(tx: ITx, vout: number, prevTxOutput: ITxOutput) {
        this.txid = tx.txid;
        this.vout = vout;
    }

    async generateScriptSig(wallet, msg: string) {
        // msg는 이전 출력의 txid를 해시!
        const _msg = getHash.binHash(msg);
        const sigDER = await eccrypto.sign(wallet.privKey, _msg);
        this.msg = _msg
        this.signatureDER = sigDER.toString('hex');
        const sigLen = (sigDER.toString('hex').length / 2).toString(16);
        const pubKey = wallet.pubKey;
        const pubKeyLen = (wallet.pubKey.length / 2).toString(16)
        this.scriptSig = sigLen + sigDER.toString('hex') + pubKeyLen + pubKey;
        return true
    }

    private parseScriptPubKey(scriptPubKey: string):ParsedScriptPubKey[] {
        const op1 = scriptPubKey.slice(0, 2);
        const op2 = scriptPubKey.slice(2, 4);
        const address = scriptPubKey.slice(6, -4);
        const op3 = scriptPubKey.slice(-4, -2);
        const op4 = scriptPubKey.slice(-2);

        return [
            {type: 'OP', code: op1}, 
            {type: 'OP', code: op2}, 
            {type: 'VALUE', code: address}, 
            {type: 'OP', code: op3}, 
            {type: 'OP', code: op4}, 
        ]
    }

    // scriptSig만 전달해줘서 하는게 best
    async executeScript(scriptPubKey:string): Promise<boolean> {
        const sig = this.signatureDER as string;
        const pubKey = this.scriptSig?.slice(-66) as string;
        const stack = new Stack(sig, pubKey, this.msg as Buffer);
        const arr = this.parseScriptPubKey(scriptPubKey);
        stack.push(sig, 'VALUE');
        stack.push(pubKey, 'VALUE');
        for (const {code, type} of arr){
            await stack.push(code, type);
        }
        // console.log(stack.info)
        if(stack.top === 'TRUE'){
            console.log('당신이 쓸 수 있는 UTXO 입니다.');
            return true;
        } else {
            console.log('당신이 쓸 수 있는 UTXO 아닙니다.')
            return false;
        }
    }

    get info() {
        return {
            sequence: this.sequence,
            txid: this.txid,
            scriptSig: this.scriptSig,
            vout: this.vout
        }
    }
}

export class TxOutput implements ITxOutput {
    recipientAddress: string;
    value: number;
    scriptPubKey: string;
    status: TypeTxOutput = 'unspent'

    constructor(recipient: string, value: number) {
        this.recipientAddress = recipient;
        this.value = this.btc2satoshi(value);
        this.scriptPubKey = this.generateScriptPubKey()
    }

    // 1BTC = 10^8 satoshi
    private btc2satoshi(value: number) {
        return value * (10 ** 8);
    }

    private generateScriptPubKey() {
        const decodedRecipientAddress = bs58_decode(this.recipientAddress);
        const scriptPubKey = OP_CODES['OP_DUP'] + OP_CODES['OP_HASH160'] + '14' + decodedRecipientAddress + OP_CODES["OP_EQUALVERIFY"] + OP_CODES['OP_CHECKSIG'];
        return scriptPubKey;
    }

    updateStatus() {
        this.status = 'spent';
    }

    get info() {
        return {
            value: (this.value * (10 ** -8)) + 'btc',
            scriptPubKey: this.scriptPubKey
        }
    }
}

export class Transaction implements ITx {
    version = 1;
    locktime = 0;
    txid: string;
    vin: ITxInput[] | null;
    vout: ITxOutput[];
    status: TypeTxStatus = 'unconfirm';
    type: TypeTx;

    constructor(type: 'coinbase' | 'tx', vout: ITxOutput[], vin: ITxInput[] | null) {
        this.vin = vin || null;
        this.vout = vout;
        this.type = type;
        this.txid = this.generateTxid();
    }

    private generateTxid() {
        const outLen = reverse_order(String(this.vout.length));
        let OUT = '';
        this.vout.forEach(txout => {
            const satoshi = txout.value.toString(16);
            const val = little_endian(satoshi, 8);
            const len = (txout.scriptPubKey.length / 2).toString(16);
            // 송금금액 + 스크립트 길이 + scriptPubKey
            OUT += (val + len + txout.scriptPubKey)
        })
        if (this.type === 'tx') {
            const inpLen = reverse_order(String(this.vin?.length) || '');
            let IN = '';
            (this.vin as ITxInput[]).forEach(txin => {
                IN += (little_endian(txin.txid) as string) + little_endian(String(txin.vout)) + Number((txin.scriptSig as string).length / 2).toString(16) + txin.scriptSig + 'FFFFFFFF';
            })
            return getHash.hash(little_endian(String(this.version)) + inpLen + IN + outLen + OUT);
        } else {    // coinbase면 Input 이 없음
            return getHash.hash(little_endian(String(this.version)) + outLen + OUT);
        }
    }

    get info() {
        return {
            version: this.version,
            locktime: this.locktime,
            vin: this.vin,
            vout: this.vout,
            txid: this.txid,
            status: this.status,
            type: this.type
        }
    }
};


// =========================== test 코드 => 잘 동작함
import { Wallet } from '../wallet/wallet'

const test = async () => {
    const myWallet = new Wallet('tom', 'brettonwoods_7_1_1944')
    console.log(myWallet.info)
    const txOutput = new TxOutput(myWallet.info.encodedAddress, 20)
    const tx = new Transaction('coinbase', [txOutput], null)
    console.log(tx.info)
    const txInput = new TxInput(tx, 0, txOutput)
    await txInput.generateScriptSig(myWallet, tx.info.txid)
    console.log(txInput.info)
    const bool = await txInput.executeScript(txOutput.info.scriptPubKey)
    console.log(bool)
}

// test()
