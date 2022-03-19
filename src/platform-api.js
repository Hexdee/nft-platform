const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const port = process.env.PORT || 3000;
require("dotenv").config();
require("./config/database").connect();
const User = require("./model/user");
const Sale = require("./model/sale");
const auth = require("./middleware/auth");
const {mint, buy, listForSale, createUser, getSales} = require('../utils/market');
const { platformId, nftContract} = require("../utils/connect");

const app = express();

app.use(express.json({ limit: "50mb" }));

app.post("/register", async (req, res) => {
  try {
    // Get user input
    const { first_name, last_name, username, email, password } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name && password && username)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUserEmail = await User.findOne({ email });
    const oldUserName = await User.findOne({ username });

    if (oldUserEmail || oldUserName) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      first_name,
      last_name,
      username: username,
      email: email.toString().toLowerCase(),
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    // Get user input
    const { username , password } = req.body;

    // Validate user input
    if (!(username && password)) {
      res.status(400).send("Provide a valid login details");
    }
    // Validate if user exist in our database with email or username

    if (username) {
      const user = await User.findOne({ username });
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, username },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );

        // save user token
        user.token = token;

        // user
        res.status(200).json(user);
      } else {res.status(400).send("incorrect details!")}
    }
    } catch (err) {
      res.status(400).send("Invalid Credentials");
      console.log(err);
    }
});

// Create a new acccount of username.platform.testnet with a balance of $amount
app.post("/create_account", auth, async (req, res) => {
    const balance = req.body.amount;
    const username = req.body.username;
    if(!(balance)){
      res.status(400).send("bad request!");
    }
    // creates a new subaccount 
    try {
      const data = await createUser(username, balance);
      res.status(200).json({msg: "account successfully created!", data});
      await User.findOneAndUpdate({username}, {hasAccount: true});
    } catch (err) {
      res.status(400).json({msg: "acccount already created!", err});
    }
});

// Mints NFT for users
app.post("/mint", auth, async (req, res) => {
    account_id = req.body.username + '.' + platformId,
    token_id = req.body.token_id,
    metadata = req.body.metadata
    if (account_id && token_id && metadata) {
      try{
        const data = await mint(account_id, token_id, metadata);
        nft = {token_id, metadata, owner: account_id}
        res.status(200).json({nft, data});
      } catch(err){
        res.status(400).send({msg: "an error occured!", err});
      }
    } else {
      res.status(400).send("provide the neccessary details!")
    }
});

// Allows user buy NFTs from the platform marketplace
app.post("/market/buy/", auth, async (req, res) => {
    const account_id = req.body.username + '.' + platformId;
    const token_id = req.body.token_id;
    // buy nft with offer() function
    if(token_id && account_id) {
      try {
        await buy(account_id, nftContract, token_id);
        const sale = Sale.findOneAndDelete({token_id})
        
        res.status(200).json({msg: "NFT bought successfully!", sale});
      } catch(err){
       res.status(500).json({msg: "could not buy NFT", err})
      }
    } else {
      res.status(400).send("provide neccessary details!")
    }
});

// Allows user to list their NFTs for sale
app.post("/market/list/", auth, async (req, res) => {
    const account_id = req.body.username + '.' + platformId;
    const token_id = req.body.token_id;
    const price = req.body.listing_price;
    if((account_id && token_id && price)) {
      // call list()
      try{
        const data = await listForSale(account_id, nftContract, token_id, price);
        await Sale.create({
          token_id,
          price,
          owner: account_id,
          activity: {},
        });
        res.status(200).send({msg: "successfully listed token for sale", data}); 
      } catch(err){
          res.status(400).send({msg:"could not list!", err});
      }
    } else {
      res.status(400).send("provide neccesary details!")
    }
});

app.get("/market", async (req, res) => {
  try{
    const sales = await getSales();
    res.status(200).json({msg: "success", date: sales})
  } catch(err) {
    res.status(500).json({msg:"an error occured!", err})
  }
});

// Others
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Route not define",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

app.listen(port, () => {
  console.log(`Server is ready on port ${port}`);
});

module.exports = app;