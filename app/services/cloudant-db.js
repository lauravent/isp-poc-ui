// Cloudant credentials configuration
var db = {};
var dbCredentials = {};
var dbname = "users_prova";
dbCredentials.host = "cfa312e1-1322-489b-9f16-97c73f22fe24-bluemix.cloudant.com";
dbCredentials.port = 443;
dbCredentials.user = "cfa312e1-1322-489b-9f16-97c73f22fe24-bluemix";
dbCredentials.password = "95ae04659518c574106df92be8de0dea3c41e2030eaf37d43b6c2766c7ff160d";
dbCredentials.url = "https://cfa312e1-1322-489b-9f16-97c73f22fe24-bluemix:95ae04659518c574106df92be8de0dea3c41e2030eaf37d43b6c2766c7ff160d@cfa312e1-1322-489b-9f16-97c73f22fe24-bluemix.cloudant.com";
var cloudant = require('cloudant')(dbCredentials.url);

CouldantAPI = function(){
	if(this.db == undefined){
		this.db = cloudant.use(dbname);
	}
};

CouldantAPI.prototype.find = function(key) {
	var resp;
	this.db.find({
		selector : {
			_id : key
		}
	}, function(err, result) {
		resp = result;
		if (err) {
			resp = err;
		}
		if (result.docs.length == 0) {
			console.log("[cloudant-db] data was not found");
		}	

	});
	while(!resp) {
		require('deasync').runLoopOnce();
	}
	return resp;

};

CouldantAPI.prototype.update = function(obj) {
	var db = this.db;
	db.get(obj._id,function(err, doc) {
		if (!err) {
			obj["_rev"]=doc._rev;
			db.insert(obj, function(err1, doc) {
				if(err1) {
					console.log('[cloudant-db] Error inserting data\n'+err);
				}
				
				else {
					console.log("[cloudant-db] insert successful");
				}
			});
		}
		else {
			console.log("[cloudant-db] get error: "+err);
		}
	});
};

CouldantAPI.prototype.insert = function(data) {
	this.db.insert(data, function(err, doc) {
		if (err) {
			console.log(err);
		} else {
			console.log("[cloudant-db] created!");
			return data;
		}
	});
};

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
module.exports = CouldantAPI;