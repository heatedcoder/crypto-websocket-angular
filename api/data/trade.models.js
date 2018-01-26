var mongoose = require('mongoose');

var tradeSchema = new mongoose.Schema({
    product: String,
    difference: Number,
    pctDifference: Number,
    timestamp: Date,
    exchangeToBuyFrom: String,
    buyPrice: Number,
    exchangeToSellOn: String,
    salePrice: Number
});

mongoose.model('Trade', tradeSchema);