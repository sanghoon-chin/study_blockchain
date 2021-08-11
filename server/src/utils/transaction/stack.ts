import {OP_CODES} from './script';
import {getHash} from '../helper'
import { BNInput, ec as EC } from 'elliptic';
import { TxInput } from './transaction';
import { ITxInput } from '../../interface';
const ec = new EC('secp256k1');

// type StackArr<T> = {
//     [P in keyof T]: 
// }

export class Stack {
    // 타입 수정 필요
    arr:string[]
    txInput

    constructor(txInput){
        this.arr = []
        this.txInput = txInput
    }

    // 들어온 값이 연산자 or hex string 인지에 따라 다르게 동작
    push(value:string, type:'OP'|'VALUE'){
        if(type === 'VALUE'){
            this.arr.push(value);
        } else{
            this.executeOP(value)
        }
        return value;
    }

    pop(){
        return this.arr.pop();
    }

    executeOP(operator:string){
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
                    console.log('검증 실패')
                    return false;
                }
                break;
            case OP_CODES['OP_CHECKSIG']:
                console.log('checksig');
                // 메세지 + 서명 + 공개키
                break;
        }
        return this.top
    }

    get top(){
        return this.arr[this.arr.length - 1]
    }
    
    get __str__(){
        return this.arr
    }
}