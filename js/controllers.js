var mainCtrl = function ($scope, $http, Document, Category, Tag, Drive, Preferences) {

  $scope.docsFilter = { };
  $scope.prefs = Preferences;

  /* Query all documents */
  $scope.documents = Document.query();
  /* Query all categories */
  $scope.categories_available = Category.query();
  /* Query all tags */
  $scope.tags_available = Tag.query();
  /* Query all drives */
  $scope.drives_available = Drive.query(function() {
    $scope.initDrives();
  });
  $scope.drives_local = {};

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

    /*
    this.docsForm.categories =
        this.docsForm.categories.map(function(x){return x.id});
    this.docsForm.tags =
        this.docsForm.tags.map(function(x){return x.id});
    if (this.docsForm.drive)
      this.docsForm.drive = this.docsForm.drive.id;*/

    if (this.docsForm.id) {
      console.log("Update doc");
      this.docsForm.$update();
    } else {
      console.log("Create doc");
      this.docsForm.$save();
    }
  };

  $scope.$on('filepicker:onSelect', function(event, file) {
    console.log('filepicker:onSelect', file);
    $scope.docsForm.newFile = file;
  });

  $scope.openFilePicker = function() {
    var driveId = $scope.docsForm.drive;
    console.log(driveId);

    $scope.$broadcast('filepicker:setRoot',
        $scope.drives_local[driveId]);
  }

  $scope.openFile = function(doc, revision) {
    var rev = parseInt(revision) || 0;

    if (!doc.files || doc.files.length == 0) {
      console.warn('Document without files', doc.name);
      return;
    }

    var drive = Preferences.get('drives')[doc.drive] || '/';
    var filename = doc.files[rev];
    var abs_path = path.join(drive, filename);

    console.log('opening file', abs_path);
    shell.openItem(abs_path);
  };

  $scope.selectCategory = function(cat) {
    $scope.docsFilter.categories = cat;
  };

  $scope.initDrives = function() {
    njds.drives(function(err, drives) {
      if (err) {
        console.warn("Can't list drives", err);
        return;
      }

      console.log('Drives from server', $scope.drives_available);
      var known = [];
      for (var i in $scope.drives_available) {
        if (drives.indexOf($scope.drives_available[i].drive_id) >= 0) {
          known.push($scope.drives_available[i].drive_id);
        }
      }

      njds.drivesDetail(known, function(err, data) {
        for (var i in data) {
          $scope.drives_local[data[i].drive] = data[i].mountpoint;
        }
        console.log('Found local drives', $scope.drives_local);
      });
    });
  }
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

var filePickerCtrl = function($scope, Preferences) {
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
        var stat = fs.statSync(path.join(absPath, files[i]));

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
}


angular.module('sibilla')

.controller('MainCtrl', ['$scope', '$http', 'Document', 'Category', 'Tag', 'Drive', 'Preferences',
  mainCtrl
])

.controller('PreferencesCtrl', ['$scope', 'Preferences',
  preferencesCtrl
])

.controller('AdminCtrl', ['$scope', 'Preferences', 'Category', 'Tag',
  adminCtrl
])

.controller('FilePickerCtrl', ['$scope', 'Preferences',
  filePickerCtrl
])

