/**
 * 기본적으로 연산을 위해서는 숫자값은 little endian 포맷으로 변환이 되어야 하고, 
 * hex 값은 reverse order로 변경이 되어있어야 합니다.
 * 그리고 더블해쉬 연산을 위해서 hex 포맷은 bin 포맷으로 변환이 되어야 합니다.
 */
import {getHash} from './utils/get_hash'
import {little_endian, reverse_order} from './utils/little_endian';
import fetch from 'node-fetch'
import {createHash} from 'crypto';

// convert decimal to hex and format little endian 
function liEnd(num: number){
    return num.toString(16).padStart(8, '0').match(/../g)?.reverse().join() as string
}

interface Block {
    hash?: string;
    ver?: number | string;
    prev_block?: string;
    mrkl_root?: string;
    time?: number | string;
    bits?: number | string;
    nonce?: number | string;
}

const keys = ['hash', 'ver', 'prev_block', 'mrkl_root', 'time', 'bits', 'nonce']

const getBlockData = async ():Promise<Block> => {
    const hash_id = `000000000000000000051f1856126fb45b8097b12c8e573dacdad290b7474d1e`
    const url = `https://blockchain.info/rawblock/${hash_id}`;
    const data = await (await fetch(url)).json();
    let block:Block = {}
    for(let i = 0;i<keys.length;i++){
        const key = keys[i];
        Object.assign(block, {
            [key]: data[key]
        })
    }
    return block
}

const main = async () => {
    const block = await getBlockData();
    for(let prop in block){
        if(typeof block[prop] === 'number'){
            block[prop] = (block[prop] as number).toString(16);
            block[prop] = little_endian(block[prop]);
        } else {
            block[prop] = reverse_order(block[prop])
        }
    }
    // // version + preHash + merkleRoot + time + bits + nonce 순서로!!
    const headerItems = (block.ver as string) + (block.prev_block as string) + block.mrkl_root + block.time + block.bits + block.nonce
    // const hash1 = createHash('sha256').update(Buffer.from(headerItems, 'hex')).digest()
    // const hash2 = createHash('sha256').update(hash1).digest('hex')
    // const result = reverse_order(hash2)
    const result = getHash(getHash(headerItems, 'bin'), 'bin');
    console.log(reverse_order(result))
}

main(); 