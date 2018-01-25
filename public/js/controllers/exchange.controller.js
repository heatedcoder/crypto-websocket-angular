(function() {
    angular.module('exchangeApp')
    
    .controller('exchangeCtrl', ['$scope', 'exchangeService', function($scope, exchangeService) {   
        
         if(!$scope.gdax) $scope.gdax = {};
         if(!$scope.gdax['btc']) $scope.gdax['btc'] = {};
         if(!$scope.gdax['eth']) $scope.gdax['eth'] = {};

         if(!$scope.binance) $scope.binance = {};
         if(!$scope.binance['btc']) $scope.binance['btc'] = {};
         if(!$scope.binance['eth']) $scope.binance['eth'] = {};

         if(!$scope.diff) $scope.diff = {};
         if(!$scope.diff['btc']) $scope.diff['btc'] = {};
         if(!$scope.diff['eth']) $scope.diff['eth'] = {};

         if(!$scope.diffpct) $scope.diffpct = {};
         if(!$scope.diffpct['btc']) $scope.diffpct['btc'] = {};
         if(!$scope.diffpct['eth']) $scope.diffpct['eth'] = {};

        //  $scope.thresholdValue = 0.2;
        //  $scope.unitsToBuy = 0.5;
        //  $scope.unitsToSell = 0.5;
         $scope.items = [];
         $scope.orders = [];
         $scope.recordTxnThreshold;

        var wsBinanceBTCUSD = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
        var wsBinanceETHUSD = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@ticker');
        var wsBinanceETHBTC = new WebSocket('wss://stream.binance.com:9443/ws/ethbtc@ticker');
        var wsGDAX = new WebSocket('wss://ws-feed.gdax.com/'); 
        //var wsGDAX = new WebSocket('wss://ws-feed-public.sandbox.gdax.com/');
        var GDAXRequest = {
            "type": "subscribe",
            "product_ids": [
                "BTC-USD",
                "ETH-USD",
                "ETH-BTC"
            ],
            "channels": [
                "ticker"
            ]
        }

        $scope.getBinanceExchangeRate = function(ws) {
            ws.onopen = function () {
                // sending a send event to websocket server
                ws.send('');
            }
            // event emmited when receiving message 
            ws.onmessage = function (ev) {
                if(JSON.parse(ev.data).s == 'BTCUSDT') {
                    $scope.binance['btc']['usd'] = JSON.parse(ev.data).c ;
                }
                else if(JSON.parse(ev.data).s == 'ETHUSDT') {
                    $scope.binance['eth']['usd'] = JSON.parse(ev.data).c ;
                }
                else if(JSON.parse(ev.data).s == 'ETHBTC') {
                    $scope.binance['eth']['btc'] = JSON.parse(ev.data).c ;
                }
                $scope.$apply();
            }
        }

        $scope.getGDAXExchangeRate = function(ws, request) {
            ws.onopen = function () {
                // sending a send event to websocket server
                ws.send(JSON.stringify(request));
            }
            // event emmited when receiving message 
            ws.onmessage = function (ev) {
                if(ev && ev.data && JSON.parse(ev.data).product_id == "BTC-USD") {
                    $scope.gdax['btc']['usd'] = JSON.parse(ev.data).price;
                }
                else if(ev && ev.data && JSON.parse(ev.data).product_id == "ETH-USD") {
                    $scope.gdax['eth']['usd'] = JSON.parse(ev.data).price;
                }
                else if(ev && ev.data && JSON.parse(ev.data).product_id == "ETH-BTC") {
                    $scope.gdax['eth']['btc'] = JSON.parse(ev.data).price;
                }
                $scope.$apply();   
            }
        }
        $scope.getBinanceExchangeRate(wsBinanceBTCUSD);
        $scope.getBinanceExchangeRate(wsBinanceETHUSD); 
        $scope.getBinanceExchangeRate(wsBinanceETHBTC);
        $scope.getGDAXExchangeRate(wsGDAX, GDAXRequest);

        // btc-usd
        var btcusdCallback = function(n, o) {
            var orderType = "";
            var size = "";
            var a = parseFloat($scope.gdax.btc.usd);
            var b = parseFloat($scope.binance.btc.usd);
            if(a > b) {
                $scope.diff.btc.usd = a-b;
                $scope.diffpct.btc.usd = ((a - b)/a)*100;
                orderType = "sell";
                //exchangeName = "gdax";
                size = $scope.sellUnits;
            }
            else {
                $scope.diff.btc.usd = b-a;
                $scope.diffpct.btc.usd = ((b - a)/b)*100;
                orderType = "buy";
                size = $scope.buyUnits;
                //exchangeName = "gdax";
            }
            // make db transaction
            if(parseFloat($scope.diffpct.btc.usd) >= parseFloat($scope.recordTxnThreshold)) {
                var req = {
                    product: 'BTC-USD',
                    difference: $scope.diff.btc.usd,
                    pctDifference: $scope.diffpct.btc.usd,
                    timestamp: new Date(),
                    exchangeDetails:  [{
                        exchangeName: 'gdax',
                        price: a
                    }, {
                        exchangeName: 'binance',
                        price: b
                    }]
                }
                exchangeService.recordTransactions(req).then(function(data) {
                    $scope.items.push(data);
                });
            }
            if($scope.isOrderInvoked) {
                //debugger;
                
                if($scope.thValue && $scope.buyUnits && $scope.sellUnits) {
                    if(parseFloat($scope.diffpct.btc.usd) >= parseFloat($scope.thValue)) {
                        
                        // params - 
                        //orderType = buy|sell
                        var orderReq = {
                            product_id: 'BTC-USD',
                            type: 'market',
                            side: orderType,
                            size: size
    
                        }
                        exchangeService.createOrder(orderReq)
                        .then(function(data) {
                            $scope.isOrderInvoked = false;
                            var order = {
                                date: data.created_at,
                                exchange: 'gdax',
                                orderType: orderType,
                                units: size,
                                rate: a,
                                amount: a*size,
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
            // creating gdax buy-sell order
            
            
        }
        $scope.$watch('gdax.btc.usd', btcusdCallback);
        $scope.$watch('binance.btc.usd', btcusdCallback);

        //eth-usd
        var ethusdCallback = function(n, o) {
            var a = parseFloat($scope.gdax.eth.usd);
            var b = parseFloat($scope.binance.eth.usd);
            if(a > b) {
                $scope.diff.eth.usd = a-b;
                $scope.diffpct.eth.usd = ((a - b)/a)*100;
            }
            else {
                $scope.diff.eth.usd = b-a;
                $scope.diffpct.eth.usd = ((b - a)/b)*100;
            }
        }
        $scope.$watch('gdax.eth.usd', ethusdCallback);
        $scope.$watch('binance.eth.usd', ethusdCallback);

        //eth-btc
        var ethbtcCallback = function(n, o) {
            var a = parseFloat($scope.gdax.eth.btc);
            var b = parseFloat($scope.binance.eth.btc);
            if(a > b) {
                $scope.diff.eth.btc = a-b;
                $scope.diffpct.eth.btc = ((a - b)/a)*100;
            }
            else {
                $scope.diff.eth.btc = b-a;
                $scope.diffpct.eth.btc = ((b - a)/b)*100;
            }
        }
        $scope.$watch('gdax.eth.btc', ethbtcCallback);
        $scope.$watch('binance.eth.btc', ethbtcCallback);

        $scope.$watch('isOrderInvoked', function() {
            if($scope.isOrderInvoked) {
                $scope.invokeOrderText = "You order is waiting to be invoked";
            }
            else {
                $scope.invokeOrderText = "Submit an Order";
            }
        })
    }]);
})()