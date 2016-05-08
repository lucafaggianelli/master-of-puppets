var shell = require('electron').shell;
var path = require('path');
var fs = require('fs');
var njds = require('nodejs-disks');
var mime = require('mime-types');

angular.module('sibilla', [
      'ngResource',
      'ngRoute',
      'angular-loading-bar',
      'ngFlash',
      'ui.bootstrap',

      'sbl-docs',
      'sbl-admin',
      'sbl-filepicker',
      'sbl-preferences'
    ])

.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
  cfpLoadingBarProvider.includeSpinner = false;
}])

/**
 * Routes
 */
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/preferences', {
      templateUrl: 'views/preferences.html',
      controller: 'PreferencesCtrl'
    }).
    when('/admin', {
      templateUrl: 'views/admin.html',
      controller: 'AdminCtrl'
    }).
    otherwise({
      templateUrl: 'views/documents.html',
      controller: 'DocumentsCtrl'
    });
}])

.controller('MainCtrl', ['$scope', 'Document', 'Category', 'Tag', 'Drive', 'Preferences', 'Flash',
    function ($scope, Document, Category, Tag, Drive, Preferences, Flash) {

}]);

