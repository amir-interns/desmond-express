const fs = require(`fs`);
const express = require(`express`);
const bodyParser = require(`body-parser`);
const Web3 = require('web3');
const web3 = new Web3('wss://mainnet.infura.io/ws/v3/');

const app = express();
const urlencodedParser = bodyParser.urlencoded({extended: false});
let tokenAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7";
let minABI = [
    // balanceOf
    {
      "constant":true,
      "inputs":[{"name":"_owner","type":"address"}],
      "name":"balanceOf",
      "outputs":[{"name":"balance","type":"uint256"}],
      "type":"function"
    },
    // decimals
    {
      "constant":true,
      "inputs":[],
      "name":"decimals",
      "outputs":[{"name":"","type":"uint8"}],
      "type":"function"
    }
  ];

const contract = new web3.eth.Contract(minABI,tokenAddress);
let dec;
const decimals = contract.methods.decimals().call().then((response) => dec = response);

app.set('view engine', 'ejs');

app.use('/public', express.static('public'));

app.get('/', ((req, res) => {
    res.render(`index`);
}));

app.post('/success', urlencodedParser, ((req, res) => {

    res.render(`success`, {data: req.body});
    console.log(req.body);

}));


app.post('/checkBalance', urlencodedParser, (async(req, res) => {

    const account = {
        address: req.body.address,
        balance: await getBalance(req.body.address),
        usdtBalance: await getUsdtBalance(req.body.address)
    };

    //console.log(10**decimals);
    res.render(`result`, {data: account});
}));


app.get('/about', ((req, res) => {
    res.send(`Hi!`);
}));
//ETH balance
const getBalance = async(address) => {
    return web3.eth.getBalance(address);
};

//token balance
const getUsdtBalance = async(walletAddress) => {
    return (contract.methods.balanceOf(walletAddress).call().then((response) => { return (response / 10**dec)  })); 
};

app.listen(3000);