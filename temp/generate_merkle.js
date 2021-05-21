/** 머클루트값(32 bytes) 구하기
 * 참고 링크: => https://bitcoindev.network/calculating-the-merkle-root-for-a-block/
 * 
 * 
 * Step
 * 1. we need to reverse the order of these from big to little endian (network byte order)
 * 2. Concatenate these values and calculate a sha256 digest from the binary data
 * 3. Convert this value to binary and perform another sha256 operation on the output
 * 4. reverse the order from little to big endian.
 */

// 시간 날 때 https://jsdoc.app/about-getting-started.html 한 번 보자

const { createHash } = require('crypto')

const targetHash = '25c8487847de572c21bff029a95d9a9fecd9f4c2736984b979d37258cd47bd1f'

// TXIDs must be in little endian
let txids = [
    "3bd3a1309a518c381248fdc26c3a6bd62c35db7705069f59206684308cc237b3",
    "a99011a19e9894753d6c65c8fa412838ea8042886537588e7205734d5de8956d"
]

const reverse_string = str => {
    const reversed_str = str.split('').reverse()
    for (let i = 0; i < reversed_str.length; i += 2) {
        [[reversed_str[i], reversed_str[i + 1]]] = [[reversed_str[i + 1], reversed_str[i]]]
    }
    return reversed_str.join('')
}

const getHash = (data, type='bin') => {
    let d = (type === 'bin') ? Buffer.from(data, 'hex') : data;
    return createHash('sha256').update(d).digest('hex');
}

const merkle_root = (txids) => {
    let tx1 = reverse_string(txids[0])
    let tx2 = reverse_string(txids[1])

    let txid = tx1 + tx2
    
    let data = getHash(txid)
    let final = getHash(data)
    return reverse_string(final)
}

let result = merkle_root(txids)
console.log(result, result === targetHash)
