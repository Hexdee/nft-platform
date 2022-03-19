const { KeyPair } = require('near-api-js');
const { parseNearAmount } = require('near-api-js/lib/utils/format');
const{ connectAccount, platformId, loadContract, nftContract, config, keyStore, marketPlace } = require('./connect');


const viewMethods = ["nft_token", "nft_is_approved", "get_supply_sales", "get_supply_by_owner_id", "get_supply_by_nft_contract_id", 
"get_sale", "get_sales_by_owner_id", "get_sales_by_nft_contract_id"];
const changeMethods =["nft_mint", "nft_approve", "new", "storage_deposit", "storage_withdraw", "remove_sale",
"update_price", "offer",];
methods = {viewMethods, changeMethods};

async function createUser(username, amount) {
    const account_id = username + '.' + platformId
    const account = await connectAccount(platformId);
    const keyPair = KeyPair.fromRandom("ed25519");
    const publicKey = keyPair.publicKey.toString();
    keyStore.setKey(config.networkId, account_id, keyPair); // Add keypair to path
    
    const receipt = await account.createAccount(
    account_id, // New account name
    publicKey, // public key for new account
    parseNearAmount(amount) // initial balance for new account in yoctoNEAR
    );
    return receipt;
}

async function mint(caller_account_id, token_id, metadata) {
    const account = await connectAccount(caller_account_id);
    const nft_contract = await loadContract(account, nftContract, methods);
    
    const data = await nft_contract.nft_mint(
        { 
            args: { 
            token_id,
            metadata,
            receiver_id: caller_account_id 
            },
            amount: parseNearAmount("0.1")
        });
    return data;
    
}

async function buy(caller_account_id, nft_contract_id, token_id) {
    const caller_account = await connectAccount(caller_account_id);
    const market = await loadContract(caller_account, marketPlace, methods);
    // Get sale condition
    const sale = await market.get_sale({
        nft_contract_token: nft_contract_id + "." + token_id
    })

    // Buy
    await market.offer(
        {
            args: {
                nft_contract_id,
                token_id,
            },
            amount: sale.sale_conditions,
            gas: 300000000000000
        }); 
    // Return new NFT data
    const nft_contract = await loadContract(caller_account, nft_contract_id, methods);
    const nft = await nft_contract.nft_token({token_id});
    return nft;
}
    
async function listForSale(caller_account_id, nft_contract_id, token_id, price) {
    const caller_account = await connectAccount(caller_account_id);
    const market = await loadContract(caller_account, marketPlace, methods);
    // Storage deposit is needed before listing
    await market.storage_deposit(
        {
            args: {},
            amount: parseNearAmount("0.01")
            //"10000000000000000000000000"
        });
        
    const nft_contract = await loadContract(caller_account, nft_contract_id, methods);
    await nft_contract.nft_approve(
        {
            args: {
                token_id: token_id,
                account_id: marketPlace,
                msg: JSON.stringify( {
                    sale_conditions: parseNearAmount(price)
                })
            },
            amount: parseNearAmount("0.1"),
            //"100000000000000000000000000"
        });
    const sale = await market.get_sale({
    nft_contract_token: nft_contract_id + "." + token_id
    })
    return sale;
}

async function getSales() {
    const account = await connectAccount(platformId);
    const market = await loadContract(account, marketPlace, methods);
    const sales = await market.get_sales_by_nft_contract_id({nft_contract_id: nftContract, from_index: "0", limit: 500});
    return sales;
}

module.exports =  {mint, buy, listForSale, createUser, getSales}
