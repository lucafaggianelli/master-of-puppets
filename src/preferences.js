angular.module('preferences', [])

.controller('PreferencesCtrl', ['$scope', 'Preferences',
    function($scope, Preferences) {
  $scope.prefs = Preferences.get();

  $scope.saveSettings = function() {
    console.log($scope.prefs);
    //Preferences.save($scope.prefs);
  };
}])

