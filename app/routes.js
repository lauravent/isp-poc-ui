var facebook = require("./services/facebookHelper");
var http = require("http");
//Access, read and use environment variables
var conf = require('../config/conf');
var bluemixHelperConfig = require('bluemix-helper-config');
var configManager = bluemixHelperConfig.configManager;
/* ============== User Microservice configuration - START ============== */
var paymentMicroserviceUrl = (configManager.get(conf.constants.PAYMENT_MICROSERVICE_URL) || "isp-poc-payments-ws.mybluemix.net");
var paymentMicroservicePort = (configManager.get(conf.constants.PAYMENT_MICROSERVICE_PORT) || "80");
console.log("[routes] Payment Microservice Url = " + paymentMicroserviceUrl);
console.log("[routes] Payment Microservice Port = " + paymentMicroservicePort);
/* ============== User Microservice configuration - END ============== */
module.exports = function(app, passport) {
	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});
	/* CF - START */
	app.get('/cf/profile',function(req,res){
		res.render('cf/profile.ejs',{
			user : req.user
		});
	});
    /* CF - END */
	
	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});
	
	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', function(req, res) {	
		console.log("[routes] FUNCTION /profile: "+req.user.email);
		res.redirect('/cf/profile');
	});

	// =====================================
	// FACEBOOK ROUTES =====================
	// =====================================
	// route for facebook authentication and login
	// Redirect the user to Facebook for authentication.  When complete,
	// Facebook will redirect the user back to the application at /auth/facebook/callback
	app.get('/auth/facebook', 
		passport.authenticate('facebook',
				{ scope : ['email,user_friends,public_profile,publish_actions,manage_pages,publish_pages,pages_show_list'] }));

	// handle the callback after facebook has authenticated the user
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/profile',
			failureRedirect : '/'
		}));
	
	// =====================================
	// BLUEMIX SSO ROUTES =================
	// =====================================
	//app.get('/auth/facebook', passport.authenticate('openidconnect', {})); 
	
	// handle the callback after facebook has authenticated the user
	app.get('/auth/sso/callback',
		passport.authenticate('openidconnect', {
			successRedirect : '/profile',
			failureRedirect : '/'
		}));

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	
	// =====================================
	// FACEBOOK INSIGHT PAGE ===============
	// =====================================
	// show the Facebook Insight page
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/fbFriendsMain', isLoggedIn, function(req, res) {				
		res.render('fbFriendsMain.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});
	// =====================================
	// FACEBOOK INSIGHT PAGE ===============
	// =====================================
	// API call to get Facebook response
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	
	app.get('/api/friendSearch', isLoggedIn, function(req, res) {
		console.log("[routes] FUNCTION /api/friendSearch...");
		// we pass the user to make facebook calls
		console.log("[routes] FUNCTION /api/friendSearch - req.user = " + JSON.stringify(req.user));
		facebook.init(req.user);
		facebook.friendSearch(req.param("q"),'page', function(response){
			res.json(response);
		});
	});
	
	app.get('/api/page', isLoggedIn, function(req, res) {
		console.log("[routes] FUNCTION /api/page...");
		// we pass the user to make facebook calls
		facebook.init(req.user);
		facebook.getPage(req.param("id"), function(response){
			res.json(response);
		});
	});
	
	app.get('/api/paging', isLoggedIn, function(req, res) {
		console.log("[routes] FUNCTION /api/paging...");
		// we pass the user to make facebook calls
		facebook.init(req.user);
		facebook.getPaging(req.param("paging"), function(response){
			res.json(response);
		});
	});
	
	/* CF - START*/
	app.post('/api/pay', function(req, res) {
		console.log("[routes] FUNCTION /api/pay...");
		console.log(JSON.stringify(req.body));
		var options = {
				  host:  paymentMicroserviceUrl,
				  path: '/isp-poc-payments-java/service/payments/pay',
				  method: 'POST'
				};

				var req1 = http.request(options, function(res1) {
				  console.log('[routes] STATUS: ' + res1.statusCode);
				  console.log('[routes] HEADERS: ' + JSON.stringify(res1.headers));
				  res1.setEncoding('utf8');
				  res1.on('data', function (chunk) {
				    console.log('[routes] BODY: ' + chunk);
					res.send(chunk);					
				  });
				})
				req1.write(JSON.stringify(req.body))
				req1.end();
	});
	/* CF - END */
};

// route middleware to make sure
function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()){
		console.log('[routes] USER AUTHENTICATED : ' + JSON.stringify(req.user));
		return next();
	}
	console.log('[routes] USER NOT AUTHENTICATED');
	res.redirect('/');
}