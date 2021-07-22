export const little_endian = (str: string) => {
    let requiredNum = 0;
    if (str.length % 8 !== 0) {
        requiredNum = 8 - (str.length % 8);
    }
    const paddedStr = str.padStart(str.length + requiredNum, '0');
    const lit_endian = paddedStr.match(/../g)?.reverse().join('');
    return lit_endian;
}