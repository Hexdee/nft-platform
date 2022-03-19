const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
    token_id: {type: String, unique: true, required: true},
    //metadata: {type: Object, required: true },
    price: {type: String, default: null, require: true},
    owner: {type: String, default: null, require: true},
    activity: {type: Object},
});

module.exports = mongoose.model("sale", saleSchema);