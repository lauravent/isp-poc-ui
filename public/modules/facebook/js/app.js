/**
 * http://usejsdoc.org/
 */
angular.module('fbModuleApp', [
	'fbModuleApp.controllers',
	'fbModuleApp.services',
	'ngRoute' 
	]).config(['$routeProvider', function($routeProvider) {
			$routeProvider.
			when("/friendSearch", {
				templateUrl : "/modules/facebook/partials/friendsResults.html",
				controller : "fbFriendsController"
			}).
			when("/search", {
				templateUrl : "/modules/facebook/partials/searchResults.html",
				controller : "fbSearchController"
			}).
			when("/page/:id", {
				templateUrl : "/modules/facebook/partials/pagePosts.html",
				controller : "fbPageController"
			}).
			otherwise({
				redirectTo : '/friendSearch'
			});
	}]);