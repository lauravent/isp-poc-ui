/**
 * http://usejsdoc.org/
 */
angular.module('fbModuleApp.services', []).factory('facebookAPIservice',
		function($http) {

			var facebookAPI = {};

			facebookAPI.getSearchResults = function(query) {
				return $http({
					method : 'GET',
					url : '/api/friendSearch',
					headers : {
						'Content-Type' : 'application/json'
					},
					params : {
						q : query
					}
				});
			}
			
			//Metodo che permette di effettuare il pagamento
			facebookAPI.getPaymentMethod = function(userID) {
				return $http({
					method : 'GET',
					url : '/api/page',
					headers : {
						'Content-Type' : 'application/json'
					},
					params : {
						id : userID
					}
				});
			}
			
			facebookAPI.getPaging = function(urlPaging) {
				return $http({
					method : 'GET',
					url : '/api/paging',
					headers : {
						'Content-Type' : 'application/json'
					},
					params : {
						paging : urlPaging
					}
				});
			}

			return facebookAPI;
		});