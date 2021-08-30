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

export interface IBlockchain{
    chain: IBlock[]    
}

export type ParsedScriptPubKey = {
    type: 'OP' | 'VALUE';
    code: string;
}