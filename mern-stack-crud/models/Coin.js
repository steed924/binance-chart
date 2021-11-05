var mongoose = require("mongoose");

var CoinSchema = new mongoose.Schema({
  name: String,
  updated_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Coin", CoinSchema);
