var Promise = require('promise'),
    merge   = require('merge');

// TODO
// allow crypt password
// allow other mongodb driver
// open option object
// filter password before using data


const DEFAULT_WHO_MONGOOSE_SCHEMA = "User";
const DEFAULT_WHO_USER_LOGIN = "email";
const DEFAULT_WHO_USER_PASSWORD = "password";


var defaultOptions = {
    mongoose : {
        schema : DEFAULT_WHO_MONGOOSE_SCHEMA,
        userLoginKey : DEFAULT_WHO_USER_LOGIN,
        userPasswordKey : DEFAULT_WHO_USER_PASSWORD
    },
    passwordCheck : passwordCheck
};


function getUser(mongoose,who){
    var userModel = mongoose.model(DEFAULT_WHO_MONGOOSE_SCHEMA);
    var criteria = new Object();
    if(who.login && typeof(who.login) === typeof("string") && who.login != ""){
        criteria[DEFAULT_WHO_USER_LOGIN] = who.login;
        return userModel.findOne(criteria);
    }
    return null;
}

function passwordCheck(who,user){
    return (user[DEFAULT_WHO_USER_PASSWORD] === who.password);
}

function checkWhoDataInput(who){
    return (who.login && typeof(who.login) === 'string' &&
            who.password && typeof(who.password) === 'string')
}

/*
    mongoose : mongoose instance
    who : object {login:"",password:""}
    return a Mongoose promise of a user
*/
exports.check = function(mongoose,who,options)  {
    options = merge({},defaultOptions,options || {});
    if(mongoose){
        if(checkWhoDataInput(who)){
                var userQuery = getUser(mongoose,who);
                if(userQuery){
                    var userPromise = userQuery.exec();
                    return userPromise.then(function(user){
                        if(user){
                            if(typeof(options.passwordCheck) === 'function'){
                                if(options.passwordCheck(who,user)){
                                    return user;
                                }
                            }
                        }
                        return null;
                    }
                    ,function(error){
                        return error;
                    });
                }
        }else{
            console.error("Who is nobody");
            return new Promise(function(resolve,reject){
                reject("Who is nobody");
            });
        }
    } else {
        console.error("Mongoose not set");
        return new Promise(function(resolve,reject){
            reject("Mongoose not set");
        });
    }
};
