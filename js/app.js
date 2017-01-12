/**
 * Created by bogdan.voicu on 12/28/2016.
 */
var app = angular.module('AdminApp', ['ngMap','ui.router','ui.bootstrap', 'chart.js', 'Directives']);

// ================ Logica la INITIALIZAREA aplicatiei/refresh ===================
//app.run(function($rootScope, $state, $firebaseAuth, $http){
//    // Salvarea datelor utilizatorului cand se schimba starea AUTENTIFICARII FIREBASE
//    $firebaseAuth().$onAuthStateChanged(function(user) {
//        if(user){
//            $rootScope.user = user;
//            $http.get(rootUrl + '/userProps/'+ user.id).success(function(data){
//                $rootScope.user.userProps = data;
//            });
//            $state.go('app.dashboard')
//        } else {
//            $rootScope.user = null;
//        }
//    });
//
//    // RUTA in cazul in care initializezi aplicatia cu altceva in afara de Login sau Register
//    $rootScope.on('$stateChangeStart', function(event, args) {
//        if(args.name !== 'login' &&  args.name !== 'register'&& !$rootScope.user) {
//            $state.go('login');
//        }
//    })
//});

app.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise("/dashboard");
    $stateProvider
        .state('dashboard', {
            url: "/dashboard",
            templateUrl: "templates/dashboard.html",
            controller: 'MainCtrl'
        })
        .state('map', {
            url: "/map",
            templateUrl: "templates/map.html",
            controller: 'MapCtrl'
        })
        .state('reports', {
            url: "/reports",
            templateUrl: "templates/reports.html",
            controller: 'ReportsCtrl'
        })
        .state("login",{
            url:"/login",
            templateUrl:"templates/login.html",
            controller: 'AuhCtrl'
        })
        .state("register",{
            url:"/register",
            templateUrl:"templates/register.html",
        });

    // =================== RUTE ======================
    //$urlRouterProvider.otherwise("/user/login");
    //$stateProvider
    //    .state('user', {
    //        url: '/user',
    //        abstract: true,
    //        views: {
    //            'login@user': {
    //                templateUrl: 'templates/login.html'
    //            },
    //            'register@user': {
    //                templateUrl: 'templates/register.html'
    //            },
    //            'settings@user': {}
    //        },
    //        controller: 'UserCtrl'
    //    })
    //    .state('app', {
    //        url: '/',
    //        abstract: true,
    //        templateUrl: 'templates/menu.html'
    //        views: {
    //            'dashboard@app': {
    //                templateUrl: 'templates/dashboard.html',
    //                controller: 'MainCtrl'
    //            },
    //            'map@app': {
    //                templateUrl: 'templates/map.html',
    //                controller: 'MapCtrl'
    //            },
    //            'reports@app': {
    //                templateUrl: 'templates/reports.html',
    //                controller: 'ReportsCtrl'
    //            }
    //        }
    //    });
});



