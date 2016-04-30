angular.module('filepicker', [])

.controller('FilePickerCtrl', ['$scope', 'Preferences',
    function($scope, Preferences) {

  $scope.cwd = [];
  $scope.dirContent = [];

  /**
   * cd into a folder as on Unix systems
   */
  $scope.cd = function(folder) {

    if (folder != 0 && !folder) {
      console.error('Null folder', folder);
      return;
    } else if (folder == '..') {
      $scope.cwd.pop();
    } else if (typeof(folder) == 'number') {
      $scope.cwd = $scope.cwd.slice(0, folder + 1);
    } else if (typeof(folder) == 'string') {
      if (folder && folder[0] == '/') {
        // absolute path
        $scope.cwd = folder.split(path.sep);
        $scope.cwd[0] = '/'; // 0="" after split
      } else if (folder) {
        // relative path
        $scope.cwd.push(folder);
      }
    } else if (typeof(folder) == 'object') {
      if (folder.isdir)
        $scope.cwd.push(folder.file);
      else if ($scope.selected == folder.file)
        $scope.selected = null;
      else
        $scope.selected = folder.file;
    } else {
      console.error('Invalid folder', folder);
    }

    if (folder.isdir)
      $scope.selected = null;

    $scope.ls();
  }

  $scope.ls = function() {
    var absPath = path.join.apply(this, $scope.cwd);

    fs.readdir(absPath, function(err, files) {
      if (err) {
        console.error(err);
        return;
      }

      $scope.dirContent = [];

      for (var i in files) {
        var stat;
        try {
          stat = fs.statSync(path.join(absPath, files[i]));
        } catch (err) {
          console.warn(err);
          continue;
        }

        $scope.dirContent.push({
          file: files[i],
          isdir: stat.isDirectory(),
          size: stat.size,
          icon: stat.isDirectory() ? 'folder-open' : 'file'
        });
      }
      $scope.$apply();
    });
  }

  $scope.select = function() {
    if ($scope.selected)
      $scope.cwd.push($scope.selected);

    $scope.$emit('filepicker:onSelect', path.join.apply(this, $scope.cwd));

    $scope.cwd = [];
    $scope.dirContent = [];
  }

  $scope.$on('filepicker:setRoot', function(event, root) {
    console.log('setRoot', root);
    $scope.cd(root);
  });
}])

