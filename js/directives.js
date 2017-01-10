angular.module('Directives', [])
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
    .directive('menuTop', function(){
        return {
            restrict: 'E',
            templateUrl: 'templates/partials/menuTop.html',
        }
    })
    .directive('menuLeft', function(){
        return {
            restrict: 'E',
            templateUrl: 'templates/partials/menuLeft.html',
        }
    });
