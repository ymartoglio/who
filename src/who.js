var Promise = require('promise'),
    merge   = require('merge');

// TODO
// allow crypt password
// allow other mongodb driver
// open option object


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

/**
 * Find a user in 'userCollection', corresponding to 'who.login'
 * @param mongoose
 * @param who
 * @param userCollection
 * @returns {*}
 */
function getUser(mongoose,who,userCollection){
    var userModel = mongoose.model(userCollection);
    var criteria = new Object();
    if(who.login && typeof(who.login) === typeof("string") && who.login != ""){
        criteria[DEFAULT_WHO_USER_LOGIN] = who.login;
        return userModel.findOne(criteria);
    }
    return null;
}

/**
 * Check if the password of the found user is matching with the 'who.password' parameter
 * @param who
 * @param user
 * @returns {boolean}
 */
function passwordCheck(who,user){
    return (user[DEFAULT_WHO_USER_PASSWORD] === who.password);
}

function checkWhoDataInput(who){
    return (who.login && typeof(who.login) === 'string' &&
            who.password && typeof(who.password) === 'string')
}

/**
 * Check if a user represented by the 'who' object in the mongodb collection, accessed through the mongoose descriptor, described in 'options.mongoose' object exists.
 * @param mongoose - mongoose connection object descriptor
 * @param who - object with a 'login' and a 'password' property
 * @param options
 * @returns {*} - a Promise object returning a user mongoose's model instance, or a rejected Promise
 */
exports.check = function(mongoose,who,options)  {
    options = merge({},defaultOptions,options || {});
    if(mongoose){
        if(checkWhoDataInput(who)){
            var userQuery = getUser(mongoose,who,options.mongoose.schema);
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
                },function(error){
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
