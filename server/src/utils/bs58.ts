import { encode } from 'bs58';

export const bs58 = (data: string): string => {
    return encode(Buffer.from(data, 'hex'))
}