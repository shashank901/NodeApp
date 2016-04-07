/**
 * Created by chris on 4/2/2016.
 */

var express = require('express');
var router = express.Router();
var user = require('../models/user');

var bcrypt = require('bcrypt-nodejs');                  // hashes user passwords
var async = require('async');                           // avoids dealing with nested callbacks (is this needed?)
var crypto = require('crypto');                         // generates random tokens for pw reset
var nodemailer = require('nodemailer');                 // nodemailer for email
var smtpTransport = require("nodemailer-smtp-transport")    // nodemailer smtp
var mg = require('nodemailer-mailgun-transport');       // transport for mailgun email provider (free)

var passport = require('../middleware/passport').passport;          // passport middleware
var config = require('../config');                               //configuration metadata

    var User = user.User;

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

    router.get('/signup', function(req, res) {
            res.render('signup', {
                user: req.user
            });
        });

    router.post('/signup', function(req, res) {
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
        });

    router.get('/login', function(req, res) {
            res.render('login', {
                user: req.user
            });
        });

    router.post('/login', function(req, res, next) {
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
                    console.log("user");
                    if (err) {
                        console.log("error");
                        return next(err);
                    }
                    return res.redirect('/');
                });
            })(req, res, next);
        });

    router.get('/logout', function(req, res){
            req.logout();
            res.redirect('/');
        });

    router.get('/forgot', function (req, res) {
            res.render('forgot', {
                user: req.user
            });
        });

    router.post('/forgot', function (req, res, next) {
            async.waterfall([
                function (done) {
                    crypto.randomBytes(20, function (err, buf) {
                        var token = buf.toString('hex');
                        done(err, token);
                    });
                },
                function (token, done) {
                    User.findOne({email: req.body.email}, function (err, user) {
                        if (!user) {
                            req.flash('error', 'No account with that email address exists.');
                            return res.redirect('/forgot');
                        }

                        user.resetPasswordToken = token;
                        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                        user.save(function (err) {
                            done(err, token, user);
                        });
                    });
                },
                function (token, user, done) {

                    // This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
                    var auth = config.mailgun_auth;
                    var auth = {
                        auth: {
                            api_key: 'key-9901bf3d7db4cc2015f053eca3ab3f78',
                            domain: 'sandbox4800aadfa17a40db985824c28c218a14.mailgun.org'
                        }
                    }
                    var transporter = nodemailer.createTransport(mg(auth));

                    var mailOptions = {
                        to: user.email,
                        from: 'passwordreset@demo.com',
                        subject: 'Node.js Password Reset',
                        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message sent: ' + info.response);
                    });
                }
            ], function (err) {
                if (err) return next(err);
                res.redirect('/forgot');
            });
        });

    router.get('/reset/:token', function(req, res) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('/forgot');
                }
                res.render('reset', {
                    user: req.user
                });
            });
        });

    router.post('/reset/:token', function(req, res) {
            async.waterfall([
                function(done) {
                    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                        if (!user) {
                            req.flash('error', 'Password reset token is invalid or has expired.');
                            return res.redirect('back');
                        }

                        user.password = req.body.password;
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function(err) {
                            req.logIn(user, function(err) {
                                done(err, user);
                            });
                        });
                    });
                },
                function(user, done) {
                    var smtpTransport = nodemailer.createTransport('SMTP', {
                        service: 'SendGrid',
                        auth: {
                            user: '!!! YOUR SENDGRID USERNAME !!!',
                            pass: '!!! YOUR SENDGRID PASSWORD !!!'
                        }
                    });
                    var mailOptions = {
                        to: user.email,
                        from: 'passwordreset@demo.com',
                        subject: 'Your password has been changed',
                        text: 'Hello,\n\n' +
                        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                    };
                    smtpTransport.sendMail(mailOptions, function(err) {
                        req.flash('success', 'Success! Your password has been changed.');
                        done(err);
                    });
                }
            ], function(err) {
                res.redirect('/');
            });
        });

module.exports = router;
