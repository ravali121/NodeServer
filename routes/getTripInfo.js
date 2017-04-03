/**
 * Created by Ravali121 on 4/2/2017.
 */

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


// Initialize connection once
MongoClient.connect(turl, function (err, database) {
    if (err) return console.error(err);

    db = database;

    // the Mongo driver recommends starting the server here because most apps *should* fail to start if they have no DB.  If yours is the exception, move the server startup elsewhere.
});

router.post("/", function (req, res, next) {

    console.log(req.body);
    // "FIELD1": { '$regex': '^10_' } }
    var arr = [];
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    db.collection('Trips').find({ 'routeid': req.body.data }).toArray(function (errTrips, Tripdocuments) {
       res.send(Tripdocuments);
       // console.log(TripDocuments);

    });


});

module.exports = router;
console.log("TripInfo server started");

