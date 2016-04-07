/**
 * Created by chris on 4/2/2016.
 */

var express = require('express');
var router = express.Router();
var user = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Project',
        user: req.user
    });
});

module.exports = router;
