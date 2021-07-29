export class Blockchain{
    blockchain;
    mempool;

    constructor(){
        
    }

    genesisBlock(block){
        this.mempool.push(block);
    }

    __str__(){
        return this.blockchain;
    }
}