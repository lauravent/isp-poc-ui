/**
 * http://usejsdoc.org/
 */
angular.module('fbModuleApp.controllers', []).

	/*fbPageController*/	
	controller('fbPageController',
		function($scope, $routeParams, facebookAPIservice) {
			$scope.id = $routeParams.id;
		    $scope.posts = [];
		    $scope.postsPaging = {};
		    
		    console.log("***LOG CONTROLLER: "+JSON.stringify($routeParams,null,2));
		    
		    facebookAPIservice.getPaymentMethod($scope.id).success(function(response) {
		    	$scope.posts = response.data;
		    	$scope.postsPaging = response.paging;
		    });
		}
	).

	/*fbSearchController*/
	controller('fbFriendsController',
		function($scope, facebookAPIservice) {
		
			$scope.nameFilter = null;
			$scope.searchPage = '';
			$scope.searchResults = [];
			$scope.searchResultsPaging = {};
			$scope.searchFilter = function (result) {
			    var keyword = new RegExp($scope.nameFilter, 'i');
			    return !$scope.nameFilter || keyword.test(result.first_name)|| keyword.test(result.last_name) || keyword.test(result.id);
			};
			
			facebookAPIservice.getSearchResults($scope.searchPage).success(function(response) {
				$scope.searchResults = response.data;
				$scope.searchResultsPaging = response.paging;
			});
			$scope.friendSearch = function(){
				facebookAPIservice.getSearchResults($scope.searchPage).success(function(response) {
					console.log("Search results.");

					$scope.searchResults = response.data;
					$scope.searchResultsPaging = response.paging;
				});
			};
			$scope.next = function(){
				facebookAPIservice.getPaging($scope.searchResultsPaging.next).success(function(response) {
					$scope.searchResults = response.data;
					$scope.searchResultsPaging = response.paging;
				});
			};
			$scope.previous = function(){
				facebookAPIservice.getPaging($scope.searchResultsPaging.previous).success(function(response) {
					$scope.searchResults = response.data;
					$scope.searchResultsPaging = response.paging;
				});
			};
		}
	);