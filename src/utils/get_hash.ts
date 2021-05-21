import {createHash} from 'crypto';

export const getHash = (data: string, type='bin') => {
    let d = (type === 'bin') ? Buffer.from(data, 'hex') : data;
    return createHash('sha256').update(d).digest('hex');
}