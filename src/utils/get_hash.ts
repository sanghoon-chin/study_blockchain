import {createHash} from 'crypto';

type Kind = 'bin' | 'hex';

export const getHash = (data: string, type:Kind='bin') => {
    let d = (type === 'bin') ? Buffer.from(data, 'hex') : data;
    return createHash('sha256').update(d).digest('hex');
}