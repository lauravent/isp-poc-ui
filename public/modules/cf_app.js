angular.module('myIspApp', [])
   .controller('SessionController',['$http',function($http){
	    this.session=state;
		state.accounts=server_user.payments;
		state.loggedIn=server_user.facebook;
        state.operation.ordinante= state.loggedIn.name;
   }])
   .controller('PreferencesController',['$http',function($http){
	   this.accounts=state.accounts;
	   this.setAccount=function(id){
		   state.progress+=33;
		   state.account=state.accounts[id];
		   state.operation.method= state.account.method;
		   state.view++;
	   };
   }])
   .controller('FriendsController',['$http',function($http){
	   
	   this.getFriends=function(){
		     $http.get('/api/friendSearch')
			   .then(function success(data){
				   state.friends=data.data.data;				   
		       },function fail(data){
			      console.log("FAIL!!!!" + JSON.stringify(data));
		      });
		};
		
	   this.setFriend=function(index){
		   console.log(index);
		  state.friend=state.friends[index];
		  state.operation.beneficiario=state.friend.first_name + " " + state.friend.last_name;
		  state.progress+=33;
		  state.view++;
	   };
	   this.getFriends();
   }])
      .controller('PaymentController',['$http',function($http){
	   this.amount=1.23;
	   this.pay=function(){
			   state.amount=""+this.amount;
			   state.operation.amount=state.amount;
			   $http.post('/api/pay',state.operation).then(function success(data){
				   state.progress+=34;
				   state.result=data.data.status;
				   state.view++;
				   console.log(data);
			   },function fail(){
				   alert('error');
			   });
			   
	   };
   }])   
;

var state={
	progress: 0,
	view: 0,
	operation: {	}
};



var friendList= [
	{ id:0 ,name: "Roberto Pozzi"},
	{ id:1 ,name: "Massimo Poli"},
	{ id:2 ,name: "Alessandra Brasca"}
];