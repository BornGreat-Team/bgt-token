const express = require('express');
const app = express();
const axios = require('axios');
const port = 3000; 
const ipfsUrl = "https://ipfs.io/ipfs/"
require('dotenv').config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const JWT = process.env.JWT
const sdk = require('api')('@pinata-cloud/v1.0#12ai2blmsggcsb');

app.post('/ipfs', async (req, res) => {
try {
    sdk.auth(JWT);
    const data = await sdk.postPinningPinjsontoipfs({ pinataContent: req.body });
    res.json(data.data);
} catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
}
});
app.get('/ipfs/:parameter', async (req, res) => {
  try {
    const response = await axios.get(ipfsUrl+req.params.parameter);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the data.' });
  }
});
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

