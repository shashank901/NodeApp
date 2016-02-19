/**
 * Created by chris.coleman on 2/17/2016.
 */
var async = require('async');
var crypto = require('crypto')
require('./models/user')(app);

module.exports = function(app) {


    app.get('/forgot', function (req, res) {
        res.render('forgot', {
            user: req.user
        });
    });

    app.post('/forgot', function (req, res, next) {
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
}