const { createHash } = require('crypto');
// const url = https://blockchain.info/block-height/125552?format=json;

const targetHash = '00000000000000000003676178f0305639ffb0630371f24ad34ae4a972c23131'

const blockHeader = {
    version: '20c00004',
    prev_block: '000000000000000000083b0e697c20bf1e17d489155e35cb4b675f877809a94e',
    merkle_root: 'c9e005c038ffd19c519fe53a8ae7576c4da2f2d50b23260e16d0a243b2e9a02e',
    time_stamp: ((new Date('2021-05-16T15:10:09')).getTime() / 1000).toString(16),
    bits: '170b3ce9',
    nonce: 'ed4d172b',
}

// Big Endian -> Little Endian
const reverse_string = str => {
    const reversed_str = str.split('').reverse()
    for(let i = 0;i<reversed_str.length;i+=2){
        [[reversed_str[i], reversed_str[i+1]]] = [[reversed_str[i+1], reversed_str[i]]]
    }
    return reversed_str.join('')
}

const getHash = value => createHash('sha256').update(value).digest('hex')

const checkHash = (blockHeader) => {
    // 다 리틀 엔디안으로 바꿈.
    blockHeader['version'] = reverse_string(blockHeader['version']);
    blockHeader['prev_block'] = reverse_string(blockHeader['prev_block']);
    blockHeader['merkle_root'] = reverse_string(blockHeader['merkle_root']);
    blockHeader['time_stamp'] = reverse_string(blockHeader['time_stamp']);
    blockHeader['bits'] = reverse_string(blockHeader['bits']);
    blockHeader['nonce'] = reverse_string(blockHeader['nonce']);

    const header_hex = Object.keys(blockHeader).reduce((acc, v) => acc += blockHeader[v], '');
    const buf = Buffer.from(header_hex, 'hex')

    const hash2 = getHash(createHash('sha256').update(buf).digest())

    // hash2 : Little endian. 우리가 보는 건 big Endian이므로 다시 바꿔준다.
    const result = reverse_string(hash2)

    // result : Big endian
    return result
}

const result = checkHash(blockHeader)
console.log(result, result === targetHash)