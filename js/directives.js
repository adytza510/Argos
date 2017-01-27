angular.module('Directives', ['RoleService'])
    .directive('widget', function(){
        return {
            restrict: 'E',
            scope: {
                title: '@',
                widgetColor: '@',
                glyphicon:'@'
            },
            transclude: true,
            replace: true,
            templateUrl: 'templates/partials/widget.html'
        }
    })
    .directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    })
    .directive('permission', function(ROLE, $timeout) {
        return {
            restrict: 'A',
            scope: {
                permission: '='
            },
            link: function (scope, el, attrs) {
                var hideMe = el[0];
                scope.$watch(ROLE.isLoggedIn, function() {
                    $timeout(function(){
                        if(scope.user !==undefined ){
                            if (!ROLE.userHasPermission(scope.permission) || scope.user.userProps==undefined ) {
                                console.log(ROLE.userHasPermission(scope.permission));
                                hideMe.style.display = "none";
                            }
                        }
                    }, 90);
                }, true);
            }
        }
    });