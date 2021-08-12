import {Stack} from './stack';

// https://en.bitcoin.it/wiki/Script
export const OP_CODES = {   // 다 hex 값
    "OP_DUP": '76',
    "OP_HASH160": 'a9',
    "OP_EQUALVERIFY": '88',
    "OP_CHECKSIG": 'ac'
}

type ParsedScriptPubKey = {
    type: 'OP'|'VALUE';
    code: string;
}

export const executeScript = (txInput, txOutput) => {
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
    };

    const sig = txInput.__str__.scriptSig;
    const scriptPubKey = txOutput.__str__.scriptPubKey;

    const stack = new Stack(txInput);
    const arr = parseScriptPubKey(scriptPubKey);
    stack.push(sig, 'VALUE');
    stack.push(txInput.keyPair.getPublic(true, 'hex'), 'VALUE');
    for (const {code, type} of arr){
        const res = stack.push(code, type)
        if(!res){
            console.log('당신이 쓸 수 있는 utxo가 아닙니다.')
            return false;
        }
        // console.log(stack.__str__)
    }
    // console.log(arr)

    if(stack.top === 'TRUE'){
        console.log('당신이 쓸 수 있는 UTXO 입니다.');
        return true;
    } else {
        console.log('당신이 쓸 수 있는 utxo가 아닙니다.')
        return false;
    }
}