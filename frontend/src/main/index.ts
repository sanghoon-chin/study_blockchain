import './index.css';
import { io, Socket } from 'socket.io-client';

import {SocketResponse, Wallet, Utxo} from '../../../server/src/interface'

const socket = io('/api');

const $ = document.querySelector.bind(document);

const createWalletBtn = $('#create-wallet-btn') as HTMLButtonElement;
const myWalletAddress = $('#my-wallet-address') as HTMLDivElement;
const entireWalletAddress = $('#entire-wallet-address') as HTMLUListElement;
const miningBtn = $('#mining-btn') as HTMLButtonElement;
const genesisBtn = $('#genesis-btn') as HTMLButtonElement;
const mempoolEl = $('#mempool') as HTMLDivElement;

let myAddress:string;

type Address = Pick<Wallet, 'pubKey'|'address'>

createWalletBtn.addEventListener('click', (e) => {
    socket.emit('create wallet');
})

miningBtn.addEventListener('click', (e) => {
    (e.target as HTMLButtonElement).disabled = true;
    (e.target as HTMLButtonElement).innerHTML = '채굴 중'
    socket.emit('proof of work');
})

const updateAddressList = (data:Address[], container:HTMLElement, el:string) => {
    container.innerHTML = '';
    data.forEach(({address, pubKey}) => {
        const item = document.createElement(el);
        item.innerHTML = `address: ${address}<br> pubKey: ${pubKey}`;
        const btn = document.createElement('button');
        btn.dataset.address = address;
        if(container.nodeName === 'DIV'){
            btn.innerHTML = '자세히보기';
        } else {
            btn.innerHTML = '송금하기'
        }
        btn.style.float = 'right';
        item.appendChild(btn)
        container.appendChild(item);
    })
}

const updateMempool = (mempool:Utxo[]) => {
    mempool.forEach(({sender, recipient, amount}) => {
        const div = document.createElement('div')
        div.style.border= `2px solid black`;
        div.style.padding = '20px';
        const senderDiv = document.createElement('div')
        senderDiv.innerHTML = `보내는 사람: ${sender}`;
        const amountEl = document.createElement('div')
        amountEl.innerHTML = amount + '원';
        const recipientEl = document.createElement('div');
        recipientEl.innerHTML = `받는 사람 ${recipient}`;
        div.appendChild(senderDiv)
        div.appendChild(amountEl)
        div.appendChild(recipientEl)
        mempoolEl.appendChild(div);
    })
}

entireWalletAddress.addEventListener('click', (e) => {
    const el = e.target as HTMLButtonElement;
    if(el.nodeName === 'BUTTON' && el.dataset.address){
        // 이럴 때 yup 같은거 쓰면 유용할 듯
        const amount = +(prompt('얼마를 송금하시겠습니까??', '0') as string) || 0;
        // 잔액 확인 로직 필요

        // ===============
        const recipient = el.dataset.address as string;
        const sender = myAddress;
        // console.log(sender, recipient)
        socket.emit('create transaction', {
            amount, sender, recipient
        })
    }
})

genesisBtn.addEventListener('click', (e) => {
    (e.target as HTMLButtonElement).disabled = true;
    socket.emit('genesis block')
})

socket.on('add user', (data:SocketResponse<Wallet>) => {
    alert('주소 생성 완료');
    genesisBtn.disabled = false;
    const myWallet = data.data as Wallet;
    myAddress = myWallet.address;
    updateAddressList([myWallet], myWalletAddress, 'div')
})

socket.on('other user', (data:SocketResponse<Address>) => {
    const wallets = (data.data as Address[]).filter(v => v.address !== myAddress)
    updateAddressList(wallets, entireWalletAddress, 'li')
})

socket.on('mining success', (data) => {
    console.log(data)
    miningBtn.disabled = false;
    miningBtn.innerHTML = '채굴하기';
})

socket.on('update mempool', (data:SocketResponse<Utxo>) => {
    console.log('mempool updated!');
    console.log(data.data);
    updateMempool(data.data as Utxo[]);
})