export interface Wallet {
    privKey: string;
    pubKey: string;
    address: string;
    formatPrivKey: string;
}

export interface SocketResponse<T> {
    success: boolean;
    data: T | T[]
}

export interface BlockType {
    hash?: string;
    ver?: number | string;
    prev_block?: string;
    mrkl_root?: string;
    time?: number | string;
    bits?: number | string;
    nonce?: number | string;
    height?: number;
}

export interface Utxo {
    amount: number;
    sender: string;
    recipient: string;
    txid?: string;
}