const Web3 = require('web3');
const web3 = new Web3("wss://mainnet.infura.io/ws/v3/");
const CONTRACT_ADDRESS = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
const CONTRACT_ABI =""
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

async function getEvents() {
    contract.events.Transfer().on('data', (event) => {
        console.log(event.returnValues)
    }).on('error', (error) => {
        console.error('Error:', error);
      });

};
getEvents()