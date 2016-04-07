/**
 * Created by chris on 4/4/2016.
 */
var passport = require('../../middleware/passport').passport;          // passport middleware
var user = require('../../models/user');                               //User model

module.exports = function(req, res) {
    var user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });
    user.save(function(err) {
        req.logIn(user, function(err) {
            res.redirect('/');
        });
    });
};