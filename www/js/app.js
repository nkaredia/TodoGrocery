// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ionicRipple', 'ngCordova'])

    .controller("HeaderCtrl", ["$scope", "$ionicPopover", "$location", "$ionicHistory", function ($scope, $ionicPopover, $location, $ionicHistory) {

        $scope.showBackButton = $location.path() !== '/list';

        $scope.backPressed = function (e) {
            var element = e.target;

            element.style.color = "#b0b0b0";
        }

        $scope.backReleased = function (e) {
            var element = e.target;

            element.style.color = "white";
        }

        $scope.$watch(function () { return $location.path() }, function (params) {
            $scope.showBackButton = $location.path() !== '/list';

        });

        $ionicPopover.fromTemplateUrl('templates/menu-popover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
        });

        $scope.menu = function ($event) {
            $scope.popover.show($event);
        }

        $scope.closePopover = function () {
            $scope.popover.hide();
        };
        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.popover.remove();
        });
        // Execute action on hide popover
        $scope.$on('popover.hidden', function () {
            // Execute action
        });
        // Execute action on remove popover
        $scope.$on('popover.removed', function () {
            // Execute action
        });

        $scope.goto = function (page) {
            $scope.closePopover();
            $location.path(page);
        }

        $scope.goBack = function () {
            $ionicHistory.goBack();
        }
    }])

    .controller("AddCtrl", ["$scope", "$location", "$ionicHistory", "factory_data", function ($scope, $location, $ionicHistory, factory_data) {
        $scope.data = factory_data.getdata();

        $scope.$watch('data', function (newValue, oldValue) {

            if (newValue !== oldValue) {
                factory_data.setdata(newValue);
            }
        }, true);

        $scope.addNewItem = function (e) {

            e.preventDefault();
            var name = document.getElementById("name-input").value;
            var quantity = document.getElementById("quantity-input").value;
            var unit = document.getElementById("unit-input").value;
            if (!name || !quantity || isNaN(quantity) || quantity < 0) {
                e.preventDefault();

            }
            else {
                var id = new Date().getTime().toString().substr(-8);
                $scope.data.push({
                    "id": id,
                    "name": name,
                    "quantity": quantity,
                    "unit": unit
                });
                $ionicHistory.goBack();
            }
        }
    }])

    .controller("FeedbackCtrl", ["$scope", "factory_data", "$location", "$timeout", function ($scope, factory_data, $location, $timeout) {
        $scope.name = "";
        $scope.details = "";
        $scope.online = false;
        $scope.feedback = false;
        $scope.$watch(function () { return factory_data.isOnline(); }, function (newValue, oldValue) {
            $scope.online = newValue;
        });
        $scope.postFeedback = function (e) {
            e.preventDefault();
            if ($scope.name != "" && $scope.details != "" && $scope.online == true) {
                $scope.feedback = true;
                $timeout(function () { $scope.feedback = false }, 3000);
            }
        }


    }])

    .controller("ListCtrl", ["$scope", "$ionicPopup", "$location", "factory_data", function ($scope, $ionicPopup, $location, factory_data) {
        $scope.$watch(function () { return factory_data.getdata(); }, function (newValue, oldValue) {
            if (newValue !== oldValue) {

                $scope.data = newValue;
                //saveChanges();
            }
        }, true);

        $scope.data = factory_data.getdata();


        $scope.sortByChecked = false;

        $scope.selectAllItems = function (e) {
            e.stopPropagation();
            $scope.selectAll = !$scope.selectAll;
            $scope.data.forEach(function (v, i) {
                v.checked = $scope.selectAll;
            });

            saveChanges();
        }

        $scope.selectAll = allItemsChecked();

        $scope.checkItem = function ($index, e) {
            e.stopPropagation();
            $scope.data[$index].checked = !$scope.data[$index].checked;
            var ret = allItemsChecked();
            if (ret) {
                $scope.selectAll = true;

            }
            else {
                $scope.selectAll = false;

            }
            saveChanges();
        }

        function allItemsChecked() {
            if ($scope.data != null) {
                if ($scope.data.length > 0) {
                    var ret = true;
                    $scope.data.forEach(function (v, i) {
                        if (!v.checked) {
                            ret = false;
                        }
                    });
                    return ret;
                }
            }
            return false;
        }

        $scope.sortItems = function (type) {
            switch (type) {
                case 'name':
                    $scope.data.sort(SortByName);
                    break;
                case 'quantity':
                    $scope.data.sort(function (a, b) {
                        return Compare(
                            [Compare(parseFloat(a.quantity), parseFloat(b.quantity)), Compare(a.unit, b.unit)],
                            [Compare(parseFloat(b.quantity), parseFloat(a.quantity)), Compare(b.unit, a.unit)]
                            )
                    });
                    break;
                case 'checked':
                    $scope.sortByChecked = !$scope.sortByChecked;
                    $scope.data.sort(SortByChecked);
                    break;
                default:
                    break;
            }
            saveChanges();
        }

        $scope.deleteItem = function (index) {
            $scope.data.splice(index, 1);
            saveChanges();
        }

        $scope.deleteAllItems = function (e) {
            e.preventDefault();
            var _popupConfirm = $ionicPopup.confirm({
                title: 'Delete All Items',
                template: 'Are you sure you want to delete all items from the list?'
            });
            _popupConfirm.then(function (res) {
                if (res) {
                    $scope.data.splice(0, $scope.data.length);
                    saveChanges();
                }
            });
        }

        $scope.addItem = function (e) {
            e.preventDefault();
            $location.path("add");

        }  // addItem
        
        
        // Helper Funtions
        
        
        function SortByQuantity(x, y) {
            return parseFloat(x.quantity) - parseFloat(y.quantity);
        }
        function SortByName(x, y) {
            return ((x.name.toLowerCase() == y.name.toLowerCase()) ? 0 : ((x.name.toLowerCase() > y.name.toLowerCase()) ? 1 : -1));
        }
        function SortByChecked(x, y) {
            return $scope.sortByChecked ? ((x.checked === y.checked) ? 0 : x.checked ? -1 : 1) : ((x.checked === y.checked) ? 0 : x.checked ? 1 : -1);
        }

        function Compare(x, y) {
            return x > y ? 1 : x < y ? -1 : 0;
        }


        function saveChanges() {
            factory_data.setdata($scope.data);
        }
       
        
        // Helper Functions
        
        
    }])


    .controller('AboutCtrl', ["$scope", "$ionicPopover", "$location", "$ionicHistory", "$ionicPlatform", "$cordovaSocialSharing", function ($scope, $ionicPopover, $location, $ionicHistory, $ionicPlatform, $cordovaSocialSharing) {
        $scope.gotoHelp = function (e) {
            e.preventDefault();
            $location.path('help');
        }

        $scope.gotoFeedback = function (e) {
            e.preventDefault();
            $location.path('feedback')
        }

        $scope.share = function (e) {
            e.preventDefault();
            $cordovaSocialSharing.share("Perform simple grocery task with easy navigation\n\n", "Todo Grocery - Android App", null, "http://play.google.com/store/apps/details?id=com.karedianoorsil.todogrocery");
        }

        $scope.rateAndReview = function (e) {
            e.preventDefault();
            $ionicPlatform.ready(function () {
                if (cordova.platformId == "android" || cordova.platformId == "Android") {
                    //window.open('market://details?id=com.karedianoorsil.todogrocery', '_system', 'location=yes');
                    window.open('market://details?id=com.karedianoorsil.todogrocery', '_system', 'location=yes'); return false;
                }
            })
            // alert(ionic.Platform.device());
        }
    }])


    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('list', {
            url: '/list',
            templateUrl: "templates/list.html"
        });

        $stateProvider.state('about', {
            url: '/about',
            templateUrl: 'templates/about.html'
        });

        $stateProvider.state('feedback', {
            url: '/feedback',
            templateUrl: 'templates/feedback.html'
        });

        $stateProvider.state('help', {
            url: '/help',
            templateUrl: 'templates/help.html'
        });

        $stateProvider.state('add', {
            url: '/add',
            templateUrl: 'templates/additem.html'
        });
        $urlRouterProvider.otherwise('/list');
    })

    .factory('factory_data', ["$window", "$rootScope", "$cordovaNetwork", function ($window, $rootScope, $cordovaNetwork) {
        var _data = [];
        var _onlineStatus = {};

        document.addEventListener("deviceready", function () {
            function getConnection() {
                if ($cordovaNetwork.isOnline()) {
                    return true;
                }
                else {
                    return false;
                }
            }

            _onlineStatus.online = getConnection();

            $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
                _onlineStatus.online = true;

            })
            $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
                _onlineStatus.online = false;

            })


        }, false);

        if (localStorage.getItem("groceryData") == "null" || localStorage.getItem("groceryData") == null) {     
            _data = [];
        }
        else {
            _data = JSON.parse(localStorage.getItem("groceryData"));
        }

        var factory = {
            data: _data,
            onlineStatus: _onlineStatus
        };


        function saveChanges(newData) {
            window.localStorage.setItem("groceryData", angular.toJson(newData));
        }
        return {
            getdata: function () {
                //console.log(factory.data);
                return factory.data;
            },
            setdata: function (newData) {
                saveChanges(newData);
                return factory.data = newData;
            },
            isOnline: function () {
                return _onlineStatus.online;
            }
        }
    }])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            if (cordova.platformId === 'ios' && window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
            
        });
    })
