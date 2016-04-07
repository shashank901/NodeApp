/**
 * Created by chris on 4/4/2016.
 */

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