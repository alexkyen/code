const EthCrypto = require('eth-crypto');
const hexToBinary = require('hex-to-binary');
const { Node, getTxHash } = require('../nodeAgent');

// Add Client class which generates & sends transactions
class Client extends Node {
  constructor(wallet, genesis, network) {
    super(wallet, genesis, network);
    this.blockchain = []; // longest chain
    this.allBlocks = []; // all blocks
    this.blockNumber = 0; // keep track of blocks added to blockchain despite getState()
    this.difficulty = 13;

    const genesisBlock = {
      nonce: 0,
      number: 0,
      coinbase: 0,
      difficulty: 9000,
      parentHash: 0,
      timestamp: 0,
      contents: {
        type: 'block',
        txList: [],
      },
    };
    this.blockchain.push(genesisBlock);
    this.allBlocks.push(genesisBlock);
  }

  // Check if a message is a transaction or a block
  onReceive(message) {
    // check the message.contents.type
    // if it's 'send', receiveTx(message)
    if (message.contents.type === 'send') {
      this.receiveTx(message);
    }
    // if it's 'block', receiveBlock(message)
    if (message.contents.type === 'block') {
      this.receiveBlock(message);
    }
  }

  // Process an incoming transaction
  receiveTx(tx) {
    // if we already have the transaction in our state, return to do nothing
    if (tx in this.state) {
      return;
    }
    // add the transaction to the pending transaction pool (this is often called the mempool)
    this.transactions.push(tx);
    // broadcast the transaction to the res of the network
    this.network.broadcast(this.pid, tx);
  }

  // Check the hash of an incoming block
  isValidBlockHash(block) {
    // hash the block
    const hash = EthCrypto.hash.keccak256(block);
    // convert the hex string to binary
    const binary = hexToBinary(hash);
    // check how many leading zeros the hash has
    let count = 0;
    for (let i = 0; i < binary.length; i++) {
      if (binary[i] === '0') count++;
      else break;
    }
    // compare the amount of leading zeros in the block hash to the network difficulty and
    // return a boolean if they match
    return count === this.difficulty;
  }

  // Processing the transactions in a block
  applyBlock(block) {
    // get all the transactions in block.contents
    // for every transaction in the transaction list
    // process the transaction to update our view of the state
    // if the transaction does not come from the 0 address (which is a mint transaction for
    // miners and has no sender)
    block.contents.txList.forEach((tx) => {
      if (tx.contents.from !== 0) {
        this.applyTransaction(tx);
      }
    });
    // check any pending transactions with invalid nonces to see if they are now valid
    Object.keys(this.invalidNonceTxs).forEach(address => this.applyInvalidNonceTxs(address));
  }

  // Update the state with transactions which are contained in the longest chain and return the
  // resulting state object (this process is often referred to as the "fork choice" rule)
  updateState() {
    // create an array to represent a temp chain
    // create a variable to represent all the blocks that we have already processed
    // find the highest block number in all the blocks
    this.blockNumber = this.allBlocks.reduce((acc, curr) => {
      if (curr.number > acc) {
        acc = curr.number;
      }
      return acc;
    }, 0);
    // add the highestBlockNumber to tempChain using blockNumber
    // add max number of blocks to tempChain using parentHash
    // save the ordered sequence
    // apply all txs from ordered list of blocks
    // return the new state
  }

  // Receiving a block, making sure it's valid, and then processing it
  receiveBlock(block) {
    // if we've already seen the block return to do nothing
    // if the blockhash is not valid return to do nothing
    // if checks pass, add block to all blocks received
    // if the block builds directly on the current head of the chain, append to chain
    // incriment the block number
    // add the block to our view of the blockchain
    // process the block
    // update our state with the new block
    // broadcast the block to the network
  }
}

module.exports = Client;
