export interface ITxInput {
    txid: string | null;
    vout: string;   // 출력 인덱스
    scriptSig: string;
    sequence: number;
}

export interface ITxOutput {
    value: number;
    scriptPubKey: string;
}

export interface ITransaction {
    version: number;
    locktime?: number;
    vin: ITxInput[];
    vout: ITxOutput[];
    txID: string;
}

export interface IBlock {
    hash: string;
    ver: number;
    prev_block: string;
    mrkl_root: string;
    time: number;
    bits: number;
    height: number;
    tranactions: ITransaction[]
}

export interface IBlockchain {
    
}