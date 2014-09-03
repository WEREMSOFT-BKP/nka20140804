(function() {
    'use strict';
    var app = angular.module('myApp', ['onsen.directives', 'ngSanitize', 'QuestionOnProduct', 'Cart', 'Register', 'Ofertas', 'CommingSoon', 'Category', 'NewProducts', 'ContactForm', 'List', 'Login', 'GridMenu', 'Search']);

    app.factory('userData', function() {
        var returnValue = {
            logedIn: false,
            profileData: null,
            userName: null,
            password: null,
            lastProfileData: null
        };
        returnValue.reset = function() {

            this.logedIn = false;
            this.lastProfileData = this.profileData;
            this.profileData = null;
            window.localStorage.setItem('logedIn', false);
            window.localStorage.setItem('profileData', null);
        }

        if (window.localStorage.getItem('logedIn')) {
            returnValue.logedIn = window.localStorage.getItem('logedIn');
            returnValue.profileData = JSON.parse(window.localStorage.getItem('profileData'));
            returnValue.userName = window.localStorage.getItem('userName');
            returnValue.password = window.localStorage.getItem('password');
        }

        return returnValue;
    });

})();

