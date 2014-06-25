'use strict';

var app = angular.module('gopheroteca', ['ngRoute', 'restangular']);

app.controller('ListCtrl', ['$scope', 'REST', 'Log',
    function($scope, REST, Log) {
        var gophers = REST.all('api/gopher').getList();
        gophers.then(null, Log.error);

        $scope.gophers = gophers.$object;
        $scope.newGopher = REST.one('api/gopher');

        $scope.addGopher = function() {
            $scope.newGopher.post().then(function(list) {
                $scope.gophers.push(list);
                $scope.newGopher = REST.one('api/gopher');
            }, Log.error);
        };
    }
]);

app.service('Log', ['$timeout',
    function($timeout) {
        var svc = {
            logs: [],
            error: function(msg) {
                svc.logs.push((new Date()).toTimeString() + ' ' + msg.data);
                $timeout(function() {
                    svc.logs.shift();
                }, 3000);
            },
        };
        return svc;
    }
]);

app.controller('LogCtrl', ['$scope', 'Log',
    function($scope, Log) {
        $scope.logs = Log.logs;
    }
]);

app.service('REST', ['Restangular',
    function(Restangular) {
        return Restangular.withConfig(function(config) {
            // Our app uses 'ID' as identifier instead of 'id'.
            config.setRestangularFields({
                id: 'ID'
            });
            // Restangular sends DELETE ops with payload.
            // This fixes the issue.
            config.setRequestInterceptor(function(elem, op) {
                if (op == "remove") return "";
                return elem;
            })
        });
    }
]);

app.service('Auth', ['REST', 'Log',
    function(REST, Log) {
        return REST.one('api', 'auth').get().$object;
    }
]);