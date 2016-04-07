/**
 * Created by chris on 4/4/2016.
 */

// routes/users/index.js
var router = require('express').Router();

//Views
router.get('/signup', function(req, res) {
    res.render('signup', {
        user: req.user
    });
});
router.get('/login', function(req, res) {
    res.render('login', {
        user: req.user
    });
});
router.get('/forgot', function (req, res) {
    res.render('forgot', {
        user: req.user
    });
});

//Handlers
//TODO: refactor
router.post('/', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('error', 'No account with that email address exists.');
            console.log("no user");
            return res.redirect('/login')
        }
        req.logIn(user, function(err) {
            console.log("user found");
            if (err) {
                console.log("error");
                return next(err);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});
//TODO: refactor
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Project',
        user: req.user
    });
});

router.post('/signup', require('./create-user.js'));

router.post('/login', require('./login-user.js'));

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

router.post('/forgot', require('./forgot-password.js'));

router.get('/reset/:token', require('./get-password-reset.js'));
router.post('/reset/:token', require('./post-password-reset.js'));

module.exports = router;