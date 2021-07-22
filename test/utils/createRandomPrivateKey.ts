//1. 실제 물리적인 행위를 기반으로 난수 생성 (TRNG)
//2. 시드값을 이용해 시계열로 난수 생성 (PRNG)
//3. 하드웨어 장치에서 발생하는 노이즈를 바탕으로 랜덤 숫자 생성 (CSPRNG)

import { randomBytes } from 'crypto';
import secp256k1 from 'secp256k1';
import bs58 from 'bs58';
import {getHash} from './get_hash'

import * as ecdsa from 'elliptic';
const ec = new ecdsa.ec('secp256k1');

// generate private key (random). sha-256으로 랜덤 생성한 바이트 시퀀스니깐 32바이트!
export const generatePrivKey = (): Buffer => {
    let privKey;
    do {
        privKey = randomBytes(32)
    } while (!secp256k1.privateKeyVerify(privKey))
    return privKey;
}

export const getCheckSum = (key:Buffer) => {
    const payload = key.toString('hex');
    // version + payload + compression flag
    const verPayload = '80' + payload + '01';
    const checksumHash = getHash(verPayload);
    const doubleChecksumHash = getHash(checksumHash);
    return doubleChecksumHash;
}

type Kind = 'HEX' | 'WIF' | 'WIF-C';

// 참고 사이트 => http://royalforkblog.github.io/2014/08/11/graphical-address-generator/
export const encodingPrivKey = (key:Buffer, type: Kind): string => {
    const payload = key.toString('hex');
    // version + payload + compression flag
    const verPayload = '80' + payload + '01';
    const checksumHash = getHash(verPayload);
    const doubleChecksumHash = getHash(checksumHash);

    const checksum = doubleChecksumHash.substr(0, 8);

    const finalBuf = Buffer.from(verPayload + checksum, 'hex');
    
    // private key의 3가지 포맷 => hex, wif, wif-압축
    if(type === 'HEX'){
        return key.toString('hex')
    } else if(type === 'WIF'){
        return bs58.encode(finalBuf);
    } else {
        return bs58.encode(Buffer.from(verPayload + checksum + '01'));
    }
}

// 04로 시작하는(04가 접두어로 붙으면 비압축. 압축이면 02(y가 양수, 짝수일 때) or 03(y가 음수, 홀수일 때)이 붙음. 압축이면 x만 제공해주는건데 타원곡선 특성상 x에 대응하는 y는 2개일 수 있으므로 02 또는 03을 이용해서 명시해준다.)
// x좌표 + y좌표이니깐 64바이트 문자열!
export const getPublicKey = (aPrivateKey: string, compression:boolean): string => {
    const pubKey = ec.keyFromPrivate(aPrivateKey, 'hex').getPublic().encode('hex', compression);
    return pubKey;
};
