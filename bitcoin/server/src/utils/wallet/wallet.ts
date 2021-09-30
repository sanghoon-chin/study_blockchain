import { randomBytes } from 'crypto';
import secp256k1 from 'secp256k1';
import bs58 from 'bs58';
import * as ecdsa from 'elliptic';
const ec = new ecdsa.ec('secp256k1');

import { bs58_encode, getHash } from '../helper'
import type {IWallet} from '../../interface'

type Kind = 'HEX' | 'WIF' | 'WIF-C';

export class Wallet implements IWallet {
    name: string;
    createdAt = Date.now();
    privKey:Buffer;
    pubKey:string;
    decodedAddress:string;
    encodedAddress:string;

    constructor(name: string, secretKey?: string) {
        this.name = name;
        this.privKey = this.generatePrivKey(secretKey || '')
        this.pubKey = this.generatePublicKey(this.privKey, true)
        this.decodedAddress = this.generateDecodedAddress(this.pubKey)
        this.encodedAddress = this.generateEncodedAddress(this.decodedAddress)
    }

    private getCheckSum(key: Buffer) {
        const payload = key.toString('hex');
        // version + payload + compression flag
        const verPayload = '80' + payload + '01';
        const checksumHash = getHash.binHash(verPayload);
        const doubleChecksumHash = getHash.hexHash(checksumHash);
        return doubleChecksumHash.substr(0, 8);
    }
    
    private generatePrivKey(secretKey:string) {
        if (secretKey == '') {
            let privKey: Buffer;
            do {
                privKey = randomBytes(32)
            } while (!secp256k1.privateKeyVerify(privKey))
            return privKey;
        }
        return Buffer.from(getHash.hash(secretKey), 'hex');
    }

    // 04로 시작하는(04가 접두어로 붙으면 비압축. 압축이면 02(y가 양수, 짝수일 때) or 03(y가 음수, 홀수일 때)이 붙음. 
    // 압축이면 x만 제공해주는건데 타원곡선 특성상 x에 대응하는 y는 2개일 수 있으므로 02 또는 03을 이용해서 명시해준다.)
    // x좌표 + y좌표이니깐 64바이트 문자열!
    private generatePublicKey(privateKey: Buffer, compression:boolean) {
        const pubKey = ec.keyFromPrivate(privateKey, 'hex').getPublic().encode('hex', compression);
        return pubKey;
    }

    private generateDecodedAddress(pubKey:string){
        const hash1 = getHash.hash2(pubKey)
        const doubleHashPubKey = getHash.ripemd160Hash(hash1)
        const prefixVer = '00';
        const concatStr = prefixVer + doubleHashPubKey;
        const checksum = getHash.hexHash(getHash.binHash(concatStr)).slice(0, 8)
        return concatStr + checksum
    }

    private generateEncodedAddress(address:string){
        return bs58_encode(address)
    }

    private generateEncodedPrivateKey(key:Buffer, type: Kind){
        const VER = '80';
        const COMPRESSION_FLAG = '01';

        const checksum = this.getCheckSum(key);
        const finalBuf = Buffer.from(VER + checksum, 'hex');
        
        // private key의 3가지 포맷 => hex, wif, wif-압축
        if(type === 'HEX'){
            return key.toString('hex')
        } else if(type === 'WIF'){
            return bs58.encode(finalBuf);
        } else {
            return bs58.encode(Buffer.from(VER + checksum + COMPRESSION_FLAG));
        }
    }

    get info() {
        return {
            name: this.name,
            privKey: this.privKey.toString('hex'),
            pubKey: this.pubKey,
            decodedAddress: this.decodedAddress,
            encodedAddress: this.encodedAddress
        }
    }
}