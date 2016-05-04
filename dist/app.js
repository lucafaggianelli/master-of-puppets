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

    $scope.category_new.$save(function(data) {
      $scope.categories.push(data.data);
      $scope.category_new = null;
    });
  };

  $scope.updateCategory = function(cat) {
    console.log("update cat", cat);

    if (!cat)
      return;

    cat.$update();
  };

  $scope.deleteCategory = function(cat, index) {
    Category.delete(cat, function() {
      $scope.categories.splice(index, 1);
    });
  };

  /*
   * Tags
   */
  $scope.createTag = function() {
    console.log("create tag", $scope.tag_new);

    if (!$scope.tag_new)
      return;

    $scope.tag_new.$save(function(data) {
      $scope.tags.push(data.data);
      $scope.tag_new = null;
    });
  };

  $scope.updateTag = function(tag) {
    console.log("update tag", tag);

    if (!tag)
      return;

    tag.$update();
  };

  $scope.deleteTag = function(tag, index) {
    Tag.delete(tag, function() {
      $scope.tags.splice(index, 1);
    });
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
  };

  $scope.createDrive = function() {
    if (!$scope.drive_new)
      return;

    $scope.drive_new.$save();
  };

  $scope.updateDrive = function(drive) {
    drive.$update();
  };

  $scope.deleteDrive = function(drive) {
    drive.$delete();
  };

  $scope.listLocalDrives();
}]);

;var shell = require('electron').shell;
var path = require('path');
var fs = require('fs');
var njds = require('nodejs-disks');
var mime = require('mime-types');

angular.module('sibilla', [
      'ngResource',
      'angular-loading-bar',
      'ngFlash',
      'ui.bootstrap',

      'sibilla-admin',
      'filepicker',
      'preferences'
    ])

.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
  cfpLoadingBarProvider.includeSpinner = false;
}])

.controller('MainCtrl', ['$scope', 'Document', 'Category', 'Tag', 'Drive', 'Preferences', 'Flash',
    function ($scope, Document, Category, Tag, Drive, Preferences, Flash) {

  $scope.docsFilter = { };
  $scope.clearFilter = function() {
    $scope.docsFilter = { };
  };

  $scope.prefs = Preferences;

  /* Query all documents */
  $scope.documents = Document.query();
  /* Query all categories */
  $scope.categories_available = Category.query();
  /* Query all tags */
  Tag.query(function(data) {
    $scope.tags_available = {};
    angular.forEach(data, function(tag){
      $scope.tags_available[tag.id] = tag;
    });
  });
  /* Query all drives */
  $scope.drives_available = Drive.query(function() {
    $scope.initDrives();
  });

  // Mapping of drive _id to drive mountpoint
  $scope.drivesMountpoint = {};

  /* Document actions */
  $scope.editDocument = function(doc) {
    if (!doc) {
      // When creating a new doc, init the model
      // with $resource instance
      doc = new Document();
    }
    $scope.docsForm = doc;
  };

  $scope.deleteDocument = function(doc) {
    var docIndex = -1;
    $scope.documents.forEach(function(item, index) {
      if (doc.id === item.id) {
        docIndex = index;
        return;
      }
    });

    Document.delete(doc, function() {
      $scope.documents.splice(docIndex, 1);
    });
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
      this.docsForm.$update();
    } else {
      this.docsForm.$save(function(data) {
        $scope.documents.push(data.data);
      });
    }
  };

  $scope.$on('filepicker:onSelect', function(event, absolute) {
    console.log('filepicker:onSelect', absolute);

    var driveMount = $scope.drivesMountpoint[$scope.docsForm.drive];
    var relative = path.relative(driveMount, absolute);
    $scope.docsForm.newFile = relative;
  });

  $scope.openFilePicker = function() {
    var drive_id = $scope.docsForm.drive;

    if (drive_id in $scope.drivesMountpoint) {
      var root = $scope.drivesMountpoint[drive_id];

      if ($scope.docsForm.newFile) {
        if ($scope.docsForm.newFile.endsWith('/'))
          root = path.join(root, $scope.docsForm.newFile);
        else
          root = path.join(root, path.dirname($scope.docsForm.newFile));
      }

      $scope.$broadcast('filepicker:setRoot', root);
    } else {
      console.warn("Can't find drive", drive_id);
    }
  };

  $scope.openFile = function(doc, revision) {
    var rev = parseInt(revision) || 0;

    if (!doc.files || doc.files.length === 0) {
      console.warn('Document without files', doc.name);
      return;
    }

    if (doc.drive in $scope.drivesMountpoint) {
      var drive = $scope.drivesMountpoint[doc.drive];
      var filename = doc.files[rev];
      var abs_path = path.join(drive, filename);
      console.log('opening file', abs_path);
      shell.openItem(abs_path);
    } else {
      console.warn("Drive not found", doc.drive);
      return;
    }
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

      njds.drivesDetail(drives, function(err, data) {
        for (var i in $scope.drives_available) {
          var drive_id = $scope.drives_available[i].drive_id;
          // Search local mountpoint
          for (var j in data) {
            if (drive_id == data[j].drive) {
              $scope.drivesMountpoint[$scope.drives_available[i].id] = data[j].mountpoint;
            }
          }
        }
        console.log('Found local drives', $scope.drivesMountpoint);
      });
    });
  };
}]);

