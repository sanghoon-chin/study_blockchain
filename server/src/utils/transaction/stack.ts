import {OP_CODES} from './script';
import {getHash} from '../helper'
import { ec as EC } from 'elliptic';
const ec = new EC('secp256k1');

// type StackArr<T> = {
//     [P in keyof T]: 
// }

export class Stack {
    arr:string[]
    txInput

    constructor(txInput){
        this.arr = []
        this.txInput = txInput
    }

    push(value:string, type:'OP'|'VALUE'){
        if(type === 'VALUE'){
            return this.arr.push(value);
        } else{
            return this.executeOP(value)
        }
    }

    pop(){
        return this.arr.pop();
    }

    executeOP(operator:string){
        let isValid = true;
        switch(operator){
            case OP_CODES['OP_DUP']:
                console.log('duplicate!')
                this.push(this.top, 'VALUE');
                break;
            case OP_CODES['OP_HASH160']:
                console.log('hash160!')
                const item = this.pop() as string;
                const hashItem = getHash.ripemd160Hash(getHash.hash2(item));
                this.push(hashItem, 'VALUE');
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
                // 메세지 + 서명 + 공개키
                const bool = this.txInput.keyPair.verify(this.txInput.msgHash, this.txInput.generateSignature())
                console.log(`bool: `, bool)
                this.pop();
                this.pop();
                if(bool){
                    console.log('검증 성공');
                    this.push('TRUE', 'VALUE');
                } else{
                    console.log('검증 실패');
                    this.push('FALSE', 'VALUE')
                    isValid = false;
                }
                break;
        }
        return isValid;
    }

    get top(){
        return this.arr[this.arr.length - 1]
    }
    
    get __str__(){
        return this.arr
    }
}