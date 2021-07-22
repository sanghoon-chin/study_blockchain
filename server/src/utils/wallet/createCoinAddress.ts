import { generatePrivKey, encodingPrivKey, getPublicKey } from './address_helper';
import { getHash, bs58 } from '..';

//http://royalforkblog.github.io/2014/08/11/graphical-address-generator/
export const createCoinAddress = (data?: string) => {
    const str = data || generatePrivKey().toString('hex');
    console.log(str)
    const privKey = getHash.hash(str);
    // console.log(`privKey: ${privKey}`)
    const formatPrivKey = encodingPrivKey(Buffer.from(privKey, "hex"), 'WIF');
    // console.log(`formatPrivKey: ${formatPrivKey}`)
    const pubKey = getPublicKey(privKey, true);
    // console.log(`pubKey: ${pubKey}`)
    // equation: public key = ripemd160(sha256(pubKey))
    const hash1 = getHash.hash2(pubKey);
    const doubleHashPubKey = getHash.ripemd160Hash(hash1)
    // console.log(`doubleHashPubKey: ${doubleHashPubKey}`);
    const prefixVer = '00';
    const temp = prefixVer + doubleHashPubKey;
    const checksum = getHash.hexHash(getHash.binHash(temp)).slice(0, 8);
    // console.log(checksum)
    const result = temp + checksum;
    const address = bs58(result);
    // console.log(address)
    return { privKey, pubKey, address, formatPrivKey }
}

// const result = createCoinAddress()
// console.log(result)