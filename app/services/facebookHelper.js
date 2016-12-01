// load "facebook-node-sdk" module
// for more info, see: https://www.npmjs.com/package/fb
var FB = require('fb');
// load up the user model
var User = require('../models/user');
// load the auth variables
var configAuth = require('../../config/auth');
// load https madule
var https = require('https');

var app_Access_Token = '';

var facebook = module.exports = {

	init : function(user) {
		console.log("[facebookHelper] FUNCTION init...");
		FB.options({
			appId : configAuth.facebookAuth.clientID,
			appSecret : configAuth.facebookAuth.clientSecret,
			redirectUri : configAuth.facebookAuth.callbackURL,
			accessToken : user.facebook.token
		});

		FB.api('me', function(res) {
			console.log("[facebookHelper] API me ...");
			if (!res || res.error) {
				console.log(!res ? 'error occurred' : res.error);
				return;
			}
			console.log("[facebookHelper] API me - id = " + res.id);
			console.log("[facebookHelper] API me - name = " + res.name);
		});

		FB.api('me', {
			fields : [ 'email', 'id', 'name' ]
		}, function(res) {
			console.log("[facebookHelper] API (with fields) me ...");
			if (!res || res.error) {
				console.log(!res ? 'error occurred' : res.error);
				return;
			}
			console.log("[facebookHelper] API me (with fields) - id = " + res.id);
			console.log("[facebookHelper] API me (with fields) - name = " + res.name);
			console.log("[facebookHelper] API me (with fields) - email = " + res.email);
		});
		
		FB.api('me/friends', {
			fields : [ 'first_name','last_name','birthday' ]
		}, function(res) {
			console.log("[facebookHelper] API me/friends ...");
			if (!res || res.error) {
				console.log(!res ? 'error occurred' : res.error);
				return;
			}
		});

		// To get an autogenerated app access token
		FB.api('/oauth/access_token', {
			"client_id" : FB.options('appId'),
			"client_secret" : FB.options('appSecret'),
			"grant_type" : "client_credentials"
		}, function(res) {
			console.log("[facebookHelper] API /oauth/access_token ...");
			if (!res || res.error) {
				console.log(!res ? 'error occurred' : res.error);
				return;
			}
			console.log(res);
		});
	},

	friendSearch : function(query, type, callback) {
		console.log("[facebookHelper] FUNCTION friendSearch...");
		console.log("[facebookHelper] FUNCTION friendSearch type = " + type);
		console.log("[facebookHelper] FUNCTION friendSearch query = " + query);
		
		FB.api('me/friends', {
			"type" : type,
			"q" : query,
			"fields" : "first_name,last_name",
			"redirect_uri" : FB.options('redirectUri')
		}, function(res) {
			console.log("[facebookHelper] FUNCTION friendSearch API me/friends ...");
			if (!res || res.error) {
				console.log(!res ? 'error occurred' : res.error);
				return;
			}
			console.log("[facebookHelper] FUNCTION friendSearch response = " + JSON.stringify(res));
			callback(res);
		});

	},
	
	search : function(query, type, callback) {
		console.log("[facebookHelper] FUNCTION search...");
		FB.api('/search', {
			"type" : type,
			"q" : query,
			"fields" : "id,name,category,about,likes,picture{url},link",
			"redirect_uri" : FB.options('redirectUri'),
			"limit": 5
		}, function(res) {
			console.log("[facebookHelper] FUNCTION search API /search ...");
			if (!res || res.error) {
				console.log(!res ? 'error occurred' : res.error);
				return;
			}
			callback(res);
		});
	},

	getMe : function(token, callback) {
		console.log("[facebookHelper] FUNCTION getMe - token = " + token);
		
		FB.options({
			appId : configAuth.facebookAuth.clientID,
			appSecret : configAuth.facebookAuth.clientSecret,
			redirectUri : configAuth.facebookAuth.callbackURL,
			accessToken : token
		});

		FB.api('me', {
			"fields" : "email, id, name, accounts{id,name,category,link,likes}"
		}, function(res) {
			console.log("[facebookHelper] FUNCTION getMe API me ...");
			if (!res || res.error) {
				console.log(!res ? 'error occurred' : res.error);
				return;
			}
			console.log(res);
			callback(res);
		});

	},

	getPage : function(pageid, callback) {
		console.log("[facebookHelper] FUNCTION getPage...");
		var call = "/" + pageid + "/feed";
		FB.api(call, {
			"fields" : "id,story,message,comments"
		}, function(res) {
			if (!res || res.error) {
				console.log(!res ? 'error occurred' : res.error);
				return;
			}
			console.log(res);
			var response = res.data;
			callback(res);
		});
	},

	getPaging : function(url, callback) {
		console.log("[facebookHelper] FUNCTION getPaging...");
		https.get(url, function(res) {
			res.setEncoding('utf-8');
			// console.log('statusCode: ', res.statusCode);
			// console.log('headers: ', res.headers);
			// initialize the container for our data
			var response = "";

			res.on('data', function(data) {
				// append this chunk to our growing 'response' var
				response += data;
			});

			res.on('error', function(e) {
				console.error(e);
			});

			res.on("end", function() {
				var jsonResponse = JSON.parse(response);
				console.log(jsonResponse);
				callback(jsonResponse);
			});
		});
	},

	// me/accounts?fields=category,name,id,link,perms
	getAccounts : function(callback) {
		console.log("[facebookHelper] FUNCTION getAccounts...");
		FB.api("/me/accounts", {
			"fields" : "id,name,category,link,perms"
		}, function(res) {
			if (!res || res.error) {
				console.log(!res ? 'error occurred' : res.error);
				return;
			}
			console.log(res);
			// Qui ci puo essere una logia di concatenazione di chiamate per
			// recupero/visualizzazione/scelta account
			// di cui l'utente e amministratore
			// getPageFans(res.data[0].id);
			callback(res);
		});

	},

	getPageFans : function(pageId, callback) {
		console.log("[facebookHelper] FUNCTION getPageFans...");
		FB.api("/" + pageId + "/insights/page_fans_city/lifetime",
				function(res) {
					if (!res || res.error) {
						console.log(!res ? 'error occurred' : res.error);
						return;
					}
					console.log(res);
					callback(res);
				});
	},
	
	getPageFansGenderAge : function(pageId, callback) {
		console.log("[facebookHelper] FUNCTION getPageFansGenderAge...");
		FB.api("/" + pageId + "/insights/page_fans_gender_age/lifetime",
			function(res) {
				if (!res || res.error) {
					console.log(!res ? 'error occurred' : res.error);
					return;
				}
				console.log(res);
				callback(res);
			});
	}
};