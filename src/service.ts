/*
* This bot would be better in Elixir, but I'm using Typesscript for conveying the idea
* Also Elixir makes it harder to deploy and libraries for anything web3 related are not as mature
* or convenient as in Typescript.
* In a production environment where development time is not a concern and the
* bot is expected to be fault tolerant, I would use Elixir.
*
* Additionally I would recommend updating the smart contract to use indexed
* events for the Ping and Pong events. This would make it easier to filter.
*/

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const smartContractAddress = process.env.SMART_CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;
const alchemyApiKey = process.env.ALCHEMY_API_KEY;

if (!smartContractAddress || !privateKey) {
  console.error('Please set SMART_CONTRACT_ADDRESS, and PRIVATE_KEY in the .env file');
  process.exit(1);
}

// const provider = new ethers.InfuraProvider('goerli');
// create a local provider
const provider = new ethers.AlchemyProvider('goerli', alchemyApiKey);
const wallet = new ethers.Wallet(privateKey, provider);

const abi = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[],"name":"Ping","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"txHash","type":"bytes32"}],"name":"Pong","type":"event"},
  {"inputs":[],"name":"ping","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"pinger","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"bytes32","name":"_txHash","type":"bytes32"}],"name":"pong","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

const contract = new ethers.Contract(smartContractAddress, abi, provider);


async function fetchPastPingEvents(contract: ethers.Contract, fromBlock: number): Promise<void> {
  const currentBlockNumber = await provider.getBlockNumber();
  const pingFilter = contract.filters.Ping();

  const pastPings = await contract.queryFilter(pingFilter, fromBlock, currentBlockNumber);
  const filterPong = contract.filters.Pong();
  const pastPongs = await contract.queryFilter(filterPong, fromBlock, currentBlockNumber);


  for (const pingEvent of pastPings) {
    console.log('Ping event:', pingEvent.transactionHash, pingEvent.blockNumber);

    const pongExists = pastPongs.some((pongEvent) => {
      return pongEvent.data === pingEvent.transactionHash;
    });
    if (pongExists) {
      console.log('Pong found for ping:', pingEvent.transactionHash, pingEvent.blockNumber);
    } else {
      console.warn('Pong not found for ping:', pingEvent.transactionHash);
      await sendPongWithRetry(pingEvent.transactionHash, 3);
    }
  }
}

async function main() {

  // get up to date
  console.log('Fetching past events...');
  await fetchPastPingEvents(contract, 8823865);
  // listen for new events
  console.log('Listening for events...');
  contract.on('Ping', async (eventPayload: ethers.ContractEventPayload) => {
    console.log('Event received: Ping');
    console.log('Blocknumber:', eventPayload.log.blockNumber);
    console.log('TransactionHash:', eventPayload.log.transactionHash);
    await sendPongWithRetry(eventPayload.log.transactionHash, 3);
  });
}
async function sendPongWithRetry(txHash: ethers.BytesLike, retries: number): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(`Attempt ${attempt}`);
    const success = await sendPong(txHash);
    if (success) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  console.error('All attempts to send pong have failed');
  return false;
}
async function sendPong(txHash: ethers.BytesLike): Promise<boolean> {
  try {
    const tx = await wallet.sendTransaction({
      to: smartContractAddress,
      data: contract.interface.encodeFunctionData('pong', [txHash]),
    });
    console.log('Pong sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send pong:', error);
    return false;
  }
}

main().catch((error) => {
  console.error('Error:', error);
});
process.stdin.resume();
