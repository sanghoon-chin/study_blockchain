import {createHash} from 'crypto';

export const getHash = {
    hash(data:string):string{
        return createHash('sha256').update(data).digest('hex');
    },
    hash2(data:string):string{
        return createHash('sha256').update(Buffer.from(data, 'hex')).digest('hex');
    },
    binHash(data:string):Buffer{
        return createHash('sha256').update(Buffer.from(data, 'hex')).digest()
    },
    hexHash(data:Buffer):string{
        return createHash('sha256').update(data).digest('hex');
    },
    ripemd160Hash(data: string):string{
        return createHash('ripemd160').update(Buffer.from(data, 'hex')).digest('hex');
    }
}