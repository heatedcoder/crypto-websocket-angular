const request = require('request');
var crypto = require('crypto');
var mongoose = require('mongoose');
var Trade = mongoose.model('Trade');

//var body;
var createSign = function(time, body) {
    var secret = 'rnqk8/lpN2tidlJHDamK30e34cAnYX9c0OrRFXk4A4+WydgqCR0wdsBC0m9Jyc/GqzFhohVfsdlpQWfGPrc6kA==';
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
            product_id: req.body.product_id
        }

        var sign = createSign(time, orderReqBody);
        console.log(sign);
        // var orderReqBody = {
        //     size: '0.1', // units to buy or sell 
        //     side: 'sell',
        //     type: 'market',
        //     product_id: 'BTC-USD'
        // }

        

        request.post({
            url: 'https://api-public.sandbox.gdax.com/orders',
            json: true,
            headers: {
                'User-Agent': 'test',
                'content-type': 'application/json',
                'CB-ACCESS-KEY': '537f45875e2d7307b514aa7adf53237b',
                'CB-ACCESS-SIGN': sign,
                'CB-ACCESS-TIMESTAMP': time,
                'CB-ACCESS-PASSPHRASE': '5lzbkclycaf'
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
            exchangeDetails:  [{
                exchangeName: req.body.exchangeDetails[0].exchangeName,
                price: req.body.exchangeDetails[0].price
            }, {
                exchangeName: req.body.exchangeDetails[1].exchangeName,
                price: req.body.exchangeDetails[1].price
            }]
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