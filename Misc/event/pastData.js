const Web3 = require('web3');
const web3 = new Web3("https://mainnet.infura.io/v3/");
const CONTRACT_ADDRESS = "0xdc8aF07A7861bedD104B8093Ae3e9376fc8596D2";
const CONTRACT_ABI =""
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

async function getEvents() {
    let latest_block = await web3.eth.getBlockNumber();
    let historical_block = latest_block - 10000;
    const events = await contract.getPastEvents(
        'Approval',
        { fromBlock: historical_block, toBlock: 'latest' }
    );
        console.log(events)
};
getEvents()