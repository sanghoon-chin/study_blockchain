import repl from 'repl';
import net from 'net';
import fs from 'fs/promises';
import path from 'path';

import {Block, Blockchain, Transaction, TxInput, TxOutput, Wallet} from './utils'
import { IWallet } from './interface';

const replServer = repl.start({prompt: '> '});

const filePath = path.resolve(__dirname, 'data', 'walletList.json');

replServer.defineCommand('지갑생성', {
    help: 'create wallet',
    async action(name){
        if(!name){
            console.error('이름을 입력해주세요');
            this.displayPrompt();
            return false;
        }
        const wallet = new Wallet(name, 'temp')
        console.log('지갑 생성 완료!')
        console.log(wallet.info)
        const walletList = JSON.parse(await fs.readFile(filePath, {encoding: 'utf-8'}));
        walletList.push({
            owner: name,
            address: wallet.info.encodedAddress
        });
        await fs.writeFile(filePath, JSON.stringify(walletList))
        this.displayPrompt();
    }
})

replServer.defineCommand('지갑조회', {
    help: 'show wallet list',
    async action(){
        const walletList = JSON.parse(await fs.readFile(filePath, {encoding: 'utf-8'}));
        console.log(walletList)
        this.displayPrompt();
    }
})

let recipient = '';

replServer.defineCommand('송금할사람주소', {
    help: '송금할 사람 주소 입력',
    action(name){
        if(name){
            recipient = name;
            this.displayPrompt();
        }
    }
})

const getBalance = (recipientAddress:string) => {
    
}

const blockchain = new Blockchain();

replServer.defineCommand('초기화', {
    help: '개발자에게 50BTC를 송금하는 블록을 만든다',
    action(){
        const developerWallet = new Wallet('developer', 'admin')
        const txOutput = new TxOutput(recipient, 50);
        const coinbaseTx = new Transaction('coinbase', [txOutput], null);
        const firstBlock = new Block(developerWallet, [coinbaseTx])
        firstBlock.pow(firstBlock.bits);
        blockchain.appendBlock(firstBlock);
    }
})

replServer.defineCommand('송금하기', {
    help: '송금하기',
    async action(value){
        if(recipient){
            const txOutput = new TxOutput(recipient, Number(value));
            console.log(txOutput.info)
            // 블록체인에 있는 모든 unspent이면서 송신자가 쓸 수 있는 트랜잭션을 찾는다 (반복문 돌면서) 
            console.log(blockchain.info)
            recipient = ''
        } else{
            console.error('수신자의 주소를 입력해주세요');
            this.displayPrompt();
        }
    }
})
