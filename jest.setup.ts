import { Wallet } from 'ethers';

const wallet = Wallet.createRandom();

process.env.SMART_CONTRACT_ADDRESS = '0x1234';
process.env.PRIVATE_KEY = wallet.privateKey;
process.env.ALCHEMY_API_KEY = 'ThIsIsNoTtHeAcTuAlKeY';
