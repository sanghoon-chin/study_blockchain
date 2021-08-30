import type {IBlock, IBlockchain} from '../../interface';

export class Blockchain implements IBlockchain{
    chain:IBlock[] = []

    // 각 노드들이 블록을 넣을 수 있게끔
    appendBlock(block:IBlock){
        this.chain.push(block)
    }

    isValidBlock(block:IBlock){
        if(this.lastestBlock.hash === block.prev_block && block.nonce){
            return true;
        } else {
            return false;
        }
    }

    get lastestBlock(){
        return this.chain[this.chain.length - 1];
    }
}