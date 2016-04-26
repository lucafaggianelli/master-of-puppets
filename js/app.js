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
    console.log($scope.docsForm);
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
