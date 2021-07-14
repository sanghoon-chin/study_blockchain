import bs58 from 'bs58';
import {createHash} from 'crypto';
import {generatePrivKey, encodingPrivKey, getPublicKey} from './utils/createRandomPrivateKey';
import {getHash} from './utils/get_hash';

//http://royalforkblog.github.io/2014/08/11/graphical-address-generator/
const main = () => {
    const str = 'test22';   // 랜덤하게 private_key 생성
    const privKey = getHash(str, 'hex');
    const formatPrivKey = encodingPrivKey(Buffer.from(privKey, "hex"), 'WIF');
    const pubKey = getPublicKey(privKey, true);
    // console.log(`pubKey: ${pubKey}`)
    // equation: public key = ripemd160(sha256(pubKey))
    const hash1 = getHash(pubKey, 'bin');
    const doubleHashPubKey = createHash('ripemd160').update(Buffer.from(hash1, 'hex')).digest('hex');
    console.log(doubleHashPubKey);
    const prefixVer = '00';
    const temp = prefixVer + doubleHashPubKey;
    const checksum = getHash(getHash(temp)).slice(0, 8);
    const result = temp + checksum;
    const publicAddress = bs58.encode(Buffer.from(result, 'hex'))
    console.log(publicAddress)
}

main();
