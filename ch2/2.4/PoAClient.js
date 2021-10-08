const EthCrypto = require('eth-crypto');
const _ = require('lodash');
const NetworkSimulator = require('../networkSim');
const { Node, getTxHash } = require('../nodeAgent');

class PoA extends Node {
  constructor(wallet, genesis, network, authority) {
    super(wallet, genesis, network);
    this.authority = authority; // Eth Address of the authority node
    this.orderNonce = 0;
  }

  onReceive(tx) {
    if (this.transactions.includes(tx)) {
      return;
    }
    this.transactions.push(tx);
    this.applyTransaction(tx);
    this.network.broadcast(this.pid, tx);
    this.applyInvalidNonceTxs();
  }

  generateTx(to, amount) {
    const unsignedTx = {
      type: 'send',
      amount,
      from: this.wallet.address,
      to,
      nonce: this.state[this.wallet.address].nonce,
    };
    const tx = {
      contents: unsignedTx,
      sigs: [],
    };
    tx.sigs.push(EthCrypto.sign(this.wallet.privateKey, getTxHash(tx)));
    return tx;
  }

  applyInvalidNonceTxs() {
    if (this.orderNonce in this.invalidNonceTxs) {
      this.applyTransaction(this.invalidNonceTxs[this.orderNonce]);
      delete this.invalidNonceTxs[this.orderNonce - 1]; // -1 because we increment orderNonce in applyTransaction
      this.applyInvalidNonceTxs();
    }
  }

  applyTransaction(tx) {
    // get the transaction from before the authority node added ordering and make a copy of it
    const originalTx = JSON.parse(JSON.stringify(tx));
    // delete the order nonce from the original transaction
    delete originalTx.contents.orderNonce;
    // clear the transaction signatures
    originalTx.sigs = [];
    // get tx from before the auth node signed it
    const slicedTx = {
      contents: tx.contents,
      sigs: tx.sigs.slice(0, 1),
    };
    // check the signer of the transaction and throw an error if the signature cannot be verified
    // since the original tx is hashed with an empty sigs array (prior to pushing the resulting
    // hash into its own sigs array), we must recover the hash from the "originalTx" with an empty
    // tx.sigs array. We can still use the tx provided by the authority to access the resulting sig.
    const sender = EthCrypto.recover(tx.sigs[0], getTxHash(originalTx));
    if (sender !== tx.contents.from) throw Error('sorry, but we cannot verify the identity of the sender');
    // check the authority for the network and throw an error if the transaction does not
    const authority = EthCrypto.recover(tx.sigs[1], getTxHash(slicedTx));
    if (authority !== this.authority) throw Error('sorry, but we cannot verify the identity of the authority');
    if (!(tx.contents.to in this.state)) {
      this.state[tx.contents.to] = {
        balance: 0,
        nonce: 0,
      };
    }
    // Check that this is the next transaction in the Authority node's ordering
		// - hint: check if the nonce ordering is greater or less than it's supposed to be
    if (tx.contents.orderNonce > this.orderNonce) {
      // in this version of applying invalid nonce transactions, we do not store invalid txs
      // on a per sender basis in the invalidNonceTxs object, we simply store them by orderNonce.
      this.invalidNonceTxs[tx.contents.orderNonce] = tx;
      return;
    }
    if (tx.contents.orderNonce < this.orderNonce) {
      console.log('order nonce rejected');
      return;
    }
    // if all checks pass...
    if (tx.contents.type === 'send') {
      // Send coins
      if (this.state[tx.contents.from].balance - tx.contents.amount < 0) {
        throw new Error('Not enough money!');
      }
      this.state[tx.contents.from].balance -= tx.contents.amount;
      this.state[tx.contents.to].balance += tx.contents.amount;
    } else {
      throw new Error('Invalid transaction type!');
    }
    // increment nonce
    this.state[tx.contents.from].nonce++;
    this.orderNonce++;
  }
}

module.exports = PoA;
