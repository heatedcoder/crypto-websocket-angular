(function() {
    angular.module('exchangeApp')
    
    .controller('exchangeCtrl', ['$scope', function($scope) {   
        
         if(!$scope.gdax) $scope.gdax = {};
         if(!$scope.gdax['btc']) $scope.gdax['btc'] = {};
         if(!$scope.gdax['eth']) $scope.gdax['eth'] = {};

         if(!$scope.binance) $scope.binance = {};
         if(!$scope.binance['btc']) $scope.binance['btc'] = {};
         if(!$scope.binance['eth']) $scope.binance['eth'] = {};

         if(!$scope.diff) $scope.diff = {};
         if(!$scope.diff['btc']) $scope.diff['btc'] = {};
         if(!$scope.diff['eth']) $scope.diff['eth'] = {};

        var wsBinanceBTCUSD = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
        var wsBinanceETHUSD = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@ticker');
        var wsBinanceETHBTC = new WebSocket('wss://stream.binance.com:9443/ws/ethbtc@ticker');
        var wsGDAX = new WebSocket('wss://ws-feed.gdax.com/');
        
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
            var a = parseFloat($scope.gdax.btc.usd);
            var b = parseFloat($scope.binance.btc.usd);
            if(a > b) {
                $scope.diff.btc.usd = ((a - b)/a)*100;
            }
            else {
                $scope.diff.btc.usd = ((b - a)/b)*100;
            }
        }
        $scope.$watch('gdax.btc.usd', btcusdCallback);
        $scope.$watch('binance.btc.usd', btcusdCallback);

        //eth-usd
        var ethusdCallback = function(n, o) {
            var a = parseFloat($scope.gdax.eth.usd);
            var b = parseFloat($scope.binance.eth.usd);
            if(a > b) {
                $scope.diff.eth.usd = ((a - b)/a)*100;
            }
            else {
                $scope.diff.eth.usd = ((b - a)/b)*100;
            }
        }
        $scope.$watch('gdax.eth.usd', ethusdCallback);
        $scope.$watch('binance.eth.usd', ethusdCallback);

        //eth-btc
        var ethbtcCallback = function(n, o) {
            var a = parseFloat($scope.gdax.eth.btc);
            var b = parseFloat($scope.binance.eth.btc);
            if(a > b) {
                $scope.diff.eth.btc = ((a - b)/a)*100;
            }
            else {
                $scope.diff.eth.btc = ((b - a)/b)*100;
            }
        }
        $scope.$watch('gdax.eth.btc', ethbtcCallback);
        $scope.$watch('binance.eth.btc', ethbtcCallback);
    }]);
})()