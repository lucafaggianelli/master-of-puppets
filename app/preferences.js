angular.module('sbl-preferences', [])

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
    var prefsDefault = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'preferences.default.json'), 'utf8'));
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

