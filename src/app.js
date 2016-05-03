const shell = require('electron').shell;
const path = require('path');
const fs = require('fs');
const njds = require('nodejs-disks');
const mime = require('mime-types');

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
      this.docsForm.$update();
    } else {
      this.docsForm.$save();
    }
  };

  $scope.$on('filepicker:onSelect', function(event, file) {
    console.log('filepicker:onSelect', file);
    $scope.docsForm.newFile = file;
  });

  $scope.openFilePicker = function() {
    var drive_id = $scope.docsForm.drive;

    if (drive_id in $scope.drivesMountpoint) {
      var root = $scope.drivesMountpoint[drive_id];
      $scope.$broadcast('filepicker:setRoot', root);
    } else {
      console.warn("Can't find drive", drive_id);
    }
  }

  $scope.openFile = function(doc, revision) {
    var rev = parseInt(revision) || 0;

    if (!doc.files || doc.files.length == 0) {
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
  }
}])

