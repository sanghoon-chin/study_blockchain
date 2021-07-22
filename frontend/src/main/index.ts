import './index.css';
import { io, Socket } from 'socket.io-client';

import {SocketResponse, Wallet} from '../../../server/src/interface'

const socket = io('/api');

const $ = document.querySelector.bind(document);

const createWalletBtn = $('#create-wallet-btn') as HTMLButtonElement;
const myWalletAddress = $('#my-wallet-address') as HTMLDivElement;
const entireWalletAddress = $('#entire-wallet-address') as HTMLUListElement;
const miningBtn = $('#mining-btn') as HTMLButtonElement;

let myAddress:string;

type Address = Pick<Wallet, 'pubKey'|'address'>

createWalletBtn.addEventListener('click', (e) => {
    socket.emit('create wallet');
})

miningBtn.addEventListener('click', (e) => {
    (e.target as HTMLButtonElement).disabled = true;
    socket.emit('mining block');
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

socket.on('add user', (data:SocketResponse<Wallet>) => {
    alert('주소 생성 완료');
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
})