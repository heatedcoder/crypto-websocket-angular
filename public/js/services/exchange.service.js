(function() {
    angular.module('exchangeApp').
    
    service('exchangeService', ['$http', '$q', function($http, $q) {
        return {
            createOrder: createOrder,
            recordTransactions: recordTransactions
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
       
        
    }]);
})()

