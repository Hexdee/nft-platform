const { keyStores, connect, Contract } = require("near-api-js");
const { homedir } = require("os");
const platformId = process.env.platformId //"plat_form.testnet"
const nftContract = "nft." + platformId;
const marketPlace = "market." + platformId;

const CREDENTIALS_DIR = ".near-credentials";
const credentialsPath = require("path").join(homedir(), CREDENTIALS_DIR);
const keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

const config = {
    networkId: "testnet",
    keyStore,
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
};

async function connectAccount(accountId) {
    const near = await connect(config);
    const account = await near.account(accountId);
    return account;
}

async function loadContract(account, contractId, contractMethods) {
    const contract = new Contract(
    account, // the account object that is connecting
    contractId,
    contractMethods
    );
    return contract;
}

module.exports = {connectAccount, keyStore , config, platformId, loadContract, nftContract, marketPlace};