;angular.module('sibilla')

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

.directive('tag', [function() {
  return {
    templateUrl: 'views/tag.html',
    transclude: true,
    scope: {
      tagId: '=',
      tagsFilter: '=',
    },
  };
}])

.directive('confirm', ['$uibModal', function ($uibModal) {
  return {
    priority: 1,
    terminal: true,
    link: function (scope, element, attr) {
      element.bind('click',function (event) {
        if (window.confirm(scope.msg)) {
          scope.$apply(attr.ngClick);
        }
        /*
        var modalInst = $uibModal.open({
          templateUrl: 'views/modal-confirm.html',
          scope: scope,
          windowTopClass: 'modal-confirm'
        });

        scope.onConfirm = function() {
          modalInst.dismiss();
          console.log('confirm', clickAction)
          scope.$apply(clickAction);
        }

        scope.onCancel = function() {
          modalInst.dismiss();
        }*/
      });
    }
  };
}]);
;angular.module('filepicker', [])

.controller('FilePickerCtrl', ['$scope', 'Preferences',
    function($scope, Preferences) {

  $scope.root = null;
  $scope.cwd = [];
  $scope.dirContent = [];

  /**
   * cd into a folder as on Unix systems
   */
  $scope.cd = function(folder) {

    if (folder !== 0 && !folder) {
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
  };

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
        } catch (e) {
          console.warn(e);
          continue;
        }

        $scope.dirContent.push({
          file: files[i],
          isdir: stat.isDirectory(),
          size: stat.size,
          icon: stat.isDirectory() ? 'folder-open' : 'file',
          mime: mime.lookup(files[i]),
        });
      }
      $scope.$apply();
    });
  };

  $scope.select = function() {
    if ($scope.selected)
      $scope.cwd.push($scope.selected);

    var absolute = path.join.apply(this, $scope.cwd);
    $scope.$emit('filepicker:onSelect', absolute);

    $scope.root = null;
    $scope.cwd = [];
    $scope.dirContent = [];
  };

  $scope.$on('filepicker:setRoot', function(event, root) {
    console.log('setRoot', root);
    $scope.root = root;
    $scope.cd(root);
  });
}]);

;angular.module('sibilla')

.filter('bytes', function() {
	return function(bytes, precision) {
		if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
		if (typeof precision === 'undefined') precision = 1;
		var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
			number = Math.floor(Math.log(bytes) / Math.log(1024));
		return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
	};
});
;angular.module('preferences', [])

.controller('PreferencesCtrl', ['$scope', 'Preferences',
    function($scope, Preferences) {
  $scope.prefs = Preferences.get();

  $scope.saveSettings = function() {
    Preferences.save($scope.prefs);
  };

}])