app
    .controller('MapCtrl', function($scope, NgMap, NavigatorGeolocation){
        $scope.nightMapStyle = nightMap;
        //NgMap.getMap('argosMap')
        //    .then(function(map) {
        //    console.log('NgMap.getMap in MapCtrl', map);
        //    });
        $scope.onClick = function() {
            alert('map clicked');
        };
        NavigatorGeolocation.getCurrentPosition()
            .then(function(position) {
                var lat = position.coords.latitude, lng = position.coords.longitude;
                $scope.myPos = [lat, lng];
                console.log($scope.myPos);
            });
        $scope.googleMapsUrl = 'https://maps.google.com/maps/api/js?key=AIzaSyBWkYuMI3tLSHzTV6kj9gzTX8_OvDlBIc4&libraries=places';

        $scope.showPredicitions = false;

        $scope.toggleSearch = function( location ){
            $scope.showPredicitions = true;
            var displaySuggestions = function(predictions, status) {
                if (status != google.maps.places.PlacesServiceStatus.OK) {
                    console.log(status);
                    return;
                }
                $scope.autocompletePredictions = predictions;

                console.log($scope.autocompletePredictions);
            };
            var service = new google.maps.places.AutocompleteService();
            service.getPlacePredictions({ input: location+"", componentRestrictions: {country: 'ro'} }, displaySuggestions);
        };

        $scope.goToPrediction = function(placeId) {
            var request = {
                placeId: placeId
            };
            NgMap.getMap('argosMap')
                .then(function(map) {
                    function callback(place, status) {
                        if (status == google.maps.places.PlacesServiceStatus.OK) {
                            var marker = new google.maps.Marker({
                                map: map,
                                position: place.geometry.location
                            });
                            map.setCenter(marker.getPosition());
                        }
                    }

                    var service = new google.maps.places.PlacesService(map);
                    service.getDetails(request, callback);
                });
            $scope.showPredicitions = false;
            $scope.searchLocation = '';
        }

    })
    .controller('MainCtrl', function($scope, $uibModal, $location){
        $scope.isCollapsed = false;
        $scope.menuWidth = 'col-md-2';
        $scope.viewWidth = 'col-md-10';

        $scope.collapseMenu = function(col){
            if(col) {
                $scope.viewWidth = 'col-md-10 col-md-offset-2';
                $scope.isCollapsed = false;
            } else {
                $scope.viewWidth = 'col-md-12';
                $scope.isCollapsed = true;
            }
            google.maps.event.trigger(map, 'resize');
        };
        $scope.activePill = 0;
        $scope.isActive = function () {
            var viewLocation =  $location.path();
            if(viewLocation == '/dashboard'){$scope.activePill = 0}
            if(viewLocation == '/map'){$scope.activePill = 1}
            if(viewLocation == '/reports'){$scope.activePill = 2}
        };

        $scope.openModal = function(){
            Chart.defaults.global.defaultFontColor = 'black';
            var modalInstance = $uibModal.open({
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'templates/partials/modalTemplate.html',
                size: 'lg',
                controller: function ($scope, $uibModalInstance) {
                    $scope.modalOk = function(){
                        $uibModalInstance.close();
                    };

                    $scope.modalCancel = function(){
                        $uibModalInstance.close();
                    };
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
                Chart.defaults.global.defaultFontColor = 'whitesmoke';
            }, function () {
                console.log('modal-component dismissed at: ' + new Date());
                Chart.defaults.global.defaultFontColor = 'whitesmoke';
            });
        };

    //    ============= Demo chart =============     //

        $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
        $scope.series = ['Parking A', 'Parking B'];
        $scope.data = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90]
        ];
        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };
        Chart.defaults.global.defaultFontColor = 'whitesmoke';
        $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
        $scope.options = {
            scales: {
                yAxes: [
                    {
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left'
                    },
                    {
                        id: 'y-axis-2',
                        type: 'linear',
                        display: true,
                        position: 'right'
                    }
                ]
            },
            legend: {display: true}
        };
        $scope.alertChart = function(){
            alert('salut');
        };

    })
    .controller('ReportsCtrl', function($scope){})
    .controller('AuhCtrl', function($scope){
        $scope.userLogin = '';
        $scope.alertUser = function(){alert($scope.userLogin)};
    });


var nightMap = [
    {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
    {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
    {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
    {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{color: '#263c3f'}]
    },
    {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{color: '#6b9a76'}]
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{color: '#38414e'}]
    },
    {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{color: '#212a37'}]
    },
    {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{color: '#9ca5b3'}]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{color: '#746855'}]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{color: '#1f2835'}]
    },
    {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{color: '#f3d19c'}]
    },
    {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{color: '#2f3948'}]
    },
    {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{color: '#17263c'}]
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{color: '#515c6d'}]
    },
    {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{color: '#17263c'}]
    }
];