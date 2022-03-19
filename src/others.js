const express = require("express");
const { platformId, platformNftContract } = require("../utils/connect");
const auth = require('./middleware/auth')
const{ buy, listForSale } = require("./platform");

const app = express();
app.use(express.json());

app.post("/register", (req, res) => {
    const username = req.body.username;
    const balance = req.body.amount;
    // creates a new User
    const msg = createUser(username, balance);
    if (msg.success == 'true') {
        res.status(200).json(msg.user)
    }
    else {
        res.status(500).send("account exist!")
    }
    // Implement account exist logic
    // Implement unsupported username 
})


app.post("/market/buy/", (req, res) => {
    const account_id = req.body.username + platformId;
    const token_id = req.body.token_id;
    // buy nft with offer() function
    const msg = buy(account_id, platformNftContract, token_id);
    // return sucess
    if(msg.success == success) {
        // To do
        // Remove sale from database
        res.status(200).json(msg.sale);
    } else{
        res.status(500).send("not enough balance!")
    }
    // or failure (with reason)
})

app.post("/market/list/:tokenId", (req, res) => {
    const account_Id = req.body.account_Id;
    const nft_contract_id = req.body.nft_contract_id;
    const token_id = req.body.token_id;
    const price = req.body.listing_price;
    // call list()
    const msg = listForSale(account_Id, nft_contract, token_id, price);
    if(msg.success == true) {
        // To do
        // Add to database
        res.send(200).json(msg.sale)
    } else {
        res.status(500).send("could not list")
    }
})

app.listen(3000, () => 
console.log("Server is ready on port 3000"));
