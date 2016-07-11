var who = require('./who.js');
var merge = require('merge');
var Promise = require('promise');

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
    //console.log("Load who-session ");
    return function(req){
        if(req){
            if(req.session && req.session.user){  
                //Handle cookie session
                return new Promise(function(resolve,reject){
                    if(req.session.user != undefined && req.session.user != null )
                        resolve(req.session.user);
                    else
                        reject(options.returnWhenNotFound);
                });
            }

            if (req.body && req.body.auth){
                //Hangle auth request
                var whoPromise = who.check(mongoose,req.body.auth);
                return whoPromise.then(function(user){
                    if(user){
                        if(req.session){
                            req.session.user = user;
                        }
                    }
                    return user;
                },function(err){
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
