import fetch from 'node-fetch';

//https://klmoney.wordpress.com/bitcoin-dissecting-transactions-part-1/#fnp12

const url = `https://blockchain.info/block-height/499118?format=json`;

const fetchData = async () => {
    const data = await (await fetch(url)).json();
    console.log(data)
}

fetchData()