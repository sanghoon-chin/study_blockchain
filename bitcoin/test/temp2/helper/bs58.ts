import { decode, encode } from 'bs58';

export const bs58_encode = (data: string): string => {
    return encode(Buffer.from(data, 'hex'))
}

export const bs58_decode = (address:string):string => {
    return decode(address).toString('hex').slice(2, 42);    
    // 여기 왜 다르게 나오지!? 그래서 slice로 필요한 부분만 잘랐음
    // ex.http://royalforkblog.github.io/2014/11/20/txn-demo/
}