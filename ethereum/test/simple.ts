import Web3 from 'web3'
import path from 'path'
import fs from 'fs/promises'

;(async () => {
    const web3 = new Web3('http://localhost:7545')
    
    const eth = web3.eth
    const utils = web3.utils

    const contractAddress = '0x9B53D70C8e80385cFB0cC0862725B6Afd8b4b8E9'
    
    const abiInterface = JSON.parse(await fs.readFile(path.resolve(__dirname, './build/contracts/NameContract.json'), 'utf-8'))

    const contract = new eth.Contract(abiInterface.abi, contractAddress)

    // const name1 = contract.methods.getName('alice')

    // console.log(name1)
    await contract.methods.setName('alice')

    const name2 = await contract.methods.getName.call('alice')
    console.log(name2)
})()
