const shell = require('electron').shell;
const path = require('path');

angular.module('sibilla', [
    'ngResource'
    ])

.controller('MainCtrl', ['$scope', '$http', 'Document', function ($scope, $http, Document) {
  $scope.docsFilter = { };

  $http.get('db/settings.json').success(function(data) {
    $scope.settings = data;
  });
  
  /* Query all documents */
  $scope.documents = Document.query();

  /* Document actions */
  $scope.editDocument = function(doc) {
    if (!doc) {
      // When creating a new doc, init the model
      // with $resource instance
      doc = new Document();
      console.log('new doc', $scope.docsForm)
    }
    $scope.docsForm = doc;
  };

  $scope.deleteDocument = function(doc, index) {
    doc.$delete();
  };

  $scope.saveDocument = function() {
    if (!this.docsForm)
      return;

    if (this.docsForm.id) {
      console.log("Update doc");
      this.docsForm.$update();
    } else {
      console.log("Create doc");
      this.docsForm.$save();
    }
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

.factory('Document', ['$resource', function($resource) {

  return $resource('http://localhost:5000/api/docs/:docId/',
    {'docId': '@id'}, {
    query: {method: 'GET', isArray: true,
      transformResponse: function(data, headers) {
        return angular.fromJson(data).data;
      }
    },
    update: {method: 'PUT'}
  });

}])

.factory('restInterceptor', function() {  
    var sessionInjector = {
        response: function(response) {
          console.log(response);
          return config;
        }
    };
    return sessionInjector;
})

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
