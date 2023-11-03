import bgtToken from './artifacts/contracts/BGTToken.sol/BGTToken.json';
import bgtMinter from './artifacts/contracts/BGTMinter.sol/BGTMinter.json';
import axios from 'axios'; // Import axios for making HTTP requests
import logo from './logo.svg';
import React, { useState } from 'react';
import './App.css';
import Web3 from 'web3'
import { YOUR_TOKEN_SOURCE_CODE, YOUR_MINTER_SOURCE_CODE } from './soliditySourceCode';


function App() {

  const YOUR_API_KEY = "27QZSIAZV3A4A9QINEFVG8WAGJTSS966GG";

  const networkChainMap = {
    eth: 1,
    bsc: 56,
    polygon: 137,
    arbi: 42161,
    bscTestnet: 97,
    sepoliaTestnet: 11155111,
    Mumbai: 80001,
    ArbitrumTestnet: 421613
  };

  const [arg1, setArg1] = useState('');

  const [arg2, setArg2] = useState('');

  const [arg3, setArg3] = useState('');

  const [selectedOption, setSelectedOption] = useState("");

  const [tokenContract, setTokenContract] = useState('');

  const [minterContract, setMinterContract] = useState('');

  const [isConnected, setIsConnected] = useState(false);

  const [tokenDeployed, setTokenDeployed] = useState(false);

  const [isTokenVerified, setIsTokenVerified] = useState(false);

  const [isMinterVerified, setIsMinterVerified] = useState(false);

  const handleArg1Change = (e) => {
    setArg1(e.target.value);
  };

  const handleArg2Change = (e) => {
    setArg2(e.target.value);
  };

  const handleArg3Change = (e) => {
    setArg3(Web3.utils.toWei(e.target.value, 'ether'));
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
      case "Mumbai":
        changeNetwork("Mumbai")
      case "ArbitrumTestnet":
        changeNetwork("ArbitrumTestnet")
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
        else if (error.message.split('"')[1] == Web3.utils.toHex(80001)) {
          const rpcUrls = ['https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78'];
          const chainName = 'Mumbai';
          const currencySymbol = 'MATIC';
          const blockExplorerUrl = 'https://mumbai.polygonscan.com';
          addRpcUrl(Web3.utils.toHex(80001), rpcUrls, chainName, currencySymbol, blockExplorerUrl)
        }
        else if (error.message.split('"')[1] == Web3.utils.toHex(421613)) {
          const rpcUrls = ['https://goerli-rollup.arbitrum.io/rpc'];
          const chainName = 'Arbitrum Goerli';
          const currencySymbol = 'ETH';
          const blockExplorerUrl = 'https://goerli.arbiscan.io';
          addRpcUrl(Web3.utils.toHex(421613), rpcUrls, chainName, currencySymbol, blockExplorerUrl)
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

  const verifyContract = async (contractAddress, contractSourceCode) => {
    try {
      const response = await axios.post(
        `https://api-sepolia.etherscan.io/api`,
        null,
        {
          params: {
            module: 'contract',
            action: 'verifysourcecode',
            apikey: YOUR_API_KEY,
            contractaddress: contractAddress,
            sourceCode: contractSourceCode,
            contractname: 'BGTToken',
            compilerversion: 'v0.8.21+commit.d9974bed',
            optimizationused: '1',
            codeformat: 'solidity-single-file'
          },
        }
      );

      const data = response.data;
      if (data.status === '1') {
        return true; // Contract verification successful
      } else {
        return false; // Contract verification failed
      }
    } catch (error) {
      console.error('Error verifying contract:', error);
      return false;
    }
  };

  const handleVerifyToken = async () => {
    if (!tokenContract) {
      console.error('Token contract address is not available');
      return;
    }

    const contractSourceCode = YOUR_TOKEN_SOURCE_CODE;
    const isVerified = await verifyContract(tokenContract, contractSourceCode);
    setIsTokenVerified(isVerified);
  };

  const handleVerifyMinter = async () => {
    if (!minterContract) {
      console.error('Minter contract address is not available');
      return;
    }

    const contractSourceCode = YOUR_MINTER_SOURCE_CODE;
    const isVerified = await verifyContract(minterContract, contractSourceCode);
    setIsMinterVerified(isVerified);
  };

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
            {/* <option value="bscTestnet">BSC Testnet</option> */}
            <option value="sepoliaTestnet">Sepolia Testnet</option>
            <option value="Mumbai">Mumbai Testnet</option>
            <option value="ArbitrumTestnet">Arbitrum Testnet</option>
          </select>
        </div>
        <br />

        <img src={logo} className="App-logo" alt="logo" />

        <form onSubmit={handleTokenDeploy}>
          <button type="submit" disabled={!selectedOption}>Deploy New BGT Token</button>
        </form>

        {tokenContract && (
          <>
            {/* <button type="button" onClick={handleVerifyToken}>
              Verify Token
            </button> */}
            <div className="Token-address">
              <p>Token Contract Address:</p>
              <p>{tokenContract}</p>
            </div>
            {/* {isTokenVerified ? (
              <p>Token Contract Verified!</p>
            ) : (
              <p>Token Contract Not Verified</p>
            )} */}
          </>
        )}

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
          <>
            {/* <button type="button" onClick={handleVerifyMinter}>
              Verify Minter
            </button> */}
            <div className="Token-address">
              <p>Minter Contract Address:</p>
              <p>{minterContract}</p>
            </div>
            {/* {isMinterVerified ? (
              <p>Minter Contract Verified!</p>
            ) : (
              <p>Minter Contract Not Verified</p>
            )} */}
          </>
        )}

      </header>
    </div>
  );
}

export default App;