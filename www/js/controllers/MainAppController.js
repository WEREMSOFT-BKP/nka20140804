(function() {
    'use strict';
    var module = angular.module('MainApp', []);

    module.controller('MainAppController', function($scope, $http, $sce, userData, shoppingCart, sortOptions) {
        $scope.userData = userData;
        $scope.shoppingCart = shoppingCart;
        $scope.sortOptions = sortOptions;
        $scope.categories = [];
        $scope.products = null;
        $scope.lastCategory = [];
        $scope.nav = null;
        $scope.loading = true;

        $scope.searchString = "";
        $scope.isWorking = false;

        $scope.barCodeScanEnabled = true;

        $scope.deviceType = deviceType;
        $scope.connectionFail = false;

        $scope.searchTotal = 0;
        $scope.lastPage = 1;

        $scope.slides2 = [];

        $scope.currentCategory = 0;

        $scope.backButtonHandler = function() {
            $scope.ons.navigator.popPage();
            alert('test');
        }

        $scope.refreshCurrentProductList = function() {
            if (ons.navigator.getCurrentPage().page == "templates/pages/PageCategory.html") {
                $scope.getCategory($scope.currentCategory);
            } else if (ons.navigator.getCurrentPage().page == "templates/forms/FormSearch.html") {
                $scope.search($scope.searchString);
            } else if (ons.navigator.getCurrentPage().page == "templates/pages/PageNewProducts.html") {
                $scope.getNewProducts();
            } else if (ons.navigator.getCurrentPage().page == 'templates/pages/PageOfertas.html') {
                $scope.getOfertas();
            }
        }

        $scope.getOfertas = function() {
            $scope.isWorking = true;
            var request = $http({
                method: "get",
                url: 'http://www.nakaoutdoors.com.ar/webservices/ofertas.json?max=9999&offset=1&order=' + sortOptions.selectedSortOption,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            $scope.httpError = function(data, status, headers, config) {
                $scope.connectionFail = true;
                $scope.isWorking = false;
            }

            $scope.httpSuccess = function(data, status, headers, config) {
                $scope.products = data.result.child_products;
                $scope.isWorking = false;
                $scope.connectionFail = false;
            }

            // Store the data-dump of the FORM scope.
            request.success(this.httpSuccess);
            // Store the data-dump of the FORM scope.
            request.error(this.httpError);

            if (ons.navigator.getCurrentPage().page != 'templates/pages/PageOfertas.html') {
                ons.navigator.pushPage('templates/pages/PageOfertas.html');
            }

        }

        $scope.getNewProducts = function() {
            $scope.isWorking = true;
            var request = $http({
                method: "get",
                url: 'http://www.nakaoutdoors.com.ar/webservices/nuevos.json?max=9999&offset=1&order=' + sortOptions.selectedSortOption,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            this.httpError = function(data, status, headers, config) {
                $scope.connectionFail = true;
                $scope.isWorking = false;
            }

            this.httpSuccess = function(data, status, headers, config) {
                    $scope.products = data.result.child_products;
                    $scope.isWorking = false;
                    $scope.connectionFail = false;
                }
                // Store the data-dump of the FORM scope.
            request.success(this.httpSuccess);
            // Store the data-dump of the FORM scope.
            request.error(this.httpError);
            if (ons.navigator.getCurrentPage().page != "templates/pages/PageNewProducts.html") {
                ons.navigator.pushPage('templates/pages/PageNewProducts.html')
            }
        }

        $scope.getCategory = function(categoryID) {
            $scope.searchString = "";
            $scope.currentCategory = categoryID;
            $scope.loading = true;
            var request = $http({
                method: "get",
                url: 'http://www.nakaoutdoors.com.ar/webservices/categoria.json?id=' + categoryID + '&max=9999&offset=1&order=' + sortOptions.selectedSortOption,
            });

            this.httpGetCategoryDetailsError = function(data, status, headers, config) {
                $scope.loading = false;
                $scope.connectionFail = true;
            }

            this.httpGetCategoryDetailsSuccess = function(data, status, headers, config) {
                if (data.result.child_categories) {
                    var categoryID = 0;
                    if (ons.navigator) {
                        if (ons.navigator.getCurrentPage().options.categoryID) {
                            categoryID = ons.navigator.getCurrentPage().options.categoryID;
                        }
                    }
                    $scope.categories[categoryID] = data.result.child_categories;
                    $scope.isCategory = true;
                } else if (data.result.child_products) {
                    $scope.products = data.result.child_products;
                    $scope.isCategory = false;
                }
                $scope.loading = false;
                $scope.connectionFail = false;
                $scope.checkForPushNotificationData();
            }

            // Store the data-dump of the FORM scope.
            request.success(this.httpGetCategoryDetailsSuccess);


            // Store the data-dump of the FORM scope.
            request.error(this.httpGetCategoryDetailsError);
        }

        $scope.showCategory = function(categoryID) {
            ons.navigator.pushPage('templates/pages/PageCategory.html', {
                'categoryID': categoryID
            });
        }

        $scope.getProduct = function(productID, pIsCodebar) {
            var searchVariable = pIsCodebar ? 'barcode' : 'id';

            var request = $http({
                method: "get",
                url: 'http://www.nakaoutdoors.com.ar/webservices/producto.json?' + searchVariable + '=' + productID,
            });

            this.httpGetProductDetailsError = function(data, status, headers, config) {
                $scope.connectionFail = true;
                $scope.loading = false;
            }

            this.httpGetProductDetailsSuccess = function(data, status, headers, config) {
                $scope.connectionFail = false;
                $scope.product = data.result;
                if ($scope.product.code === 3) {
                    prompt('Atículo no encontrado');
                    $scope.loading = false;
                    ons.navigator.popPage();
                    return;
                }

                if ($scope.product.video) {
                    $scope.product.videoURL = '';

                    if ($scope.product.video.type === 'YOUTUBE') {
                        $scope.product.videoURL = $sce.trustAsResourceUrl('http://www.youtube.com/embed/' + $scope.product.video.code);
                    }
                    if ($scope.product.video.type === 'VIMEO') {
                        $scope.product.videoURL = $sce.trustAsResourceUrl('http://player.vimeo.com/video/' + $scope.product.video.code);
                    }
                }

                if ($scope.product.options) {
                    $scope.product.talles = [];
                    if ($scope.product.options["En Stock"]) {
                        for (var i = 0; i < $scope.product.options["En Stock"].length; i++) {
                            $scope.product.options["En Stock"][i].stock = "En Stock";
                        }
                        $scope.product.talles = $scope.product.talles.concat($scope.product.options["En Stock"]);
                    }

                    if ($scope.product.options["Consultar Stock"]) {
                        for (var i = 0; i < $scope.product.options["Consultar Stock"].length; i++) {
                            $scope.product.options["Consultar Stock"][i].stock = "Consultar Stock";
                        }
                        $scope.product.talles = $scope.product.talles.concat($scope.product.options["Consultar Stock"]);
                    }
                }

                $scope.product.unsafeParsedHTML = $sce.trustAsHtml($scope.product.body);

                var stars = new Array(5);
                for (var i = 0; i < 5; i++) {
                    stars[i] = {
                        "value": 0
                    };
                    stars[i].value = (i + 1) <= $scope.product.score ? 1 : 0;
                }
                $scope.product.stars = stars;
                $scope.currentSlide = $scope.product.images[0];
                $scope.isCategory = false;
                $scope.loading = false;
            }

            // Store the data-dump of the FORM scope.
            request.success(this.httpGetProductDetailsSuccess);


            // Store the data-dump of the FORM scope.
            request.error(this.httpGetProductDetailsError);
        }

        $scope.showProduct = function(productID, pCodebar) {
            $scope.loading = true;
            $scope.getProduct(productID, pCodebar);
            ons.navigator.pushPage('templates/pages/PageProduct.html');
        }

        $scope.getDestacados = function() {
            var request = $http({
                method: "get",
                url: 'http://www.nakaoutdoors.com.ar/webservices/destacados.json?max=9999&offset=1&order=1',
            });

            this.httpGetDestacadosDetailsError = function(data, status, headers, config) {
                console.log(data);
            }

            this.httpGetDestacadosSuccess = function(data, status, headers, config) {
                $scope.destacadosHome = data.result.child_products;
            }

            // Store the data-dump of the FORM scope.
            request.success(this.httpGetDestacadosSuccess);


            // Store the data-dump of the FORM scope.
            request.error(this.httpGetDestacadosDetailsError);
        }



        $scope.setCurrentSlide = function(pSlide) {
            $scope.currentSlide = pSlide;
        }

        $scope.checkForPushNotificationData = function() {
            if (gcmProductID) {
                $scope.showProduct(gcmProductID);
                gcmProductID = null;
            } else if (gcmCategoryID) {
                $scope.showCategory(gcmCategoryID);
                gcmCategoryID = null;
            }
        }

        $scope.search = function(strSearchString, pPage, pCount) {
            $scope.searchString = strSearchString;
            if (gaPlugin) {
                gaPlugin.trackEvent(googleAnalyticsTrackEventSuccess, googleAnalyticsTrakEventError, "Application", "SearchString", strSearchString, 1);
            }

            if (pCount == null) {
                pCount = 30;
            }

            if (pPage == null) {
                pPage = 1;
                $scope.lastPage = 1;
            } else {
                $scope.lastPage = pPage;
            }

            $scope.isWorking = true;
            var request = $http({
                method: "post",
                url: 'http://www.nakaoutdoors.com.ar/webservices/search.json?max=' + pCount + '&offset=' + pPage + '&order=' + sortOptions.selectedSortOption,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },

                data: '_method=POST&data[Busqueda][string]=' + strSearchString + '&',
            });


            // Store the data-dump of the FORM scope.
            request.success($scope.httpSuccess);


            // Store the data-dump of the FORM scope.
            request.error($scope.httpError);

            if (ons.navigator.getCurrentPage().name != "templates/forms/FormSearch.html") {
                ons.navigator.pushPage("templates/forms/FormSearch.html");
            }

        }

        $scope.httpError = function(data, status, headers, config) {
            $scope.connectionFail = true;
        }

        $scope.httpSuccess = function(data, status, headers, config) {
            $scope.connectionFail = false;
            if ($scope.lastPage > 1) {
                $scope.products = $.merge($scope.products, data.result.child_products);
            } else {
                $scope.products = data.result.child_products;
            }

            $scope.isWorking = false;
            $scope.searchTotal = data.result.count;
        }

        $scope.barCodeScan = function() {
            cordova.plugins.barcodeScanner.scan($scope.barCodeScanSuccess, $scope.barCodeScanError);
        }

        $scope.barCodeScanSuccess = function(result) {
            /*           prompt("We got a barcode\n" +
                "Result: " + result.text + "\n" +
                "Format: " + result.format + "\n" +
                "Cancelled: " + result.cancelled);*/
            if (result.cancelled) {
                prompt('Lectura Cancelada');
            } else {
                $scope.showProduct(result.text, true);
            }

        }

        $scope.barCodeScanError = function(error) {
            promptError("Scanning failed: " + error);
        }

        $scope.categoryPageInit = function() {
            ons.setDefaultDeviceBackButtonListener(function() {
                alert('test');
                ons.navigator.popPage();
            });
            $scope.connectionFail = false;
            var categoryID = 0;
            if (ons.navigator) {
                if (ons.navigator.getCurrentPage().options.categoryID) {
                    categoryID = ons.navigator.getCurrentPage().options.categoryID;
                }
            }
            $scope.getCategory(categoryID);

        }

        $scope.init = function() {
            $scope.categoryPageInit();
            $scope.getCarrouselData();
            $scope.userData.sendPushNotificationToken(window.localStorage.getItem("pushNotificationToken"));



        }

        $scope.getCarrouselData = function() {
            var request = $http({
                method: "get",
                url: 'http://www.nakaoutdoors.com.ar/webservices/slide.json',
            });

            this.getCarrouselDataError = function(data, status, headers, config) {
                console.log(data);
            }

            this.getCarrouselDataSuccess = function(data, status, headers, config) {
                if (data.result.slide.length > 0) {
                    for (var i = 0; i < data.result.slide.length; i++) {
                        $scope.slides2.push({
                            "id": i,
                            "label": "slide #" + i,
                            "img": data.result.slide[i].file,
                            "color": "#fc0003",
                            "odd": i % 2 == 0
                        });
                    }
                }

            }

            // Store the data-dump of the FORM scope.
            request.success(this.getCarrouselDataSuccess);


            // Store the data-dump of the FORM scope.
            request.error(this.getCarrouselDataError);
        }



        document.addEventListener("resume", $scope.checkForPushNotificationData, false);
        document.addEventListener("deviceready", $scope.init, false);


    });


    module.directive('moduleSinConexion', function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/modules/sinConexion.html'
        };
    });

    module.directive('moduleHeader', function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/modules/header.html'
        };
    });

    module.directive('moduleLoadingSpinner', function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/modules/loadingSpinner.html'
        };
    });

    module.directive('moduleTabBarBottom', function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/modules/tabBarBottom.html'
        };
    });
    module.directive('moduleStockColorCodes', function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/modules/stockColorCodes.html'
        };
    });







})();
