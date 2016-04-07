/**
 * Created by chris on 4/4/2016.
 */
var passport = require('../../middleware/passport').passport;          // passport middleware

module.exports = function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            //req.flash('error', 'No account with that email address exists.');
            console.log("no user found");
            return res.redirect('/login')
        }
        req.logIn(user, function(err) {
            console.log("user");
            if (err) {
                console.log("error");
                return next(err);
            }
            return res.redirect('/');
        });
    })(req, res, next);
};