const shell = require('electron').shell;
const path = require('path');

angular.module('sibilla', [])

.controller('MainCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.docsFilter = { };

  $http.get('db/settings.json').success(function(data) {
    $scope.settings = data;
  });

  $http.get('db/documents.json').success(function(data) {
    $scope.documents = data;
  });

  $scope.editDocument = function(doc) {
    $scope.docsForm = doc;
  };

  $scope.submitDocument = function() {
    console.log("Saving doc", this.docsForm);
    $http.post($scope.settings.server, this.docsForm);
  };

  $scope.openFile = function(doc) {
    var drive = $scope.settings.drives[doc.drive];
    var filename = doc.path +'/'+ doc.revisions[0];
    var abs_path = path.join(drive, filename);

    console.log('opening file', abs_path);
    shell.openItem(abs_path);
  };

  $scope.selectCategory = function(cat) {
    $scope.docsFilter.categories = cat;
  };
}])

.directive('modalDialog', function() {
  return {
    templateUrl: 'views/modal.html',
    transclude: true,
    scope: {
      title: '@title',
      id: '@modalId',
      save: '&save'
    },
  };
})
