/*  ** hex값이 아닌 value나 version은 hex로 변환 후 little endian으로 변환해야함.
ver : 소프트웨어 버전 정보
input_count : 입력값 개수
prevout_hash : 이전 UTXO 출력 Hash
sequence : 현재 장애가 있는 Tx-대체기능, 0xffffffff로 설정
lockTime : 잠금시간
scriptSig : 해제 스크립트
value : BTC가치
scriptPubKey : 잠금 스크립트
*/

//https://learnmeabitcoin.com/technical/txid

/**
 * scriptPubkey =
    OP_DUP(76)
    + OP_HASH160(a9)
    + length(decodeBase58decode(1LLLfmFp8yQ3fsDn7zKVBHMmnMVvbYaAE6 ) ) publicKeyHash길이
    + Base58decode(1LLLfmFp8yQ3fsDn7zKVBHMmnMVvbYaAE6) - publicKeyHash
    + OP_EQUALVERIFY(88)
    + OP_CHECHSIG (ac)
 */

/**
 * 트랜잭션 id(트랜잭션 해시)의 목적?? 
 * 1. 트랜잭션을 구분하기 위한 용도
 * 2. 보통 해당 거래내역을 해시값으로 변환한 고유 값!
 * 3. 내가 전송한 암호화폐가 잘 전송됐는지 확인하려고 많이 쓰인다.
 * 4. 블록의 거래 정보가 유효한지를 판별할 때도 쓰인다.
 * 
 * 중앙 데이터베이스에서는 id를 그냥 autoincrement로 생성하면 편하지만 블록체인은 분산화돼있는 환경이기에 누구나 id를 생성할 수 있다
 * 따라서 어떤 순서가 아니라 거래내역 자체에 대해 txid를 생성하게 된다.
 * 
 * 트랜잭션 정보 + 개인키 만 있으면 생성 가능 (개인키로 트랜잭션에 서명을 한다!!)
 * 
 * UTXO(소비되지 않은 거래의 출력값. Unspent Transaction Output)
 */

import {getHash} from './utils/get_hash'
import { little_endian } from './utils/little_endian'
import fetch from 'node-fetch'

const target_hash = `000000000000000000051f1856126fb45b8097b12c8e573dacdad290b7474d1e`;
const url = `https://blockchain.info/rawblock/${target_hash}`;

const fetchData = async () => {
    const data = await (await fetch(url)).json();
    const tx = data.tx[0];
    const keys = ['ver', 'vin_sz', 'lock_time', 'inputs', 'out',]
    
}

fetchData();

// ver : 소프트웨어 버전 정보
// input_count : 입력값 개수
// prevout_hash : 이전 UTXO 출력 Hash
// sequence : 현재 장애가 있는 Tx-대체기능, 0xffffffff로 설정
// lockTime : 잠금시간
// scriptSig : 해제 스크립트
// value : BTC가치
// scriptPubKey : 잠금 스크립트

// const items = (version + countIn + prevout_hash + scriptSig + sequence + countOut + value + scriptPubKey + nLockTime)

// const hash1 = getHash(items, 'hex');
// const hash2 = getHash(hash1, 'hex');

// console.log(hash2)