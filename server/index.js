const express = require("express");
const app = express();
const cors = require("cors");
const secp = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "04e3e116ba6cf63d781c6106ec01bae9f0562ad73dedeb0ed088bc8a15e2e3012a8f359cb8f54ab1e09e19e86535929ea5e36364431f1ccfff492c543c1dbdbd2c": 100,
  "048747e22c73ed64d9c2b28c690e8394b2846d6fcc88fcd3fc14dc1df0bbc43758aa6231e704e11b12f5bca47a2e721ced9e8918ade73cfe77d55a0b2722951155": 50,
  "04ae5a199f9ef2ae2b5405a4f4db299c6bfb248a28229c31b20831124588197c65ced096bc940cbca70a5d27032775521c64fc4fe97696593f19d2f3ad70d01e5f": 75,
};

const transactionsList = [];

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.get("/transactions", (req, res) => {
  res.send({
    transactionsList,
  });
});

app.post("/send", (req, res) => {
  const { signature, recoveryBit, payload } = req.body;
  const { transactionId, recipient, amount } = payload;
  const hashedPayload = toHex(keccak256(utf8ToBytes(JSON.stringify(payload))));
  const publicKey = toHex(
    secp.recoverPublicKey(hashedPayload, signature, recoveryBit)
  );
  const invalidTransactionId =
    transactionsList.length > 0 &&
    transactionId !==
      transactionsList[transactionsList.length - 1]?.transactionId + 1;
  const valid =
    !invalidTransactionId && secp.verify(signature, hashedPayload, publicKey);

  if (valid) {
    const sender = publicKey;
    console.log(sender);
    setInitialBalance(publicKey);
    setInitialBalance(recipient);

    if (balances[sender] < parseFloat(amount)) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      transactionsList.push(payload);
      res.send({ balance: balances[sender], transactions: transactionsList });
    }
  } else {
    res.status(400).send({ message: "Invalid transaction" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
