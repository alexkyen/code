const EthCrypto = require('eth-crypto');
const Client = require('./client.js');

console.log('/////////////////////////////////////');
console.log('// Hashing and Public/Private Keys //');
console.log('/////////////////////////////////////');

// Hashing A Message
console.log("\nLet's hash a message!");
const message = 'Hello World';
console.log('The message is: ', message);
const messageHash = EthCrypto.hash.keccak256(message);
console.log('The hash of that message is: ', messageHash);

// Creating Public/Private Keys
// console.log('\nCreating public/private key pairs to sign and verify messages.')

// Init Alice
const alice = new Client();
console.log('Init Alice\'s Client\n', alice);

// Init Bob
const bob = new Client();
console.log('Init Bob\'s Client\n', bob);

// Notes
console.log('Notice that on their own Alice, Bob, and Carol just have keys. In order to have accounts that can hold tokens they need to connect to a network. The Paypal network is one such network, but Bitcoin and Ethereum are also networks. The state of the network is what determines account balances, so how the network operates is very important to users.');
console.log('Btw, you might notice that the public key is different than the address. This is because Ethereum addresses are generated from public, but are not exactly the same thing. Here\'s more info on that process: https://ethereum.stackexchange.com/questions/3542/how-are-ethereum-addresses-generated/3619#3619');

// Signing Messages
console.log('\nSigning Messages');
const messageFromAlice = 'My name is Alice';
console.log('Alice\'s message: ', messageFromAlice);
// we can always use object shorthand notation to access functions on the constructors prototype,
// whether or not the constructor itself originated from class keyword syntactic sugar, or
// the more raw definition using the function keyword, which fundamentally is the same object.
// However, instead of defining functions within the class, we can access the prototype of the
// function and define them on the prototype. You can also go the roundabout way to define
// functions on the prototype of an object defined with the class keyword, but it's easier to
// just use shorthand notation and define them directly withing the scope of the object (function)
// definition. As mentioned, regardless, we seem to have to use object shorthand notation to
// actually access these methods, however they were defined, meaning...
// const alice = new Client()
// const hash = alice.hash(msg)
// as opposed to
// const hash = alice.prototype.hash(msg)
const hashedMessageFromAlice = alice.hash(messageFromAlice);
console.log('Now Alice has hashed her message:', hashedMessageFromAlice);
const signedMessageFromAlice = alice.sign(hashedMessageFromAlice);
console.log('Alice\'s message signature: ', signedMessageFromAlice);

// Verifying Messages
console.log('\nLet\'s help Bob verify Alice\'s message');
console.log('To do this we need to verify the message signature and the message hash to see if they return Alice\'s address');
const isMessageFromAliceAuthentic = bob.verify(signedMessageFromAlice, hashedMessageFromAlice, alice.wallet.address);
console.log('Is the message authentic?');
console.log(isMessageFromAliceAuthentic);

// Note
console.log('\nWhile this may seem like a silly example, message signing and verification allows us to securely connect to websites, download files from servers, and run any public blockchain network!\n');
