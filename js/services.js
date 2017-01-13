/**
 * Created by BogdanV
 */

angular.module('RoleService', [])
    .factory('ROLE', function($rootScope){
        var perm = {};
        $rootScope.user = null;

        perm.checkPermissionForView = function(view) {
            if (!view.requiresAuthentication) {
                return true;
            }
            return userHasPermissionForView(view);
        };

        var userHasPermissionForView = function(view){
            if(!perm.isLoggedIn()){
                alert("Nu ai voie aici!");
                return false;
            }
            if(!view.permissions || !view.permissions.length){
                return true;
            }
            return perm.userHasPermission(view.permissions);
        };

        perm.userHasPermission = function(permissions){
            if(!perm.isLoggedIn()){
                return false;
            }
            var found = false;
            $rootScope.$watch('user', function(){ }, true);
            angular.forEach(permissions, function(permission, index){
                if ($rootScope.user.userProps.rol.indexOf(permission) >= 0){
                    found = true;
                }
            });
            return found;
        };

        perm.currentUser = function(){
            return $rootScope.user;
        };

        perm.isLoggedIn = function(){
            return $rootScope.user != null;
        };

        return perm;
    });