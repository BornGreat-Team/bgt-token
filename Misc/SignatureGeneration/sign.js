const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();
const privateKey = 'PRIVATE_KEY';

// below is sample of obj which we can use
let obj =[{
mintToAddress:"0xC35DAF6d1c901FE38F0F7B87BC99bC1Df694c024",
contractAddress:"0xC35DAF6d1c901FE38F0F7B87BC99bC1Df694c024",
price:50,
itemId:[2,4]
},
]

async function signGenerator(obj) {
  let output = [];
  for (let i = 0; i < obj.length; i++) {
    let newArr = [];
    let signature = await whiteListUsers(
      obj[i].mintToAddress,
      obj[i].contractAddress,
      obj[i].price,
      obj[i].itemId

    );
    newArr.push(signature.r, signature.s, signature.v);
    output.push(newArr);
  }
  fs.writeFileSync(
    `./arguments.js`,
    "module.exports = " + JSON.stringify(output) + ";"
  );
  return output;
}

async function whiteListUsers(mintTo, contractAddress, price, itemId) {
  const signer = new ethers.Wallet("0x" + privateKey);
  const message = ethers.utils.solidityKeccak256(
    [`address`,`address`, `uint256`, `uint256[]`],
    [mintTo,contractAddress,price, itemId]
  );
  const signature = await signer.signMessage(ethers.utils.arrayify(message));
  let { r, s, v } = ethers.utils.splitSignature(signature);
  return { r, s, v };
}

signGenerator(obj);