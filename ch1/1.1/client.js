const EthCrypto = require('eth-crypto');

// The client that end-users will use to interact with our central payment processor
class Client {
  // The constructor will initialize a public/private key pair for the user
  // - the public key is like an username or address that people can send stuff to
  // - the private key is like a password or key that allows someone to access the stuff in the
  // account and send transactions/messages from that account
  constructor() {
    // create a new Ethereum-identity with EthCrypto.createIdentity()
    // - should create a Javascript object with a privateKey, publicKey and address
    this.wallet = EthCrypto.createIdentity();
    // this.hash = this.hash.bind(this);
    /* > {
      address: '0x3f243FdacE01Cfd9719f7359c94BA11361f32471',
      privateKey: '0x107be946709e41b7895eea9f2dacf998a0a9124acbb786f0fd1a826101581a07',
      publicKey: 'bf1cc3154424dc22191941d9f4f50b063a2b663a2337e5548abea633c1d06ece...'
      } */
  }
}

// Creates a keccak256/SHA3 hash of some data
Client.prototype.hash = function (data) {
  return EthCrypto.hash.keccak256(data);
};


// Signs a hash of data with the client's private key
Client.prototype.sign = function (data) {
  return EthCrypto.sign(this.wallet.privateKey, this.hash(data));
};

// Verifies that a messageHash is signed by a certain address
Client.prototype.verify = function (signature, messageHash, address) {
  const signer = EthCrypto.recover(
    signature,
    messageHash,
  );
  return signer === address;
};

module.exports = Client;
