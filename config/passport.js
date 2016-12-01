var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../app/models/user');
var http = require('http');
// Access, read and use environment variables
var conf = require('./conf');
var bluemixHelperConfig = require('bluemix-helper-config');
var configManager = bluemixHelperConfig.configManager;
/* ============== User Microservice configuration - START ============== */
var userMicroserviceUrl = (configManager.get(conf.constants.USER_MICROSERVICE_URL) || "isp-poc-users.mybluemix.net");
var userMicroservicePort = (configManager.get(conf.constants.USER_MICROSERVICE_PORT) || "80");
console.log("[passport] User Microservice Url = " + userMicroserviceUrl);
console.log("[passport] User Microservice Port = " + userMicroservicePort);
/* ============== User Microservice configuration - END ============== */
/* ############## Authentication Strategy configuration - START ############## */
var authenticationStrategyKey = (configManager.get(conf.constants.AUTHENTICATION) || "facebook");
var authenticationStrategy = conf.getAuthenticationStrategyConfig(authenticationStrategyKey);
/* ############## Authentication Strategy configuration - END ############## */
// load the auth variables
var configAuth = require('./auth');

// ********** Cloudant init - START
var db = {};
var dbCredentials = {};
var dbname = "user_preferences";
try {
	console.log("[dbAccess] process.env.VCAP_SERVICES = " + process.env.VCAP_SERVICES);
	var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
	var cloudantService = services.cloudantNoSQLDB[0]; 
	dbCredentials.user = cloudantService.credentials.username;
	dbCredentials.password = cloudantService.credentials.password;
	dbCredentials.host = cloudantService.credentials.host;
	dbCredentials.port = cloudantService.credentials.port;
	dbCredentials.url = cloudantService.credentials.url;
} catch (e) {
	console.log("[dbAccess] VCAP_SERVICES not found, falling back to defaults ...");
	dbCredentials.user = "30ba0ea4-b72d-40b4-b957-7b554f55d385-bluemix";
	dbCredentials.password = "61f1f90fd34dc72b0b2f307faca0b7ef75fb04023cec42028d269843eedfda14";
	dbCredentials.host = "30ba0ea4-b72d-40b4-b957-7b554f55d385-bluemix.cloudant.com";
	dbCredentials.port = 443;
	dbCredentials.url = "https://30ba0ea4-b72d-40b4-b957-7b554f55d385-bluemix:61f1f90fd34dc72b0b2f307faca0b7ef75fb04023cec42028d269843eedfda14@30ba0ea4-b72d-40b4-b957-7b554f55d385-bluemix.cloudant.com";
}
var cloudant = require('cloudant')(dbCredentials.url);
// ********** Cloudant init - END
var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');

function lookup(obj, field) {
    if (!obj) { return null; }
    var chain = field.split(']').join('').split('[');
    for (var i = 0, len = chain.length; i < len; i++) {
      var prop = obj[chain[i]];
      if (typeof(prop) === 'undefined') { return null; }
      if (typeof(prop) !== 'object') { return prop; }
      obj = prop;
    }
    return null;
}

