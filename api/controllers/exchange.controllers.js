const request = require('request');
var crypto = require('crypto');
var mongoose = require('mongoose');
var Trade = mongoose.model('Trade');
var secret = 'kZtyH/8Hn8Wq82oIl7Lvhrhv/6OGkMWy4oOHQQ+2CBYVef0kJ0uANme7Dg1Dm+NZp4ud4VLjyuYf4wJKPIeaJQ==';
var apikey = '1ba2be427e2c4f03989560441d9ce730';
var passphrase = 'hfllqwfxrh';

//var body;
var createSign = function(time, body) {
    
    var timestamp = time;
    var requestPath = '/orders';
    
    body = JSON.stringify(body);
    
    var method = 'POST';
    
    // create the prehash string by concatenating required parts
    var what = timestamp + method + requestPath + body;
    
    // decode the base64 secret
    var key = Buffer(secret, 'base64');
    
    // create a sha256 hmac with the secret
    var hmac = crypto.createHmac('sha256', key);
    
    // sign the require message with the hmac
    // and finally base64 encode the result
    return hmac.update(what).digest('base64');
}

module.exports.createOrder = function(req, res) {
    debugger;
    request({
        url: 'https://api-public.sandbox.gdax.com/time',
        headers: {
            'User-Agent': 'test'
          
          }
    }, function(err,response, data) {
        var time = JSON.parse(data).epoch;
        console.log(time);
        var orderReqBody = {
            size: req.body.size, // units to buy or sell 
            side: req.body.side,
            type: req.body.type,
            price: req.body.price,
            product_id: req.body.product_id
        }

        var sign = createSign(time, orderReqBody);
        console.log(sign);

        request.post({
            url: 'https://api-public.sandbox.gdax.com/orders',
            json: true,
            headers: {
                'User-Agent': 'test',
                'content-type': 'application/json',
                'CB-ACCESS-KEY': apikey,
                'CB-ACCESS-SIGN': sign,
                'CB-ACCESS-TIMESTAMP': time,
                'CB-ACCESS-PASSPHRASE': passphrase
              },
            body: orderReqBody
        }, function(err, response, body) {
            if(response) {
                res
                .json(response);
            }
            else if(err){
                res
                .status(500)
                .json(err);
            }
            else {
                res
                .json(body);
            }
            
        });
        
    });

    
  };

 module.exports.recordTrnsactions = function(req, res) {
    console.log("record txns");
      Trade
        .create({
            product: req.body.product,
            difference: req.body.difference,
            pctDifference: req.body.pctDifference,
            timestamp: req.body.timestamp,
            exchangeToBuyFrom: req.body.exchangeToBuyFrom,
            buyPrice: req.body.buyPrice,
            exchangeToSellOn: req.body.exchangeToSellOn,
            salePrice: req.body.salePrice
        }, function(err, response) {
          if (err) {
            console.log("Error creating hotel");
            res
              .status(400)
              .json(err);
          } else {
            //console.log("record created!", response);
            res
              .status(201)
              .json(response);
          }
        });
 } 

 module.exports.getRecordedTransactions = function(req, res) {
    console.log('in in in')
    res.json({type: 'success'})
}

module.exports.getGDAX = function(req, res) {
    var productName = req.params.productName;

    request({
        url: 'https://api.gdax.com/products/'  +  productName + '/book',
        json: true,
        headers: {
            'User-Agent': 'test'
          }
    }, function(err, response, body) {
        if(response) {
            res
            .json(response);
        }
        else {
            res
            .status(500)
            .json(err);
        }
        
    });
  };

  module.exports.getBinance = function(req, res) {
    var productName = req.params.productName;

    request({
        url: `https://api.binance.com/api/v3/ticker/price?symbol=${productName}`,
        json: true
    }, function(err, response, body) {
        if(response) {
            res
            .json(response);
        }
        else {
            res
            .status(500)
            .json(err);
        }
    });
  };

  module.exports.getHuobi = function(req, res) {
    var productName = req.params.productName;

    request({
        url: `https://api.huobi.pro/market/detail/merged?symbol=${productName}`,
        json: true
    }, function(err, response, body) {
        if(response) {
            res
            .json(response);
        }
        else {
            res
            .status(500)
            .json(err);
        }
    });
  };