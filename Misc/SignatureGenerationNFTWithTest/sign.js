const { ethers } = require("ethers");
const fs = require("fs");
const privateKey = "PrivateKey";

// below is sample of obj which we can use
let obj =[{
mintToAddress:"0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
contractAddress:"0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
price:50,
itemId:[1, 2],
uri:["asdsa", "asdsaa"]
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
      obj[i].itemId,
      obj[i].uri
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

async function whiteListUsers(mintTo, contractAddress, price, itemId, uri) {
  const signer = new ethers.Wallet("0x" + privateKey);
  const message = ethers.utils.solidityKeccak256(
    [`address`,`address`, `uint256`, `uint256[]`, `string[]`],
    [mintTo,contractAddress,price, itemId, uri]
  );
  const signature = await signer.signMessage(ethers.utils.arrayify(message));
  let { r, s, v } = ethers.utils.splitSignature(signature);
  console.log({ r, s, v });
  return { r, s, v };
}

signGenerator(obj);