angular.module('sibilla')

.factory('Document', ['$resource', 'Preferences',
    function($resource, Preferences) {

  return $resource(Preferences.get('server') + '/api/docs/:docId/',
    {'docId': '@id'}, {
    query: {method: 'GET', isArray: true,
      transformResponse: function(data, headers) {
        return angular.fromJson(data).data;
      }
    },
    update: {method: 'PUT'}
  });

}])

.factory('Category', ['$resource', 'Preferences',
    function($resource, Preferences) {

  return $resource(Preferences.get('server') + '/api/categories/', {},
    {
      query: {method: 'GET', isArray: true,
        transformResponse: function(data, headers) {
          return angular.fromJson(data).data;
        }
      },
      update: {method: 'PUT'}
    }
  );
}])

