// import { v4 as uuidv4 } from 'uuid';
// import {ec as EC} from 'elliptic';

// export interface ITxInput {
//     txid: string | null;
//     vout: string;   // 출력 인덱스
//     scriptSig: string;
//     sequence: number;
// }

// export interface ITxOutput {
//     value: number;
//     scriptPubKey: string;
// }

// export interface ITransaction {
//     version: number;
//     locktime?: number;
//     vin: ITxInput[];
//     vout: ITxOutput[];
//     txID: string;
//     status: 'spent'|'unspent'
//     confirmed?: boolean;
// }

// export interface IBlock {
//     hash: string;
//     ver: number;
//     prev_block: string;
//     mrkl_root: string;
//     time: number;
//     bits: number;
//     height: number;
//     tranactions: ITransaction[]
// }

// export interface IBlockchain {
    
// }

// export interface IWallet {
//     id: typeof uuidv4;
//     name: string;
//     keyPair: EC.KeyPair;
//     encodedAddress: string;
//     createdAt: Date;
//     updatedAt?: Date;
// }

export interface IWallet {
    name: string;
    privKey: Buffer;
    pubKey: string;
    decodedAddress: string;
    encodedAddress: string;
}

export interface IBlock {
    hash: string;
    ver: number;
    time: number;
    prev_block: string;
    mrkl_root: string;
    bits: string;
    height: number;
    nonce: number;
    transactions: any[];
}

type TypeTxOutput = 'spent' | 'unspent';
type TypeTxStatus = 'unconfirm' | 'confirm';
type TypeTx = 'coinbase' | 'tx';

export interface ITxInput {
    sequence: number;
    txid: string;
    scriptSig?: string;
    vout: number;
    msg?: string | Buffer;    // 이전 utxo의 txid
}

export interface ITxOutput {
    recipientAddress: string;
    value: number;
    scriptPubKey: string;
    status: TypeTxOutput
}

export interface ITx {
    version: number;
    locktime: number;
    txid: string;
    vin: ITxInput[] | null;
    vout: ITxOutput[];
    status: TypeTxStatus;
    type: TypeTx
}

export type ParsedScriptPubKey = {
    type: 'OP' | 'VALUE';
    code: string;
}