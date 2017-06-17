
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
    db.collection("Trips").distinct('routeid', function (error, documents) {
        if (error) throw error;
        let promises = [];
        for (var i = 0; i < documents.length; i++) {

            promises.push(new Promise(resolve => {
            var _routeId = documents[i];
            db.collection('Trips').find({ 'routeid': _routeId }, { 'routeid': 1, 'shapeid': 1, 'currentlocation': 1, 'tripid': 1, 'description': 1, 'vehicletimestamp': 1, 'isvalid': 1 }).toArray(function (errTrips, Tripdocuments) {
                var obj = new trips();
                obj.routeId = _routeId;
                obj.trips = Array.from(Tripdocuments);
                arr.push(obj);
                resolve(obj);
            });

        }));
        };
        Promise.all(promises).then(function (arr) { res.send(arr); });
    })
});

module.exports = router;

