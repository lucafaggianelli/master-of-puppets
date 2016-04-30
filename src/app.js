const shell = require('electron').shell;
const path = require('path');
const fs = require('fs');
const njds = require('nodejs-disks');
const mime = require('mime-types');

angular.module('sibilla', [
      'ngResource',
      
      'sibilla-admin',
      'filepicker',
      'preferences'
    ])

.controller('MainCtrl', ['$scope', 'Document', 'Category', 'Tag', 'Drive', 'Preferences',
    function ($scope, Document, Category, Tag, Drive, Preferences) {

  $scope.docsFilter = { };
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

  $scope.deleteDocument = function(doc) {
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
    var drive_id = $scope.docsForm.drive;

    console.log('local drives', $scope.drives_local);
    console.log('remote drives', $scope.drives_available);

    for (var i in $scope.drives_available) {
      if ($scope.drives_available[i].id == drive_id) {
        var root = $scope.drives_local[$scope.drives_available[i].drive_id];
        $scope.$broadcast('filepicker:setRoot', root);
        return;
      }
    }
    console.warn("Can't find drive", drive_id);
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
      njds.drivesDetail(drives, function(err, data) {
        for (var i in data) {
          $scope.drives_local[data[i].drive] = data[i].mountpoint;
        }

        /*
        for (var i in $scope.drives_available) {
          var drive_id = $scope.drives_available[i].drive_id;
          if (drive_id in $scope.drives_local) {
            $scope.drives_available[i].mount = $scope.drives_local[drive_id];
          }
        }
        console.log('Found local drives', $scope.drives_local);*/
      });
    });
  }
}])

