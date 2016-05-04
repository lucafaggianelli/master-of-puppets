var hide_id_from_data = function(data, headers) {
  delete data.id;
  return angular.toJson(data);
}

var get_data_from_response = function(data, headers) {
  return angular.fromJson(data).data;
}

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
}

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
])