// expose this function to our app using module.exports
module.exports = function(passport) {
	console.log("[passport] Authentication Strategy : " + authenticationStrategyKey);
    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    switch (authenticationStrategyKey) {
	case "facebook":
		passport.use(new FacebookStrategy({
	        // pull in our app id and secret from our auth.js file
	        clientID        : configAuth.facebookAuth.clientID,
	        clientSecret    : configAuth.facebookAuth.clientSecret,
	        callbackURL     : configAuth.facebookAuth.callbackURL
	    },
	    // facebook will send back the token and profile
	    function(token, refreshToken, profile, done) {
	    	console.log("[passport] token : " + token);
	    	console.log("[passport] profile : " + JSON.stringify(profile));
	        process.nextTick(function() {
	            var facebook = require("../app/services/facebookHelper");
	            facebook.getMe(token, function(response){
	            	console.log("[passport] email : " + response.email);
	            	// Use Cloudant query to find the user just based on user name - API REST
	            	// RETURN user from bank DB (JSON)
	            	var user;
	            	var options = {
	      				  host: userMicroserviceUrl,
	            		  port: userMicroservicePort,
						  path : '/getUsers/' + response.email,
	      				  method: 'GET'
	      				};
	            	http.request(options, function(res) {
	            		res.setEncoding('utf8');
	            		var respString = '';
	            		res.on('data', function (data) {
	            			respString += data;
	      				    //Controllo utente
	      				    if(respString == " ")
	      				    	return done(null, false, { message : "Username was not found" } );
	      				    
	      				    var user = JSON.parse(respString);
	      				    console.log("[passport] User found: " + JSON.stringify(user));
	      				    /* ======================= Augment User with token from Facebook authentication - START ======================= */
	      				    user.facebook.token = token;
	      				    console.log("[passport] User updated : " + JSON.stringify(user));
	      				    /* ======================= Augment User with token from Facebook authentication - END ======================= */
	      				    return done(null, user);
	      				  });
	      				}).end();
	            });
	        });
	    }));
		break;
	case "bluemix-sso":
		// =========================================================================
	    // BLUEMIX SSO SERVICE LOGIN ===============================================
	    // ========================================================================= 
	    // VCAP_SERVICES contains all the credentials of services bound to
	    // this application. For details of its content, please refer to
	    // the document or sample of each service.  
	    var services;
	    var ssoConfig;
		var client_id;
		var client_secret;
		var authorization_url;
		var token_url;
		var issuer_id;
		var callback_url;
	    try {
	    	services = (JSON.parse(process.env.VCAP_SERVICES) || servicesConfig);
		} catch (e) {
			services = {
				"SingleSignOn" : [ {
					"name" : "isp-sso",
					"label" : "SingleSignOn",
					"plan" : "standard",
					"credentials" : {
						"secret" : "hAuX02yIA0",
						"tokenEndpointUrl" : "https://isp-sso-dg9tbzdikv-cp16.iam.ibmcloud.com/idaas/oidc/endpoint/default/token",
						"authorizationEndpointUrl" : "https://isp-sso-dg9tbzdikv-cp16.iam.ibmcloud.com/idaas/oidc/endpoint/default/authorize",
						"issuerIdentifier" : "isp-sso-dg9tbzdikv-cp16.iam.ibmcloud.com",
						"clientId" : "KNB18HE712",
						"serverSupportedScope" : [ "openid" ]
					}
				} ]
			};
		}
		ssoConfig = services.SingleSignOn[0];
		client_id = ssoConfig.credentials.clientId;
		client_secret = ssoConfig.credentials.secret;
		authorization_url = ssoConfig.credentials.authorizationEndpointUrl;
		token_url = ssoConfig.credentials.tokenEndpointUrl;
		issuer_id = ssoConfig.credentials.issuerIdentifier;
		callback_url = "/auth/sso/callback";

		var OpenIDConnectStrategy = require('passport-idaas-openidconnect').IDaaSOIDCStrategy;
		var Strategy = new OpenIDConnectStrategy({
			authorizationURL : authorization_url,
			tokenURL : token_url,
			clientID : client_id,
			scope : 'openid',
			response_type : 'code',
			clientSecret : client_secret,
			callbackURL : callback_url,
			skipUserProfile : true,
			issuer : issuer_id
		}, function(iss, sub, profile, accessToken, refreshToken, params, done) {
			console.log("[passport] SSO accessToken : " + accessToken);
	    	console.log("[passport] SSO profile : " + JSON.stringify(profile));
			process.nextTick(function() {
	            var facebook = require("../app/services/facebookHelper");
	            facebook.getMe(token, function(response){
	            	console.log("[passport] email : " + response.email);
	            	// Use Cloudant query to find the user just based on user name - API REST
	            	// RETURN user from bank DB (JSON)
	            	var user;
	            	var options = {
	      				  host: userMicroserviceUrl,
	            		  port: userMicroservicePort,
						  path : '/getUsers/' + response.email,
	      				  method: 'GET'
	      				};
	            	http.request(options, function(res) {
	            		res.setEncoding('utf8');
	            		var respString = '';
	            		res.on('data', function (data) {
	            			respString += data;
	      				    //Controllo utente
	      				    if(respString == " ")
	      				    	return done(null, false, { message : "Username was not found" } );
	      				    
	      				    var user = JSON.parse(respString);
	      				    console.log("[passport] User found: " + JSON.stringify(user));
	      				    /* ======================= Augment User with token from Facebook authentication - START ======================= */
	      				    user.facebook.token = token;
	      				    console.log("[passport] User updated : " + JSON.stringify(user));
	      				    /* ======================= Augment User with token from Facebook authentication - END ======================= */
	      				    return done(null, user);
	      				  });
	      				}).end();
	            });
	        })
		});
		passport.use(Strategy);
		// BLUEMIX SSO SERVICE -END
	default:
		break;
	}
	
	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
    	console.log("[passport] serializeUser : " + JSON.stringify(user));
        done(null, user);
    });

	// used to deserialize the user
	passport.deserializeUser(function(id, done) {
		console.log("[passport] deserializeUser id : " + JSON.stringify(id));
		return done(null, id);
		// ################## [NOT USED] Persist user on Cloudant 
		/*db = cloudant.use(dbname);
		db.find({selector:{_id:id._id}}, function(err, result) {
			var user = result.docs[0];
			console.log("[passport] deserializeUser user : " + JSON.stringify(user));
			return done(null, user);
		});*/
	});

	// =========================================================================
	// LOCAL SIGNUP ============================================================
	// =========================================================================
	// we are using named strategies since we have one for login and one for
	// signup
	// by default, if there was no name, it would just be called 'local'
	passport.use('local-signup', new LocalStrategy({
		// by default, local strategy uses username and password, we will
		// override with email
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true
		// allows us to pass back the entire request to the callback
	}, function(req, username, password, done) {
		// asynchronous
		// User.findOne wont fire unless data is sent back
		process.nextTick(function() {
			// find a user whose email is the same as the forms email
			// we are checking to see if the user trying to login already exists
			console.log("[passport] username " + username);
			var newUser = req.body;
			
			var email = lookup(newUser,'email');
			var emailVerify = lookup(newUser,'emailVerify');
			var passwordIn = lookup(newUser,'password');
			var passwordVerify = lookup(newUser,'passwordVerify');
			
			if(!email || email == "")
			{
				return done(null, false, req.flash('signupMessage',
							'Email is empty.'));
			}
			
			if(email != emailVerify)
			{	
				return done(null, false, req.flash('signupMessage',
							'Email and Email Cofirmation are different.'));
			}
			
			if(!passwordIn || passwordIn == "")
			{
				return done(null, false, req.flash('signupMessage',
							'Password is empty.'));
			}
			
			if(passwordIn != passwordVerify)
			{	return done(null, false, req.flash('signupMessage',
							'Password and Password Confirmation are different.'));
			}
			
			delete newUser.emailVerify;
			delete newUser.passwordVerify;
			newUser._id = email;
					
			newUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
			
	        console.log("[passport] about to call for cloudant");
	        db = cloudant.use(dbname);
	        console.log("[passport] I went and called cloudant");
	        
	        db.find({selector:{_id:email}}, function(err, user) {
				// if there are any errors, return the error
				if (err) {
					return done(err);
				}
				// check to see if there already is a user with that email
				if (user.docs.length>0) {
					console.log("[passport] Found other users with same id");
					return done(null, false, req.flash('signupMessage','That email is already taken.'));
				} else {

					// save the user
					db = cloudant.use(dbname);
					db.insert(
						newUser,
						function(err, doc) {
						if(err) {
							console.log(err);
							// response.sendStatus(500);
						} else {
							console.log("[passport] created!");
							return done(null, newUser);
							// var resp = {"created":true};
							// response.write(JSON.stringify(resp));
							// response.end();
						}
					});
				}

			});

		});

	}));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
	// //////////// CLOUDANT CALL FOR LOGIN //////////////
    passport.use('local-login',new LocalStrategy({
		// by default, local strategy uses username and password, we will
		// override with email
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true
		// allows us to pass back the entire request to the callback
    },
    function(req,username, password, done) {
        // Use Cloudant query to find the user just based on user name
        console.log("[passport] about to call for cloudant");
        var db = cloudant.use(dbname);
        console.log("[passport] I went and called cloudant");
        db.find({selector:{_id:username}}, function(err, result) {
            if (err){
                console.log("[passport] There was an error finding the user: " + err);
                // return done(null, false, JSON.stringify({"reason":"There was
				// an error connecting to the database"}));
                return done(null, false, { message : "There was an error connecting to the database" } );
            } 
            if (result.docs.length == 0){
                console.log("[passport] Username was not found");
                return done(null, false, { message : "Username was not found" } );
            }
            // user was found, now determine if password matches
            var user = result.docs[0];
            	//for(x in result.docs[0]) user[x]=result.docs[0][x];
            
            if (bcrypt.compareSync(password, user.password)) {
                console.log("[passport] Password matches");
                // all is well, return successful user
                return done(null, user);
            } else {
                console.log("[passport] Password is not correct");
                // err = {"reason":"Password is incorrect"};
                return done(null, false, { message :"Password is incorrect"} );
            }                
        });
    }));
    
};