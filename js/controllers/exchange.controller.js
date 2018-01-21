(function() {
    angular.module('exchangeApp')
    
    .controller('exchangeCtrl', ['$scope', function($scope) {   
        
         if(!$scope.gdax) $scope.gdax = {};
         if(!$scope.gdax['btc']) $scope.gdax['btc'] = {};
         if(!$scope.gdax['eth']) $scope.gdax['eth'] = {};

         if(!$scope.binance) $scope.binance = {};
         if(!$scope.binance['btc']) $scope.binance['btc'] = {};
         if(!$scope.binance['eth']) $scope.binance['eth'] = {};

        var wsBinanceBTCUSD = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
        var wsBinanceETHUSD = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@ticker');
        var wsGDAX = new WebSocket('wss://ws-feed.gdax.com/');
        
        var GDAXRequest = {
            "type": "subscribe",
            "product_ids": [
                "BTC-USD",
                "BTC-EUR",
                "ETH-USD",
                "ETH-EUR"
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
                else if(ev && ev.data && JSON.parse(ev.data).product_id == "BTC-EUR") {
                    $scope.gdax['btc']['eur'] = JSON.parse(ev.data).price;
                }
                else if(ev && ev.data && JSON.parse(ev.data).product_id == "ETH-USD") {
                    $scope.gdax['eth']['usd'] = JSON.parse(ev.data).price;
                }
                else if(ev && ev.data && JSON.parse(ev.data).product_id == "ETH-EUR") {
                    $scope.gdax['eth']['eur'] = JSON.parse(ev.data).price;
                }
                $scope.$apply();   
            }
        }
        $scope.getBinanceExchangeRate(wsBinanceBTCUSD);
        $scope.getBinanceExchangeRate(wsBinanceETHUSD);
        $scope.getGDAXExchangeRate(wsGDAX, GDAXRequest);

    }]);
})()