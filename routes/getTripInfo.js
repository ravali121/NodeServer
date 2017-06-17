var express = require('express');
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/VTADailyTrips';
var db;

function trips() {
    this.routeId = "";
    this.trips = [];
}

MongoClient.connect(url, function (err, database) {
    if (err) return console.error(err);

    db = database;

});

router.post("/", function (req, res, next) {

    var arr = [];
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    db.collection('Trips').find({ 'routeid': req.body.data }).toArray(function (errTrips, Tripdocuments) {
    res.send(Tripdocuments);

    });
});

module.exports = router;
