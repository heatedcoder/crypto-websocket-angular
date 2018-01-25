var mongoose = require('mongoose');

var tradeSchema = new mongoose.Schema({
    product: String,
    difference: Number,
    pctDifference: Number,
    timestamp: Date,
    exchangeDetails:  [{
        exchangeName: String,
        price: Number
    }, {
        exchangeName: String,
        price: Number
    }]
});

mongoose.model('Trade', tradeSchema);