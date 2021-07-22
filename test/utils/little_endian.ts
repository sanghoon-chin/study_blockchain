export const reverse_order = (str:string): string => {
    const reversed_str = str.split('').reverse();
    for(let i = 0;i<reversed_str.length;i+=2){
        [[reversed_str[i], reversed_str[i+1]]] = [[reversed_str[i+1], reversed_str[i]]];
    }
    return reversed_str.join('');
};

export const little_endian = (str:string) => {
    let requiredNum = 0;
    if(str.length % 8 !== 0){
        requiredNum = 8 - (str.length % 8);
    }
    const paddedStr = str.padStart(str.length + requiredNum, '0');
    const lit_endian = paddedStr.match(/../g)?.reverse().join('');
    return lit_endian;
}