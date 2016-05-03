angular.module('sibilla')

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
