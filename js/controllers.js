var mainCtrl = function ($scope, $http, Document, Category, Tag, Preferences) {

  $scope.docsFilter = { };
  $scope.prefs = Preferences;

  /* Query all documents */
  $scope.documents = Document.query();
  /* Query all categories */
  $scope.categories_available = Category.query();
  /* Query all tags */
  $scope.tags_available = Tag.query();

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

    this.docsForm.categories =
        this.docsForm.categories.map(function(x){return x.id});
    this.docsForm.tags =
        this.docsForm.tags.map(function(x){return x.id});

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
}

var adminCtrl = function($scope, Preferences, Category, Tag) {
  $scope.categories = Category.query();
  $scope.category_new = new Category();

  $scope.tags = Tag.query();
  $scope.tag_new = new Tag();

  $scope.createCategory = function() {
    console.log("create cat", $scope.category_new);

    if (!$scope.category_new)
      return;

    $scope.category_new.$save();
  };

  $scope.updateCategory = function(cat) {
    console.log("update cat", cat);

    if (!cat)
      return;

    cat.$update();
  };

  $scope.deleteCategory = function(cat) {
    cat.$delete();
  };

  /*
   * Tags
   */
  $scope.createTag = function() {
    console.log("create tag", $scope.tag_new);

    if (!$scope.tag_new)
      return;

    $scope.tag_new.$save();
  };

  $scope.updateTag = function(tag) {
    console.log("update tag", tag);

    if (!tag)
      return;

    tag.$update();
  };

  $scope.deleteTag = function(tag) {
    tag.$delete();
  };
}

var preferencesCtrl = function($scope, Preferences) {
  $scope.prefs = Preferences.get();

  $scope.saveSettings = function() {
    console.log($scope.prefs);
    //Preferences.save($scope.prefs);
  };
}


angular.module('sibilla')

.controller('MainCtrl', ['$scope', '$http', 'Document', 'Category', 'Tag', 'Preferences',
  mainCtrl
])

.controller('PreferencesCtrl', ['$scope', 'Preferences',
  preferencesCtrl
])

.controller('AdminCtrl', ['$scope', 'Preferences', 'Category', 'Tag',
  adminCtrl
])

