import type {IBlock, IBlockchain} from '../../interface';

export class Blockchain implements IBlockchain{
    chain:any[] = []

    appendBlock(block){
        this.chain.push(block)
    }

    get lastestBlock(){
        return this.chain[this.chain.length - 1];
    }
}