.factory('Preferences', ['Flash', function(Flash) {
  // Prefences store
  var prefs = {};
  var prefPath = path.join(getUserHome(), 'sibilla');
  var prefFile = path.join(prefPath, 'preferences.json');

  function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  }

  function initPreferences() {
    var prefsDefault = JSON.parse(
        fs.readFileSync('preferences.default.json', 'utf8'));
    var prefsUser = {};

    try {
      fs.mkdir(prefPath, function() {});
      console.log('User pref file', prefFile);

      prefsUser = JSON.parse(fs.readFileSync(prefFile, 'utf8'));
    } catch (err) {
      console.warn("Can't read user preferences", err);
    }

    prefs = angular.extend(prefsDefault, prefsUser);
  }

  initPreferences();

  /*
   * Service interface
   */
  var service = {};

  service.get = function(name) {
    if (!name)
      return prefs;
    else
      return prefs[name];
  };

  service.save = function(new_prefs) {
    console.log('Saving pref', new_prefs);

    fs.mkdir(prefPath, function(err) {
      if (err && err.code != 'EEXIST') {
        var msg = 'Settings not saved. Can\'t create folder preferences folder ' + prefPath;
        Flash.create('error', msg);
        return;
      }
      fs.writeFileSync(prefFile, JSON.stringify(new_prefs, null, 2), 'utf8');
    });
  };

  return service;
}]);

;var hide_id_from_data = function(data, headers) {
  delete data.id;
  return angular.toJson(data);
};

var get_data_from_response = function(data, headers) {
  return angular.fromJson(data).data;
};

var build_resource = function($resource, Preferences, resourceInterceptor, path, params) {
  return $resource(Preferences.get('server') + path,
    params,
    {
      query: {
        method: 'GET',
        isArray: true,
        transformResponse: get_data_from_response,
      },
      update: {
        method: 'PUT',
        transformRequest: hide_id_from_data,
        interceptor: resourceInterceptor,
      },
      save: {
        method: 'POST',
        interceptor: resourceInterceptor,
      },
      delete: {
        method: 'DELETE',
        interceptor: resourceInterceptor,
      }
    }
  );
};

var RESOURCE_SUCCESS_ACTIONS = {
    'PUT': 'modified',
    'POST': 'created',
    'DELETE': 'deleted',
};

var RESOURCE_FAIL_ACTIONS = {
    'PUT': 'modify',
    'POST': 'create',
    'DELETE': 'delete',
};

var app = angular.module('sibilla')

.config(function($resourceProvider) {
  $resourceProvider.defaults.stripTrailingSlashes = false;
})

.factory('resourceInterceptor', ['Flash', function(Flash) {
  return {
    response: function(response) {
      console.log(response);
      var msg = 'Successfully ';
      msg += RESOURCE_SUCCESS_ACTIONS[response.config.method];
      msg += ' <b>'+response.data.name+'</b>';
      Flash.create('success', msg);

      return response;
    },

    responseError: function(rejection) {
      var msg = 'Failed to ';
      msg += RESOURCE_FAIL_ACTIONS[rejection.config.method];
      msg += ' <b>'+response.data.name+'</b>';
      Flash.create('error', msg, 0);

      return $q.reject(rejection);
    }
  };
}])

.factory('Document', ['$resource', 'Preferences', 'resourceInterceptor',
    function($resource, Preferences, resourceInterceptor) {
      return build_resource($resource, Preferences, resourceInterceptor,
        '/api/docs/:id/', {'id': '@id'});
    }
])

.factory('Category', ['$resource', 'Preferences', 'resourceInterceptor',
    function($resource, Preferences, resourceInterceptor) {
      return build_resource($resource, Preferences, resourceInterceptor,
        '/api/categories/:id/', {'id': '@id'});
    }
])

.factory('Tag', ['$resource', 'Preferences', 'resourceInterceptor',
    function($resource, Preferences, resourceInterceptor) {
      return build_resource($resource, Preferences, resourceInterceptor,
        '/api/tags/:id/', {'id': '@id'});
    }
])

.factory('Drive', ['$resource', 'Preferences', 'resourceInterceptor',
    function($resource, Preferences, resourceInterceptor) {
      return build_resource($resource, Preferences, resourceInterceptor,
        '/api/drives/:id/', {'id': '@id'});
    }
]);

