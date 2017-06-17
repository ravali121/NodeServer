var express = require('express');
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var router = express.Router();
var url = 'mongodb://localhost:27017/VTADailyTrips';

var MongoClient = require('mongodb').MongoClient;
var db;

MongoClient.connect(url, function (err, database) {
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


