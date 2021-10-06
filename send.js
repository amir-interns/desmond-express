const sendBitcoin = async (recieverAddress, amountToSend) => {
  const axios = require("axios");
  const bitcore = require("bitcore-lib");
    const sochain_network = "BTCTEST";
    const privateKey = "92mmY2TTydkHmGpcAWCmqEZjMwxN23TxHgq9HVzSrXxNa17zTWF";
    const sourceAddress = "n3bduR9Y27yZsfCMFyPJokVhe9KPdd6bEu";
    const satoshiToSend = amountToSend * 100000000;
    let fee = 0;
    let inputCount = 0;
    let outputCount = 2;
    const utxos = await axios.get(
      `https://sochain.com/api/v2/get_tx_unspent/${sochain_network}/${sourceAddress}`
    );
    const transaction = new bitcore.Transaction();
    let totalAmountAvailable = 0;
  
    let inputs = [];
    utxos.data.data.txs.forEach(async (element) => {
      let utxo = {};
      utxo.satoshis = Math.floor(Number(element.value) * 100000000);
      utxo.script = element.script_hex;
      utxo.address = utxos.data.data.address;
      utxo.txId = element.txid;
      utxo.outputIndex = element.output_no;
      totalAmountAvailable += utxo.satoshis;
      inputCount += 1;
      inputs.push(utxo);
    });
  
    transactionSize = inputCount * 146 + outputCount * 34 + 10 - inputCount;
    // Check if we have enough funds to cover the transaction and the fees assuming we want to pay 20 satoshis per byte
  
    fee = transactionSize * 20
    if (totalAmountAvailable - satoshiToSend - fee  < 0) {
      throw new Error("Balance is too low for this transaction");
    }
  
    //Set transaction input
    transaction.from(inputs);
  console.log(satoshiToSend);
    // set the recieving address and the amount to send
    transaction.to(recieverAddress, satoshiToSend);
  
    // Set change address - Address to receive the left over funds after transfer
    transaction.change(sourceAddress);
  
    //manually set transaction fees: 20 satoshis per byte
    transaction.fee(fee * 20);
  
    // Sign transaction with your private key
    transaction.sign(privateKey);
  
    // serialize Transactions
    const serializedTX = transaction.serialize();
    // Send transaction
    const result = await axios({
      method: "POST",
      url: `https://sochain.com/api/v2/send_tx/${sochain_network}`,
      data: {
        tx_hex: serializedTX,
      },
    });
    return result.data.data;
  };

  module.exports.sendBitcoin = sendBitcoin;