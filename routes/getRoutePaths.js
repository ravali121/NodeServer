var express = require('express');
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var router = express.Router();
var turl = 'mongodb://localhost:27017/VTADailyTrips';
var url = 'mongodb://54.245.218.192:27017/VTADailyTrips';

var MongoClient = require('mongodb').MongoClient;
var db;

MongoClient.connect(turl, function (err, database) {
    if (err) return err;
    else
        db = database;
});


router.post('/', function (req, res, next) {

    db.collection('busPaths').find({ 'shapeid': { $in: req.body.data } }).toArray(function (errTrips, Tripdocuments) {
       res.send(Tripdocuments);

    });
});

module.exports = router;
console.log("RoutePaths server started");

