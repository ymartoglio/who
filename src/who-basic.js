var who = require('./who.js');
var merge = require('merge');
var Promise = require('promise');
var basicAuth = require('basic-auth');

//automatically look for user
//if available set session

//require body-parser
//reuire express-session
//who
var defaultOptions = {
    returnWhenNotFound : {success:0,explain:"[NOT_AUTHORIZED]",data:null}
};


module.exports = function(mongoose,options){
    options = merge({},defaultOptions,options);
    return function(req){
        if(req){
            var user = basicAuth(req);
            if(user){
                var whoPromise = who.check(mongoose,{login:user.name,password:user.pass});
                return whoPromise.then(function(userAccount){
                    return userAccount;
                }, function(err){
                    var message = options.returnWhenNotFound;
                    message.data = err;
                    return message;
                });
            }
        }
        return new Promise(function(resolve,reject){
            reject(options.returnWhenNotFound);
        });
    };
};
