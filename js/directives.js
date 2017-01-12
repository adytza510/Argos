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
    });
