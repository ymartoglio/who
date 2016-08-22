const who = require('./src/who.js'),
      whoSession = require('./src/who-session.js'),
      whoBasic = require('./src/who-basic.js');

module.exports = {
    who : who,
    session : whoSession,
    basic : whoBasic
};

