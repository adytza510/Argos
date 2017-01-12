/**
 * Created by bogdan.voicu on 12/28/2016.
 */
var app = angular.module('AdminApp', ['ngMap', 'ui.router', 'ui.bootstrap', 'firebase', 'chart.js', 'Directives']);

var config = {
    apiKey: "AIzaSyBIvDbQ0rLop-Fm3Z4KfzX-mAoKLZRcDYI",
    authDomain: "helical-button-127109.firebaseapp.com",
    databaseURL: "https://helical-button-127109.firebaseio.com",
    storageBucket: "helical-button-127109.appspot.com",
    messagingSenderId: "993329004190"
};
firebase.initializeApp(config);

var rootUrl = 'http://172.31.22.136:3000';

// ================ Logica la INITIALIZAREA aplicatiei/refresh ===================
app.run(function($rootScope, $state, $firebaseAuth, $http, $uibModal, $timeout){

    $rootScope.popupInfo = function(txt){
        $uibModal.open({
            templateUrl:'templates/partials/popupInfo.html',
            size: 'sm',
            //backdrop: false,
            controller: function ($scope, $uibModalInstance, $timeout) {
                $timeout(function() {
                    $uibModalInstance.close(); //close the popup after 2.5 seconds
                }, 2500);

                $scope.txt = txt;

                $scope.modalCancel = function(){
                    $uibModalInstance.close();
                };
            }
        });
    };

    $rootScope.popupError = function(txt){
        $uibModal.open({
            templateUrl:'templates/partials/popupError.html',
            size: 'sm',
            //backdrop: false,
            controller: function ($scope, $uibModalInstance) {

                $scope.txt = txt;

                $scope.modalCancel = function(){
                    $uibModalInstance.close();
                };
            }
        });
    };
    // Salvarea datelor utilizatorului cand se schimba starea AUTENTIFICARII FIREBASE
    $firebaseAuth().$onAuthStateChanged(function(user) {
        if(user){
            $rootScope.user = user;
            console.log(user);
            $http.get(rootUrl + '/user/'+ user.uid)
                .then(function(resp){
                    $rootScope.user.userProps = resp.data[0];
                    $rootScope.user.userProps.parcari = [];
                    var parcariUser = resp.data[0].id_parcari;
                    var parcari = parcariUser.split(';');
                    angular.forEach(parcari, function(parcare){
                        $http.get(rootUrl+'/parking/'+parcare)
                            .then(function(resp1){
                                $rootScope.user.userProps.parcari.push(resp1.data[0]);
                                //console.log($rootScope.user.userProps.parcari);
                            })
                            .catch(function(err){console.log(err)});
                    });
                })
                .catch(function(err){console.log(err)});
            //$state.go('app.dashboard')
        } else {
            $rootScope.user = null;
            $state.go('user.login');
        }
    });
    if(!$rootScope.user){$state.go('user.login')}
    // RUTA in cazul in care initializezi aplicatia cu altceva in afara de Login sau Register
    $rootScope.$on('$stateChangeStart', function(event, args) {
        if(args.name !== 'user.login' &&  args.name !== 'user.register'&& !$rootScope.user) {
            $state.go('user.login');
        }
        else if ((args.name == 'user.login' || args.name == 'user.register')&& $rootScope.user){
            $state.go('app.dashboard');
        }
    })
});

app.config(function($stateProvider, $urlRouterProvider){

    // =================== RUTE ======================
    $urlRouterProvider.otherwise("user/login");
    $stateProvider
        .state('user', {
            url: '/user',
            abstract: true,
            template: '<div ui-view><div>'
        })
        .state("user.login",{
            url:"/login",
            templateUrl:"templates/login.html",
            controller: 'UserCtrl'
        })
        .state("user.register",{
            url:"/register",
            templateUrl:"templates/register.html",
            controller: 'UserCtrl'
        })
        .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'templates/partials/menu.html',
            controller: 'MainCtrl'
        })
        .state('app.dashboard', {
            url: '/dashboard',
            templateUrl: 'templates/dashboard.html',
            controller: 'MainCtrl'
        })
        .state('app.map', {
            url: "/map",
            templateUrl: "templates/map.html",
            controller: 'MapCtrl'
        })
        .state('app.reports', {
            url: "/reports",
            templateUrl: "templates/reports.html",
            controller: 'ReportsCtrl'
        })
    ;
});



app
    .controller('MapCtrl', function($scope, NgMap, NavigatorGeolocation,$http){
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

            };
            var service = new google.maps.places.AutocompleteService();
            service.getPlacePredictions({ input: location+"" }, displaySuggestions); //, componentRestrictions: {country: 'ro'}
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
        };

        $scope.getParkingSpots = function(){
            $http.get(rootUrl+'/parkingSpot/all')
                .then(function(resp){
                    $scope.spots = resp.data;
                })
                .catch(function(err){
                    console.log(err);
                });
        };

        $scope.getMarkerIcon = function(status){
            if(status==1) return 'icons/true.png';
            else return 'icons/false.png';
        };

    })
    .controller('MainCtrl', function($scope, $uibModal, $location, $firebaseAuth, $state){
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
            if(viewLocation == '/app/dashboard'){$scope.activePill = 0}
            if(viewLocation == '/app/map'){$scope.activePill = 1}
            if(viewLocation == '/app/reports'){$scope.activePill = 2}
        };
        $scope.popup1 = {
            opened: false
        };
        $scope.open1 = function() {
            $scope.popup1.opened = true;
        };
        $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            //minDate: new Date(),
            startingDay: 1
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

        $scope.logOff = function(){
            $firebaseAuth().$signOut();
            $state.go('user.login');
        };

    })
    .controller('ReportsCtrl', function($scope){

    })
    .controller('UserCtrl', function($scope, $state, $firebaseAuth, $rootScope){
        var auth = $firebaseAuth();

        $scope.registerWithEmail = function(){

            auth.$createUserWithEmailAndPassword($scope.emailRegister, $scope.passwordRegister)
                .then(function(){
                    var user = firebase.auth().currentUser;
                    user.updateProfile({
                        displayName: $scope.userRegister,
                        photoURL: ""
                    }).then(function() {
                        $scope.popupInfo("Draga " + $scope.userRegister+", contul a fost creat!");
                        $state.go('app.dashboard');
                    }, function(error) {
                        $scope.popupError(error);
                    });
                })
                .catch(function(error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    if (errorCode == 'auth/weak-password') {
                        $scope.popupError('The password is too weak.');
                    } else {
                        $scope.popupError(errorMessage);
                    }
                });
        };

        $scope.loginWithEmail = function(){

            auth.$signInWithEmailAndPassword($scope.emailLogin, $scope.passwordLogin)
                .then(function(user){
                    $scope.popupInfo("Draga " + user.displayName+", esti logat!");
                    $state.go('app.dashboard');
                    //$scope.resetPasswordEmail = user.email;
                })
                .catch(function(error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    if (errorCode === 'auth/wrong-password') {
                        // $scope.showPasswordResetForm = true;
                        $scope.popupError('Wrong password.');
                    } else {
                        $scope.popupError(""+errorMessage);
                    }
                });
        };

        $scope.fbLogin = function(){
            var provider = new firebase.auth.FacebookAuthProvider();
            provider.addScope('public_profile');
            provider.addScope('email');
            provider.addScope('user_friends');
            auth.$signInWithPopup(provider)
                .then(function(result) {
                    alert('Draga '+ result.user.displayName + ' esti logat!');
                });
        };

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