import bgtToken from './artifacts/contracts/BGTToken.sol/BGTToken.json';
import bgtMinter from './artifacts/contracts/BGTMinter.sol/BGTMinter.json';
import logo from './logo.svg';
import React, { useState } from 'react';
import './App.css';
import Web3 from 'web3'

function App() {

  const networkChainMap = {
    eth: 1,
    bsc: 56,
    polygon: 137,
    arbi: 42161,
    bscTestnet: 97,
    sepoliaTestnet: 11155111
  };

  const [arg1, setArg1] = useState('');

  const [arg2, setArg2] = useState('');

  const [arg3, setArg3] = useState('');

  const [selectedOption, setSelectedOption] = useState("");

  const [tokenContract, setTokenContract] = useState('');

  const [minterContract, setMinterContract] = useState('');

  const [isConnected, setIsConnected] = useState(false);

  const [tokenDeployed, setTokenDeployed] = useState(false);

  const handleArg1Change = (e) => {
    setArg1(e.target.value);
  };

  const handleArg2Change = (e) => {
    setArg2(e.target.value);
  };

  const handleArg3Change = (e) => {
    setArg3(Web3.utils.toWei(e.target.value , 'ether'));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  if (window.ethereum) {
    window.ethereum.enable()
      .then(function (accounts) {
        console.log("Wallet connected with " + accounts)
      })
      .catch(function (error) {
        alert(error)
      });
  }
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);

    switch (event.target.value) {
      case "eth":
        changeNetwork("eth");
        break;
      case "bsc":
        changeNetwork("bsc")
        break;
      case "polygon":
        changeNetwork("polygon")
        break;
      case "arbi":
        changeNetwork("arbi")
        break;
      case "bscTestnet":
        changeNetwork("bscTestnet")
        break;
      case "sepoliaTestnet":
        changeNetwork("sepoliaTestnet")
        break;
      default:
        break;
    }
  };

  const switchChain = async (chainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: Web3.utils.toHex(chainId) }],
      });
    } catch (error) {
      if (error.code === 4902) {
        if (error.message.split('"')[1] == Web3.utils.toHex(56)) {
          const rpcUrls = ['https://bsc-dataseed.binance.org/'];
          const chainName = 'Binance Smart Chain';
          const currencySymbol = 'BNB';
          const blockExplorerUrl = 'https://bscscan.com/';
          addRpcUrl(Web3.utils.toHex(56), rpcUrls, chainName, currencySymbol, blockExplorerUrl)
        }
        else if (error.message.split('"')[1] == Web3.utils.toHex(137)) {
          const rpcUrls = ['https://polygon-rpc.com/'];
          const chainName = 'Polygon';
          const currencySymbol = 'MATIC';
          const blockExplorerUrl = 'https://polygonscan.com/';
          addRpcUrl(Web3.utils.toHex(137), rpcUrls, chainName, currencySymbol, blockExplorerUrl)
        }
        else if (error.message.split('"')[1] == Web3.utils.toHex(42161)) {
          const rpcUrls = ['https://arb1.arbitrum.io/rpc'];
          const chainName = 'Arbitrum One';
          const currencySymbol = 'ETH';
          const blockExplorerUrl = 'https://arbiscan.io';
          addRpcUrl(Web3.utils.toHex(42161), rpcUrls, chainName, currencySymbol, blockExplorerUrl)
        }
        else if (error.message.split('"')[1] == Web3.utils.toHex(97)) {
          const rpcUrls = ['https://bsc-testnet.public.blastapi.io'];
          const chainName = 'BSC Testnet';
          const currencySymbol = 'BNB';
          const blockExplorerUrl = 'https://testnet.bscscan.com/';
          addRpcUrl(Web3.utils.toHex(97), rpcUrls, chainName, currencySymbol, blockExplorerUrl)
        }
        else if (error.message.split('"')[1] == Web3.utils.toHex(11155111)) {
          const rpcUrls = ['https://rpc.sepolia.ethpandaops.io'];
          const chainName = 'Sepolia';
          const currencySymbol = 'SepoliaETH';
          const blockExplorerUrl = 'https://sepolia.etherscan.io/';
          addRpcUrl(Web3.utils.toHex(11155111), rpcUrls, chainName, currencySymbol, blockExplorerUrl)
        }
      }
      else {
        console.error(error);
      }

    }
  };

  const changeNetwork = async (value) => {
    const chainId = networkChainMap[value];
    if (chainId && window.ethereum) {
      await switchChain(chainId);
    }
  };

  let handleTokenDeploy = async (e) => {
    e.preventDefault();

    if (selectedOption !== 'sepoliaTestnet') {
      alert('Please select Sepolia/Ethereum Chain for deployment of contract with 0.8.21 solidity version');
      return;
    }

    const contractAbi = bgtToken.abi
    const contractByteCode = bgtToken.bytecode
    const web3 = new Web3(Web3.givenProvider)
    const Contract = new web3.eth.Contract(contractAbi);

    const accounts = await web3.eth.getAccounts()
    Contract.deploy({
      data: contractByteCode,
    }).send({
      from: accounts[0]
    }).then((newContractInstance) => {
      setTokenContract(newContractInstance.options.address)
      setTokenDeployed(true);
    });
  }

  let handleMinterDeploy = async (e) => {
    e.preventDefault();

    if (selectedOption !== 'sepoliaTestnet') {
      alert('Please select Sepolia/Ethereum Chain for deployment of contract with 0.8.21 solidity version');
      return;
    }

    const contractAbi = bgtMinter.abi
    const contractByteCode = bgtMinter.bytecode
    const web3 = new Web3(Web3.givenProvider)
    const Contract = new web3.eth.Contract(contractAbi);

    const accounts = await web3.eth.getAccounts()
    Contract.deploy({
      data: contractByteCode,
      arguments: [arg1, arg2, arg3],
    }).send({
      from: accounts[0]
    }).then((newContractInstance) => {
      setMinterContract(newContractInstance.options.address)
    });

  }

  async function addRpcUrl(inputChainId, rpcUrls, chainName, currencySymbol, blockExplorerUrl) {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: inputChainId,
            rpcUrls,
            chainName,
            nativeCurrency: {
              name: currencySymbol,
              symbol: currencySymbol,
              decimals: 18,
            },
            blockExplorerUrls: [blockExplorerUrl],
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>

      <header className="App-header">
        <div className="App">
        <p>Please Select the chain before Deploying the contracts</p>
          <select value={selectedOption} onChange={handleOptionChange}>
            <option value="">Select an option</option>
            <option value="eth">Ethereum</option>
            <option value="bsc">Binance</option>
            <option value="polygon">Polygon</option>
            <option value="arbi">Arbitrum</option>
            <option value="bscTestnet">BSC Testnet</option>
            <option value="sepoliaTestnet">Sepolia Testnet</option>
          </select>
        </div>
        <br />

        <img src={logo} className="App-logo" alt="logo" />

        <form onSubmit={handleTokenDeploy}>
          <button type="submit" disabled={!selectedOption}>Deploy New BGT Token</button>
        </form>

        {tokenContract && (
          <div className="Token-address">
            <p>Token Contract Address:</p>
            <p>{tokenContract}</p>
          </div>)}

        <form onSubmit={handleSubmit}>
          <div>
            <label>Token Address </label>
            <input type="text" placeholder='Address of the Token' onChange={handleArg1Change} />
          </div>
          <div>
            <label>Release Time </label>
            <input type="text" placeholder='Time in Seconds' onChange={handleArg2Change} />
          </div>
          <div>
            <label>Monthly Limit </label>
            <input type="text" placeholder='Amount of tokens' onChange={handleArg3Change} />
          </div>
        </form>
        <form onSubmit={handleMinterDeploy}>
          <button type="submit" disabled={!tokenDeployed}>Deploy New BGT Minter</button>
        </form>

        {minterContract && (
          <div className="Token-address">
            <p>Minter Contract Address:</p>
            <p>{minterContract}</p>
          </div>)}

      </header>
    </div>
  );
}

export default App;
