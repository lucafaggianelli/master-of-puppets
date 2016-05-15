var hide_id_from_data = function(data, headers) {
  delete data.id;
  return angular.toJson(data);
};

var API_VERSION = 2;
var get_data_from_response = function(data, headers) {
  if (API_VERSION == 1) {
    return angular.fromJson(data).data;
  } else if (API_VERSION >= 2) {
    return angular.fromJson(data);
  }
};

var build_resource = function(path) {
  return ['$resource', 'Preferences', 'resourceInterceptor',
    function($resource, Preferences, resourceInterceptor) {

      return $resource(Preferences.get('server') + '/api/' + path + '/:id/',
        {'id': '@id'},
        {
          query: {
            method: 'GET',
            isArray: true,
            //transformResponse: get_data_from_response,
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
  ];
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

.factory('Info', build_resource(''))

.factory('Document', build_resource('docs'))

.factory('Category', build_resource('categories'))

.factory('Tag', build_resource('tags'))

.factory('Drive', build_resource('drives'));

