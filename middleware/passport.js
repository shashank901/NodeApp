/**
 * Created by chris.coleman on 2/19/2016.
 */

var passport = require('passport');                     // passport for authentication
var LocalStrategy = require('passport-local').Strategy; // passport local strategy
var user = require('../models/user');

var User = user.User;

passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Incorrect username.' });
        user.comparePassword(password, function(err, isMatch) {
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        });
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

module.exports = {
    passport : passport
}