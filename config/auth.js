// expose our config directly to our application using module.exports
module.exports = {
		// ====== Alessandro Guerrera Facebook application
		/*'facebookAuth' : {
			'clientID' 		: '171283119932763', // your App ID
			'clientSecret' 	: '8ab9c542fdc44dfad735e075eaa99b8e', // your App Secret
			'callbackURL' 	: '/auth/facebook/callback'
		},*/
		// ====== Roberto Pozzi Facebook application
		'facebookAuth' : {
			'clientID' 		: '1031295976946976', // your App ID
			'clientSecret' 	: '03b1711bdcc4b930e269a8b107bf26f8', // your App Secret
			'callbackURL' 	: '/auth/facebook/callback'
		},
		'twitterAuth' : {
			'consumerKey' 		: 'your-consumer-key-here',
			'consumerSecret' 	: 'your-client-secret-here',
			'callbackURL' 		: 'http://localhost:8080/auth/twitter/callback'
		},

		'googleAuth' : {
			'clientID' 		: 'your-secret-clientID-here',
			'clientSecret' 	: 'your-client-secret-here',
			'callbackURL' 	: 'http://localhost:8080/auth/google/callback'
		}
};