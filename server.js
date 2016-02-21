/**
 * Created by chris.coleman on 2/17/2016.
 */

// set up ==========================================
var express = require('express');
var app = express();                                    // create our express app
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');                         // log requests to console
var bodyParser = require('body-parser');                // pull information from HTML post
var session = require('express-session');               // passport session mgmt for express
var path = require('path');                             // util to parse filepaths and urls
var favicon = require('static-favicon');                // favicon serving middleware
var cookieParser = require('cookie-parser');            // parses cookies!
var flash = require('express-flash');                   // flash messages for notifications
var config = require('./config');            // configuration metadata
var user = require('./models/user');                    // user model
var passport = require('./middleware/passport').passport;        // passport middleware

// configuration =====================================
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'jade');

// middleware setup
mongoose.connect(config.database_url);
app.use(favicon());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({ secret: 'session secret key' }));    //TODO: ???huh??
app.use(flash());
app.use(passport.initialize());                         //Must come before session()
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
require('./routes/routes')(app);

// startup app
app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});