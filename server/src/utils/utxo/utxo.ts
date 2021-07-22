import {getHash} from '../index';

export class UTXO {
    amount: number;
    sender: string|null;    // 제네시스 블록에선 sender가 없음
    recipient: string;
    txid?: string;

    constructor(amount:number, sender:string|null, recipient:string) {
        this.amount = amount;
        this.sender = sender;
        this.recipient = recipient;

        this.generateTxid();
    }

    private generateTxid(){
        const concatStr = this.sender + this.recipient + this.amount;
        // 일단 그냥 더블해시로 txid 생성 => 검증을 못함...
        const hash1 = getHash.binHash(concatStr);
        const hash2 = getHash.hexHash(hash1);
        this.txid = hash2;
    }

    getUTXO(){
        this.generateTxid();

        const transaction = {
            amount: this.amount,
            sender: this.sender,
            recipient: this.recipient,
            txid: this.txid
        }
        return transaction
    }
}