import {get_merkle_root_hash} from './utils/get_merkle_hash';
import fetch from 'node-fetch';

//https://github.com/minseopark1/naivecoin.git

/**
 * https://bch.btc.com/000000000000ba761a1ae472324718cae6330fb6b227e86981a0dbce038a056f?page=1&asc=1&order_by=tx_block_idx
 * https://blockchain.info/rawblock/$block_hash => block data api
 */

const origin = `https://blockchain.info/rawblock/`;
const block_hash = '0000000000000bae09a7a393a8acded75aa67e46cb81f7acaa5ad94f9eacd103'

const targetHash = "3ca80c8061e97c950d25265b25769f78a0d0899f23b5133a3869c512aa5561c0"

let txids = [
    "a8684779e6e305c8ebfa11c030b4fa867668b6bf07efd08b10d3ed4a3d079556",
    "64ba90af72a7df2fa00f5e91286af8996f0c73cee947e233ca4705a73f56f637",
    "63f74e2a81f24f47c2605e3c1637556a2fe20dd1872f7f75f77fb56ee452306b",
    "f4b432258566696081251add5f6246a0cce10bd4160ace60c7461b68bf27adae",
    "71db26047cf6d96840bd3f6fbc5bf05c9e36424b67b78f26187cbc1194568d32",
    "f1940be7a6402b9cb38146557389e3b1ab41b6f6929505ec466b05a97a32e736",
    "c0a41086841f25f05e63c907692e70df6149a3bfd86e2c6020ed2f6463e0f306",
    "872d3c07654effe2f98f7fbd7a7a9ebb8d72b4aadfd3c0bbc930054cea6a21ae",
    "39dfd44f1b1af4b8b67c7bad6ee2babe264c9ee1ab86988afe7400dba0322b2e",
    "ae8a5530ee64371660802cf8f6c66121b4577feaabca2cb5c2e11b80161a0390",
    "39f1e09bf729b4cbf7fec6edeb9a7d6102f10dec3860016a6097f9cb69eaa326",
    "b77c48b4f4d4850b82aebe41c3b93972d49da356fa5620906018e76246390182",
    "2020fc001ae7384c921a123e27b0ff01d9ff5007c3b7eb8f130525b4ae48eb78",
    "436d2a1fca8ae1e546a8227377fb067c414b4b20bd4945cb0abe2c82f5ab1b3e",
    "a99edf26800c39e9a7f8b8cc4afb67b597461040db61e9c5c0dfbd31a9295a95",
    "e4f5d909582e1daa0ab2ab22614d24559083113bd4766ceffe5b1c0d18801851"
]

const result = get_merkle_root_hash(txids)
console.log(result, result === targetHash);

(async () => {
    const request = await fetch(`${origin}${block_hash}`, {method: 'GET'});
    const response = await request.json();
    console.log(response['tx'])
})();