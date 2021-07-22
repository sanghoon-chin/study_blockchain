import { BlockType } from "../../interface";

export class BlockChain {
    chain: BlockType[] = [];

    appendBlock(block){
        block.height = this.chain.length;
        this.chain.push(block)
    }

    get exportBlockChain(){
        return this.chain
    }

    checkBalance(user:string){
        // 송신자 또는 수신자의 잔액확인하는 로직
    }
}