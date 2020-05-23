var config = require('../../config.json');
var express = require('express');
var router = express.Router();
var session = require('express-session');

var item = require('../controllers/dataController');

router.get('/', function (req, res, next) {
    res.send("Metals Data Server")
});

router.get('/config', function (req, res, next) {
    item.getConfig(req,res,next);
});

router.get('/time', function (req, res, next) {
    item.getTime(req,res,next);
});

router.get('/symbols', function (req, res, next) {
    item.getSymbols(req,res,next);
});

router.get('/history', function (req, res, next) {
    item.getHistory(req,res,next);
});

module.exports = router;