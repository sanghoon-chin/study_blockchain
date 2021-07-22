import {reverse_order, getHash} from '../index';

export const get_merkle_root_hash = (txids: string[]): string => {
    let temp1 = txids;
    let temp2:string[] = [];

    const create_merkle_hash = (id1: string, id2: string) => {
        let tx1 = reverse_order(id1);
        let tx2 = reverse_order(id2 || id1);    // 만약 id2가 없다면(홀수개면) 같은걸로!

        let txid = tx1 + tx2;

        let hash1 = getHash.binHash(txid);
        let hash2 = getHash.hexHash(hash1);
        return reverse_order(hash2);
    }

    let i = 0;
    while (true) {
        if (temp1.length === 1) break;
        if (i == temp1.length) {
            temp1 = temp2;
            temp2 = [];
            i = 0;
        } else {
            temp2.push(create_merkle_hash(temp1[i], temp1[i + 1]));
            i += 2;
        }
    }
    return temp1[0];
};