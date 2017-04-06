var express = require('express');
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var turl = 'mongodb://localhost:27017/VTADailyTrips';
var url = 'mongodb://54.245.218.192:27017/VTADailyTrips';
var db;

function trips() {
    this.routeId = "";
    this.trips = [];
}

MongoClient.connect(turl, function (err, database) {
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
console.log("TripInfo server started");