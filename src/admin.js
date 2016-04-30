angular.module('sibilla-admin', [])

.controller('AdminCtrl', ['$scope', 'Preferences', 'Category', 'Tag', 'Drive',
    function($scope, Preferences, Category, Tag, Drive) {

  $scope.categories = Category.query();
  $scope.category_new = new Category();

  $scope.tags = Tag.query();
  $scope.tag_new = new Tag();

  $scope.drives = Drive.query();
  $scope.drive_new = new Drive();

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

  $scope.listLocalDrives = function(callback) {
    njds.drives(function(err, drives) {
      if (err) {
        console.warn("Can't list drives", err);
        return;
      }

      njds.drivesDetail(drives, function(err, details) {
        $scope.localDrives = details;
        console.log(details);
        if (callback instanceof Function)
          callback(details);
        $scope.$apply();
      });
    });
  }

  $scope.createDrive = function() {
    console.log("create drive", $scope.drive_new);

    if (!$scope.drive_new)
      return;

    $scope.drive_new.$save();
  };

  $scope.listLocalDrives();
}])

