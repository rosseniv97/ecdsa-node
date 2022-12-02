import { useState } from "react";

function Transactions({ transactions }) {
  return (
    <div className="container wallet">
      <h1>Transactions</h1>
      {transactions.map(({ transactionId, recipient, amount }) => (
        <>
          <div className="balance">Id: {transactionId}</div>
          <div className="balance">Amount: {amount}</div>
          <div className="balance">Recipient: {recipient}</div>
        </>
      ))}
    </div>
  );
}

export default Transactions;
