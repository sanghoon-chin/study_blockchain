// bytes: 4(출력 크기가 4바이트)
export const little_endian = (str: string, bytes?: number) => {
    let requiredNum = 0;
    if (str.length % 8 !== 0) {
        requiredNum = 8 - (str.length % 8);
    }
    const paddedStr = str.padStart(str.length + requiredNum, '0');
    const lit_endian = paddedStr.match(/../g)?.reverse().join('');
    if(bytes === 8){
        return lit_endian?.padEnd(16, '0')
    }
    return lit_endian;
}