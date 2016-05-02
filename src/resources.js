var hide_id_from_data = function(data, headers) {
  delete data.id;
  return angular.toJson(data);
}

var get_data_from_response = function(data, headers) {
  return angular.fromJson(data).data;
}

var build_resource = function($resource, Preferences, path, params) {
  return $resource(Preferences.get('server') + path,
    params,
    {
      query: {method: 'GET', isArray: true,
        transformResponse: get_data_from_response
      },
      update: {method: 'PUT',
        transformRequest: hide_id_from_data
      }
    }
  )
}

angular.module('sibilla')

.config(function($resourceProvider) {
  $resourceProvider.defaults.stripTrailingSlashes = false;
})

.factory('Document', ['$resource', 'Preferences',
    function($resource, Preferences) {
      return build_resource($resource, Preferences, '/api/docs/:id/', {'id': '@id'});
    }
])

.factory('Category', ['$resource', 'Preferences',
    function($resource, Preferences) {
      return build_resource($resource, Preferences, '/api/categories/:id/', {'id': '@id'});
    }
])

.factory('Tag', ['$resource', 'Preferences',
    function($resource, Preferences) {
      return build_resource($resource, Preferences, '/api/tags/:id/', {'id': '@id'});
    }
])

.factory('Drive', ['$resource', 'Preferences',
    function($resource, Preferences) {
      return build_resource($resource, Preferences, '/api/drives/:id/', {'id': '@id'});
    }
])

