const EthCrypto = require('eth-crypto');
const NetworkSimulator = require('../networkSim');
const { Node, getTxHash } = require('../nodeAgent');

// Spender is a Node that sends a random transaction at every tick()
// Spender extends the Node class in nodeAgent.js
// - this means that everything that is available to the Node class is imported and available to the Spender class as well
class Spender extends Node {
  constructor(wallet, genesis, network, nodes) {
    super(wallet, genesis, network);
    this.nodes = nodes;
  }
  // returns a random wallet address (excluding the Spender)
  getRandomReceiver() {
    // create array of Node addresses that does not include this Node
    const peers = Object.keys(this.network.peers).map(pid => pid !== this.pid);
    // pick a node at random from the nodes that are not this node
    // return the address of that random node
    return peers[Math.floor(Math.random() * peers.length)];
  }

  // tick() makes stuff happen
  // in this case we're simulating agents performing actions on a network
  // available options are
  // - do nothing
  // - send a transaction
  tick() {
    // check if we have money
    if (!this.state[this.wallet.address].balance) {
      // if we have no money, don't do anything
      // print a fun message to the console stating that we're not doing anything
      console.log('Looks like you need to invest in some BTC. What are you waiting for?');
      // return to exit the function
      return;
    }
    // if we do have money
    // Generate a random transaction
    const peer = this.getRandomReceiver();
    const tx = this.generateTx(peer, 1);
    // add the transaction to our historical transaction list
    this.transactions.push(tx);
    // process the transaction
    this.applyTransaction(tx);
    // broadcast the transaction to the network
    this.network.broadcast(this.pid, tx);
  }
}

module.exports = Spender;
