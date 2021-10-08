const EthCrypto = require('eth-crypto');

// The client that end-users will use to interact with our central payment processor
class Client {
  // Initializes a public/private key pair for the user
  constructor() {
    this.wallet = EthCrypto.createIdentity();
    this.sign = this.sign.bind(this);
  }

  // Creates a keccak256/SHA3 hash of some data
  toHash(data) {
    const dataStr = JSON.stringify(data);
    return EthCrypto.hash.keccak256(dataStr);
  }

  // Signs a hash of data with the client's private key
  sign(message) {
    const messageHash = this.toHash(message);
    return EthCrypto.sign(this.wallet.privateKey, messageHash);
  }

  // Verifies that a messageHash is signed by a certain address
  verify(signature, messageHash, address) {
    const signer = EthCrypto.recover(signature, messageHash);
    return signer === address;
  }

  // Buys tokens from Paypal
  buy(amount) {
    // Let the user know that they just exchanged off-network goods for network tokens
    console.log(`CONGRATS YOU JUST SOLD YOUR KIDNEY FOR ${amount} YOUR MOM WOULD BE SO PROUD!`);
  }

  // Generates new transactions
  generateTx(to, amount, type) {
    // create an unsigned transaction
    const unsignedTx = {
      type,
      amount,
      from: this.wallet.address,
      to,
    };
    // create a signature of the transaction
    const signature = this.sign(unsignedTx);
    // return a Javascript object with the unsigned transaction and transaction signature
    return {
      contents: unsignedTx,
      sig: signature,
    };
  }
}

module.exports = Client;
