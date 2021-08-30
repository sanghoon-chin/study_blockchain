import eccrypto from 'eccrypto';

import {OP_CODES} from './script';
import {getHash} from '../helper';

export class Stack {
    arr:string[];
    sig:string;
    pubKey:string;
    msg:Buffer

    constructor(sig:string, pubKey:string, msg:Buffer){
        this.arr = []
        this.sig = sig;
        this.pubKey = pubKey;
        this.msg = msg
    }

    async push(value:string, type:'OP'|'VALUE'){
        if(type === 'VALUE'){
            await this.arr.push(value)
            return true;
        } else{
            const res = await this.executeOP(value)
            return res
        }
    }

    pop(){
        return this.arr.pop();
    }

    async executeOP(operator:string){
        let isValid = true;
        switch(operator){
            case OP_CODES['OP_DUP']:
                console.log('duplicate!')
                await this.push(this.top, 'VALUE');
                break;
            case OP_CODES['OP_HASH160']:
                console.log('hash160!')
                const item = this.pop() as string;
                const hashItem = getHash.ripemd160Hash(getHash.hash2(item));
                await this.push(hashItem, 'VALUE');
                break;
            case OP_CODES['OP_EQUALVERIFY']:
                console.log('Equal verify!');
                if(this.top === this.arr[this.arr.length - 2]){
                    this.pop();
                    this.pop();
                } else {
                    console.log('equalverify 검증 실패')
                    isValid = false;
                }
                break;
            case OP_CODES['OP_CHECKSIG']:
                console.log('checksig');
                eccrypto.verify(Buffer.from(this.pubKey, 'hex'), this.msg, Buffer.from(this.sig, 'hex'))
                    .then(async () => {
                        console.log('검증 성공');
                        this.pop()
                        this.pop()
                        await this.push('TRUE', 'VALUE');
                    })
                    .catch(() => {
                        console.log('검증 실패');
                        this.push('FALSE', 'VALUE')
                        isValid = false;
                    })
                break;
        }
        return isValid;
    }

    get top(){
        return this.arr[this.arr.length - 1]
    }
    
    get info(){
        return this.arr
    }
}