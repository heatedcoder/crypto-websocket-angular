var express = require('express');
var router = express.Router();

var ctrlExchange = require('../controllers/exchange.controllers.js');

// GDAX routes
router
  .route('/createOrder')
  .post(ctrlExchange.createOrder);

router  
  .route('/recordTxn')
  .post(ctrlExchange.recordTrnsactions);
  
router  
  .route('/getRecordedTxns')
  .get(ctrlExchange.getRecordedTransactions);

  // GDAX routes
router
  .route('/gdax/:productName')
  .get(ctrlExchange.getGDAX);

router
  .route('/binance/:productName')
  .get(ctrlExchange.getBinance);

router
  .route('/huobi/:productName')
  .get(ctrlExchange.getHuobi);

module.exports = router;
