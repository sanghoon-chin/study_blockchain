/* hex값이 아닌 value나 version은 hex로 변환 후 little endian으로 변환해야함.
ver : 소프트웨어 버전 정보
input_count : 입력값 개수
prevout_hash : 이전 UTXO 출력 Hash
sequence : 현재 장애가 있는 Tx-대체기능, 0xffffffff로 설정
lockTime : 잠금시간
scriptSig : 해제 스크립트
value : BTC가치
scriptPubKey : 잠금 스크립트
*/

/**
 * scriptPubkey =
    OP_DUP(76)
    + OP_HASH160(a9)
    + length(decodeBase58decode(1LLLfmFp8yQ3fsDn7zKVBHMmnMVvbYaAE6 ) ) publicKeyHash길이
    + Base58decode(1LLLfmFp8yQ3fsDn7zKVBHMmnMVvbYaAE6) - publicKeyHash
    + OP_EQUALVERIFY(88)
    + OP_CHECHSIG (ac)
 */

import {getHash} from './utils/get_hash'

const version =  '01000000'
const countIn =  '01'
const prevout_hash =  'ffffffff'.padStart(64, '0')
const scriptSig =  '04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73'
const scriptPubKey =  '4104678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5fac'
const nLockTime =  '00000000'
const value =  '00f2052a01000000'
const sequence = 'ffffffff'
const countOut = '01'

const items = (version + countIn + prevout_hash + scriptSig + sequence + countOut + value + scriptPubKey + nLockTime)

const hash1 = getHash(items, 'hex');
const hash2 = getHash(hash1, 'hex');

console.log(hash2)