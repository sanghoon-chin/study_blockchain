import {createHash} from 'crypto';

type Kind = 'bin' | 'hex';

export const getHash = (data: string, type:Kind='bin') => {
    let d = (type === 'bin') ? Buffer.from(data, 'hex') : data;
    return createHash('sha256').update(d).digest('hex');
}

// export const getHash = {
//     binHash(data:string):Buffer{
//         return createHash('sha256').update(Buffer.from(data, 'hex')).digest()
//     },
//     hexHash(data:Buffer){
//         return createHash('sha256').update(data).digest('hex');
//     }
// }