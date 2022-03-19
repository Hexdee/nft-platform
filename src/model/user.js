const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: { type: String, default: null},
  last_name: { type: String, default: null },
  username: {type: String, unique: true},
  email: { type: String, unique: true },
  password: { type: String },
  token: {type: String},
  hasAccount: {type: Boolean, default: false}
});

module.exports = mongoose.model("user", userSchema);