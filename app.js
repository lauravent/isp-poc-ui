// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// create a new express server
var app = express();
var port = (process.env.VCAP_APP_PORT || 8082);

// Configuration settings 
var configAuth = require('./config/auth');
console.log("[app] Authentication Callback URL : " + configAuth.facebookAuth.callbackURL);

// Flash is a special area of the session used for storing messages
var flash = require('connect-flash');
// get logger
var logger = require('morgan');
// get cookie parser
var cookieParser = require('cookie-parser');
// get html forms parser
var bodyParser = require('body-parser');
// get session manager
var session = require('express-session');

// set up our express application
app.use(logger('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
//set up ejs for templating
app.set('view engine', 'ejs');
// get passport to perfom facebook access
var passport = require('passport');
require('./config/passport')(passport);
app.use(session({ secret: configAuth.facebookAuth.clientSecret,
		resave: true,
		saveUninitialized: true})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
// load our routes and pass in our app and fully configured passport
require('./app/routes.js')(app, passport); 

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// launch ======================================================================
app.listen(port);
console.log('[app] The magic happens on port ' + port);