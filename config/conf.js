exports.constants = {
	'USER_MICROSERVICE_URL' : "USER_MICROSERVICE_URL",
	'USER_MICROSERVICE_PORT' : "USER_MICROSERVICE_PORT",
	'PAYMENT_MICROSERVICE_URL' : "PAYMENT_MICROSERVICE_URL",
	'PAYMENT_MICROSERVICE_PORT' : "PAYMENT_MICROSERVICE_PORT",
	'AUTHENTICATION' : "AUTHENTICATION",
};
var authenticationStrategy = {
		// configuration parameters for Bluemix SSO authentication strategy
		'bluemixSso' : {
			'strategy' : "openid"
		},
		// configuration parameters for Facebook authentication strategy
		'facebookAuth' : {
			'clientID' 		: '1031295976946976', // your App ID
			'clientSecret' 	: '03b1711bdcc4b930e269a8b107bf26f8', // your App Secret
			'callbackURL' 	: '/auth/facebook/callback'
		}
};
exports.getAuthenticationStrategyConfig = function getAuthenticationStrategyConfig(key){
	switch (key) {
		case "bluemix-sso":
			return authenticationStrategy.bluemixSso;
		case "facebook":
			return authenticationStrategy.facebookAuth;
		default:
			return authenticationStrategy.facebookAuth;
	}
};