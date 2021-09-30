export const reverse_order = (str: string): string => {
    if(!str) return ''
    const reversed_str = str.split('').reverse();
    for (let i = 0; i < reversed_str.length; i += 2) {
        [[reversed_str[i], reversed_str[i + 1]]] = [[reversed_str[i + 1], reversed_str[i]]];
    }
    return reversed_str.join('');
};