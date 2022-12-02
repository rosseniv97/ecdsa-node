import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ privateKey, setBalance, setTransactions, transactions }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    const previousTransactionId =
      transactions.length ?? transactions[transactions.length - 1];
    const payload = {
      transactionId: previousTransactionId + 1,
      amount: parseInt(sendAmount),
      recipient,
    };

    const hashedPayload = toHex(
      keccak256(utf8ToBytes(JSON.stringify(payload)))
    );

    const [signature, recoveryBit] = await secp.sign(
      hashedPayload,
      privateKey,
      {
        recovered: true,
      }
    );

    try {
      const {
        data: { balance, transactions },
      } = await server.post(`send`, {
        signature: toHex(signature),
        recoveryBit,
        payload,
      });
      setBalance(balance);
      setTransactions(transactions);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
