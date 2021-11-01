
// import type { AbiItem } from 'web3-utils';
// import * as contractInterface from './Student_Contract.json'


const init = async () => {
    const abiInterface = await (await fetch('./Student_Contract.json')).json()
    const web3 = new Web3('ws://localhost:7545');
    
    const StudentContract = new web3.eth.Contract(abiInterface.abi, '0x3De15ae534A96ee7B84C55F0BAc2236250A54a99')
    // console.log(StudentContract)

    let account

    web3.eth.getAccounts(async (err, accs) => {
        if(err != null){
            alert('계좌 없음')
            return
        }

        if(accs.length === 0) {
            alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
            return
        }

        account = accs[0]

        await StudentContract.methods.setStudent(1, 'jin', 27, true)
        
        console.log(await StudentContract.methods.getStudent(1))

        // console.log(account)
    })
}

init()