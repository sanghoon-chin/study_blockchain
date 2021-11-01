const fs = require('fs/promises')
const path = require('path')
import Web3 from 'web3'

;(async () => {
    const web3 = new Web3('http://localhost:7545')

    let data = await fs.readFile(path.resolve(__dirname, './build/contracts/Token.json'), 'utf-8')
    data = JSON.parse(data)

    const myAddress = '0x21D41A422C2d2888218d9563A82EDd78c913D23C'

    const contract = new web3.eth.Contract(data.abi, '0x9B53D70C8e80385cFB0cC0862725B6Afd8b4b8E9')

    const _from = (await web3.eth.getAccounts())[0]
    console.log(await web3.eth.getBalance(myAddress))

    // console.log(await web3.eth.sendTransaction({
    //     from: _from,
    //     to: '0x9B53D70C8e80385cFB0cC0862725B6Afd8b4b8E9'
    // }))
    
    // console.log(contract.methods.total)
    // console.log(await contract.methods.totalVotesFor('Alice', {from: web3.eth.accounts[0]}).call())
})()


//0x2604b598616c2e694d5292187544ed993cb68c03065a970dd4bd23c6cf5acd60