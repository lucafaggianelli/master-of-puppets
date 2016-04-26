angular.module('sibilla')

.controller('MainCtrl', ['$scope', '$http', 'Document', 'Category', 'Preferences',
    function ($scope, $http, Document, Category, Preferences) {
  $scope.docsFilter = { };
  $scope.prefs = Preferences;

  /* Query all documents */
  $scope.documents = Document.query();
  /* Query all categories */
  $scope.categories_available = Category.query();

  /* Document actions */
  $scope.editDocument = function(doc) {
    if (!doc) {
      // When creating a new doc, init the model
      // with $resource instance
      doc = new Document();
    }
    $scope.docsForm = doc;
  };

  $scope.deleteDocument = function(doc, index) {
    doc.$delete();
  };

  $scope.saveDocument = function() {
    if (!this.docsForm)
      return;

    if (this.docsForm.newFile) {
      if (!this.docsForm.files)
        this.docsForm.files = [];
      this.docsForm.files.unshift(this.docsForm.newFile);
    }

    if (this.docsForm.id) {
      console.log("Update doc");
      this.docsForm.$update();
    } else {
      console.log("Create doc");
      this.docsForm.$save();
    }
  };


  $scope.openFile = function(doc) {
    var drive = Preferences.get('drives')[doc.drive];
    var filename = doc.path +'/'+ doc.revisions[0];
    var abs_path = path.join(drive, filename);

    console.log('opening file', abs_path);
    shell.openItem(abs_path);
  };

  $scope.selectCategory = function(cat) {
    $scope.docsFilter.categories = cat;
  };
}])

.controller('PreferencesCtrl', ['$scope', 'Preferences',
    function($scope, Preferences) {
      $scope.prefs = Preferences.get();

      $scope.saveSettings = function() {
        console.log($scope.prefs);
        //Preferences.save($scope.prefs);
      };
}])

