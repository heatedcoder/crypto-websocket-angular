(function() {
    angular.module('exchangeApp')
    
    .controller('exchangeCtrl', ['$scope', 'exchangeService', '$interval', function($scope, exchangeService, $interval) {   
        
        // Scope Variables to display prices in html content
         if(!$scope.gdax) $scope.gdax = {};
         if(!$scope.gdax['btc']) $scope.gdax['btc'] = {};
         if(!$scope.gdax['eth']) $scope.gdax['eth'] = {};

         if(!$scope.binance) $scope.binance = {};
         if(!$scope.binance['btc']) $scope.binance['btc'] = {};
         if(!$scope.binance['eth']) $scope.binance['eth'] = {};

         if(!$scope.huobi) $scope.huobi = {};
         if(!$scope.huobi['btc']) $scope.huobi['btc'] = {};
         if(!$scope.huobi['eth']) $scope.huobi['eth'] = {};

         if(!$scope.diff) $scope.diff = {};
         if(!$scope.diff['btc']) $scope.diff['btc'] = {};
         if(!$scope.diff['eth']) $scope.diff['eth'] = {};

         if(!$scope.diffpct) $scope.diffpct = {};
         if(!$scope.diffpct['btc']) $scope.diffpct['btc'] = {};
         if(!$scope.diffpct['eth']) $scope.diffpct['eth'] = {};

        $scope.defaultThresholdValue = 4.0;
        
        $scope.items = [];
        $scope.orders = [];
        $scope.recordTxnThreshold;

        var getRealTimeGDAX = function() {
            exchangeService.getGDAXExchangeRate('BTC', 'USD').then(function (response) {
                $scope.gdax['btc']['usd'] = response.bids[0][0];
            }, function(error) {
                
            });
    
            exchangeService.getGDAXExchangeRate('ETH', 'USD').then(function (response) {
                $scope.gdax['eth']['usd'] = response.bids[0][0];
            }, function(error) {
                
            });
    
            exchangeService.getGDAXExchangeRate('ETH', 'BTC').then(function (response) {
                $scope.gdax['eth']['btc'] = response.bids[0][0];
            }, function(error) {
                
            });
        }
       
        var getRealTimeBinance = function() {
            exchangeService.getBinanceExchangeRate('BTC', 'USDT').then(function(response) {
                $scope.binance['btc']['usd'] = response.price;
            }, function(error) {
                
            });
    
            exchangeService.getBinanceExchangeRate('ETH', 'USDT').then(function(response) {
                $scope.binance['eth']['usd'] = response.price;
            }, function(error) {
                
            });

            exchangeService.getBinanceExchangeRate('ETH', 'BTC').then(function(response) {
                $scope.binance['eth']['btc'] = response.price;
            }, function(error) {
                
            })
        }
        
        var getRealTimeHUOBI = function() {
            exchangeService.getHuobiExchangeRate('btc', 'usdt').then(function (response) {
                $scope.huobi['btc']['usd'] = response.tick.bid[0];
            }, function(error) {
                
            });
    
            exchangeService.getHuobiExchangeRate('eth', 'usdt').then(function (response) {
                $scope.huobi['eth']['usd'] = response.tick.bid[0];
            }, function(error) {
                
            });
    
            exchangeService.getHuobiExchangeRate('eth', 'btc').then(function (response) {
                $scope.huobi['eth']['btc'] = response.tick.bid[0];
            }, function(error) {
                
            });
        }

        getRealTimeGDAX();
        getRealTimeBinance();
        getRealTimeHUOBI();

        $interval(getRealTimeGDAX, 3000);
        $interval(getRealTimeBinance, 3000);
        $interval(getRealTimeHUOBI, 3000);

        // btc-usd
        var btcusdCallback = function(n, o) {
            var orderType = "limit";
            var orderSide = "";
            var orderSize = "";
            var orderPrice = "";

            var buySize = $scope.buyUnits;
            var buyPrice = "";
            
            var sellSize = $scope.sellUnits;
            var sellPrice = "";

            var sellOnExchange = "";
            var buyFromExchange = "";

            var gdaxPrice = parseFloat($scope.gdax.btc.usd);
            var binancePrice = parseFloat($scope.binance.btc.usd);
            var huobiPrice = parseFloat($scope.huobi.btc.usd);

            var maxprice = Math.max(gdaxPrice, binancePrice, huobiPrice);
            var minprice = Math.min(gdaxPrice, binancePrice, huobiPrice);
            
            if(maxprice && minprice) {
                $scope.diff.btc.usd = maxprice-minprice;
                $scope.diffpct.btc.usd = ((maxprice / minprice) - 1)*100;
            }

            if(gdaxPrice == maxprice) {
                sellOnExchange = "GDAX";
                sellPrice = gdaxPrice;
            }
            else if(binancePrice == maxprice) {
                sellOnExchange = "BINANCE";
                sellPrice = binancePrice;
            }
            else if(huobiPrice == maxprice) {
                sellOnExchange = "HUOBI";
                sellPrice = huobiPrice;
            }
            
            if(gdaxPrice == minprice) {
                buyFromExchange = "GDAX";
                buyPrice = gdaxPrice;
            }
            else if(binancePrice == minprice) {
                buyFromExchange = "BINANCE";
                buyPrice = binancePricePrice;
            }
            else if(huobiPrice == minprice) {
                buyFromExchange = "HUOBI";
                buyPrice = huobiPrice;
            }

            // make db transaction
            if(parseFloat($scope.diffpct.btc.usd) >= parseFloat($scope.recordTxnThreshold)) {
                var req = {
                    product: 'BTC-USD',
                    difference: $scope.diff.btc.usd,
                    pctDifference: $scope.diffpct.btc.usd,
                    timestamp: new Date(),
                    exchangeToBuyFrom: buyFromExchange,
                    buyPrice: buyPrice,
                    exchangeToSellOn: sellOnExchange,
                    salePrice: sellPrice
                }
                exchangeService.recordTransactions(req).then(function(data) {
                    if($scope.items.length>10) {
                        $scope.items.length=10;
                    }
                    $scope.items.unshift(data);
                });
            }

            // When order flag is activated
            if($scope.isOrderInvoked) {
                //debugger;
                
                if($scope.thValue && $scope.buyUnits && $scope.sellUnits) {
                    if(parseFloat($scope.diffpct.btc.usd) >= parseFloat($scope.thValue)) {
                        
                        // Place Order on GDAX
                        if(buyFromExchange=='GDAX' || sellOnExchange=='GDAX'){
                            
                            if(buyFromExchange=='GDAX'){
                                orderSide= 'buy';
                                orderSize= buySize;
                                orderPrice= buyPrice;
                            }
                            else if (sellOnExchange=='GDAX'){
                                orderSide= 'sell';
                                orderSize= sellSize;
                                orderPrice= sellPrice;
                            }
                            
                            var orderReq = {
                                product_id: 'BTC-USD',
                                type: orderType,
                                side: orderSide,
                                size: orderSize,
                                price: orderPrice
                            }

                            exchangeService.createOrder(orderReq)
                            .then(function(data) {
                                $scope.isOrderInvoked = false;
                                var order = {
                                    date: data.created_at,
                                    exchange: 'gdax',
                                    ordertype: orderType,
                                    orderside: orderSide,
                                    units: orderSize,
                                    rate: a,
                                    amount: a*orderSize,
                                    productName: 'BTC-USD'
                                }
                                $scope.orders.push(order);
                                console.log(data);
                            }, function(error) {
                                $scope.isOrderInvoked = false;
                                console.log(error);
                                alert (JSON.stringify(error));
                            })
                        }
                    }
                }
    
            }
            // creating gdax buy-sell order
            
            
        }
        $scope.$watch('gdax.btc.usd', btcusdCallback);
        $scope.$watch('binance.btc.usd', btcusdCallback);

        //eth-usd
        var ethusdCallback = function(n, o) {
            var gdaxPrice = parseFloat($scope.gdax.eth.usd);
            var binancePrice = parseFloat($scope.binance.eth.usd);
            var huobiPrice = parseFloat($scope.huobi.eth.usd);

            var maxprice = Math.max(gdaxPrice, binancePrice, huobiPrice);
            var minprice = Math.min(gdaxPrice, binancePrice, huobiPrice);
            
            var sellOnExchange = "";
            var sellPrice = "";

            var buyPrice = "";
            var buyFromExchange = "";

            if(maxprice && minprice) {
                $scope.diff.eth.usd = maxprice-minprice;
                $scope.diffpct.eth.usd = ((maxprice / minprice) - 1)*100;
            }

            if(gdaxPrice == maxprice) {
                sellOnExchange = "GDAX";
                sellPrice = gdaxPrice;
            }
            else if(binancePrice == maxprice) {
                sellOnExchange = "BINANCE";
                sellPrice = binancePrice;
            }
            else if(huobiPrice == maxprice) {
                sellOnExchange = "HUOBI";
                sellPrice = huobiPrice;
            }
            
            if(gdaxPrice == minprice) {
                buyFromExchange = "GDAX";
                buyPrice = gdaxPrice;
            }
            else if(binancePrice == minprice) {
                buyFromExchange = "BINANCE";
                buyPrice = binancePricePrice;
            }
            else if(huobiPrice == minprice) {
                buyFromExchange = "HUOBI";
                buyPrice = huobiPrice;
            }
            // make db transaction
            if(parseFloat($scope.diffpct.eth.usd) >= parseFloat($scope.recordTxnThreshold)) {
                var req = {
                    product: 'ETH-USD',
                    difference: $scope.diff.eth.usd,
                    pctDifference: $scope.diffpct.eth.usd,
                    timestamp: new Date(),
                    exchangeToBuyFrom: buyFromExchange,
                    buyPrice: buyPrice,
                    exchangeToSellOn: sellOnExchange,
                    salePrice: sellPrice
                }
                exchangeService.recordTransactions(req).then(function(data) {
                    $scope.items.push(data);
                });
            }
        }

        $scope.$watch('gdax.eth.usd', ethusdCallback);
        $scope.$watch('binance.eth.usd', ethusdCallback);

        //eth-btc
        var ethbtcCallback = function(n, o) {
            var gdaxPrice = parseFloat($scope.gdax.eth.btc);
            var binancePrice = parseFloat($scope.binance.eth.btc);
            var huobiPrice = parseFloat($scope.huobi.eth.btc);

            var maxprice = Math.max(gdaxPrice, binancePrice, huobiPrice);
            var minprice = Math.min(gdaxPrice, binancePrice, huobiPrice);
            
            if(maxprice && minprice) {
                $scope.diff.eth.btc = maxprice-minprice;
                $scope.diffpct.eth.btc = ((maxprice / minprice) - 1)*100;
            }
        }

        $scope.$watch('gdax.eth.btc', ethbtcCallback);
        $scope.$watch('binance.eth.btc', ethbtcCallback);

        $scope.$watch('isOrderInvoked', function() {
            if($scope.isOrderInvoked) {
                $scope.invokeOrderText = "You order is waiting to be invoked";
            }
            else {
                $scope.invokeOrderText = "Place Order";
            }
        })
    }]);
})()