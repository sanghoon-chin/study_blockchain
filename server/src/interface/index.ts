import { v4 as uuidv4 } from 'uuid';
import {ec as EC} from 'elliptic';

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
    status: 'spent'|'unspent'
    confirmed?: boolean;
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

export interface IWallet {
    id: typeof uuidv4;
    name: string;
    keyPair: EC.KeyPair;
    encodedAddress: string;
    createdAt: Date;
    updatedAt?: Date;
}