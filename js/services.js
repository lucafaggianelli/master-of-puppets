angular.module('sibilla')

.factory('Preferences', function() {
  const defaults = JSON.parse(
    fs.readFileSync('preferences.default.json', 'utf8'));
  try {
    var prefs = JSON.parse(
      fs.readFileSync('preferences.json', 'utf8'));
  } catch (err) {
    console.warn("Error reading user prefs", err);
  }

  prefs = angular.extend(defaults, prefs);
  console.log('Preferences', prefs);

  var service = {};

  service.get = function(name) {
    if (!name)
      return prefs;
    else
      return prefs[name];
  };

  service.save = function(new_prefs) {
    angular.copy(prefs, new_prefs);
    fs.writeFileSync(JSON.stringify(new_prefs, null, 2));
  };

  return service;
})

