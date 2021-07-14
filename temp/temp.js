const crypto = require('crypto')

var ecdsa = require('ecdsa')
var sr = require('secure-random') //npm install --save secure-random@1.x
var CoinKey = require('coinkey') //npm install --save coinkey@0.1.0

var privateKey = sr.randomBuffer(32)
var ck = new CoinKey(privateKey, true) // true => compressed public key / addresses

var msg = new Buffer("hello world!", 'utf8')
var shaMsg = crypto.createHash('sha256').update(msg).digest()
var signature = ecdsa.sign(shaMsg, ck.privateKey)
var isValid = ecdsa.verify(shaMsg, signature, ck.publicKey)
console.log(isValid) //true