(function() {
    angular.module('exchangeApp').
    
    service('exchangeService', ['$http', '$q', function($http, $q) {
        return {
            createOrder: createOrder,
            recordTransactions: recordTransactions,
            getGDAXExchangeRate: getGDAXExchangeRate,
            getBinanceExchangeRate: getBinanceExchangeRate,
            getHuobiExchangeRate: getHuobiExchangeRate
        }
        function createOrder(orderReq) {
            var deferred = $q.defer();
            
            $http.post('/api/createOrder', orderReq)
            .then(function(response) {
                if(response && response.data) {
                    if(response.data.statusCode ==200) {
                        deferred.resolve(response.data.body);
                    }
                    else {
                        deferred.reject(response.data.body);
                    }
                }
                deferred.reject("There is some error. Refresh and try again.");
                
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }
       
        function recordTransactions(request) {
            var deferred = $q.defer();
            $http.post('/api/recordTxn', request)
            .then(function(response) {
               deferred.resolve(response.data);
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;

        }

        function getGDAXExchangeRate(fromCurr, toCurr) {
            var deferred = $q.defer();
            var productName = `${fromCurr}-${toCurr}`;
            $http({
                method: 'GET',
                url: `/api/gdax/${productName}`
            }).then(function(response) {
                if(response && response.data && response.data.statusCode==200) {
                    deferred.resolve(response.data.body);
                }
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }
        
        function getBinanceExchangeRate(fromCurr, toCurr) {
            var deferred = $q.defer();
            var productName = `${fromCurr}${toCurr}`;
            $http({
                method: 'GET',
                url: `/api/binance/${productName}`
            }).then(function(response) {
                if(response && response.data && response.data.statusCode==200) {
                    deferred.resolve(response.data.body);
                }
                deferred.reject("Error");
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }
        
        function getHuobiExchangeRate(fromCurr, toCurr) {
            var deferred = $q.defer();
            var productName = `${fromCurr}${toCurr}`;
            $http({
                method: 'GET',
                url: `/api/huobi/${productName}`
            }).then(function(response) {
                if(response && response.data && response.data.statusCode==200) {
                    deferred.resolve(response.data.body);
                }
                deferred.reject("Error");
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }
    }]);
})()

