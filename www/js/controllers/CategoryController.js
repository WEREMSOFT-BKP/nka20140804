(function() {
    'use strict';
    var module = angular.module('Category', []);

    module.controller('CategoryController', function($scope, $http) {

        $scope.categories = [];
        $scope.lastCategory = [];
        $scope.nav = null;

        $scope.getCategory = function(categoryID) {
            var request = $http({
                method: "get",
                url: 'http://www.nakaoutdoors.com.ar/webservices/categoria.json?id=' + categoryID,
            });

            this.httpGetCategoryDetailsError = function(data, status, headers, config) {
                console.log(data);
            }

            this.httpGetCategoryDetailsSuccess = function(data, status, headers, config) {
                $scope.categories.push(data.result.child_categories);
            }

            // Store the data-dump of the FORM scope.
            request.success(this.httpGetCategoryDetailsSuccess);


            // Store the data-dump of the FORM scope.
            request.error(this.httpGetCategoryDetailsError);
        }

        $scope.showCategory = function(categoryID) {
            if ($scope.nav == null) {
                $scope.nav = ons.navigator;
                $scope.nav.on('prepop', function(event) {
                    var page = event.currentPage; // Get current page object
                    if(page.page == "templates/page1.html")
                    {
                        $scope.categories.pop();
                    }
                });
            }


            $scope.lastCategory.push(categoryID);
            $scope.getCategory(categoryID);
            ons.navigator.pushPage('templates/page1.html');
        }

        $scope.getCategory(0);


    });

})();
