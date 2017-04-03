var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/VTADailyTrips';
var express = require('express');
var router = express.Router();
var date = require('date-and-time');
var async = require('async');


console.log('Server Started');
//--------------------------------------------------------------------------------------------------//
router.post('/',function(req,res) {

    var locObj = { "lat": req.body.lat, "lon": req.body.lon };
    console.log(req.body);
    //console.log(req.body.lon);
    processDB(locObj, function(final) {
        //console.log(final);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader("Access-Control-Allow-Headers", 'Content-Type,Accept');
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({"userStops": final}));
    });
});


function processDB(locObj, callbackM) {

    var routes1 = [];
    var tmp = [];
    var dist_list = [];
    var stopSeqArr = [];
    var tstopSeqArr = [];
    var tdist_list = [];
    var st = moment(new Date(),"HH:mm:ss");

    MongoClient.connect(url, function (err, db) {

        if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
            callbackM(err);
        } //else {
        //console.log('Connection established to', url);
        //}

        db.collection('Trips').createIndex({"stop_seq": 1});

        db.collection('Trips').find({},{"tripid": 1, "stop_seq": 1}).toArray( function(err, docs) {
            for(var v = 0; v < docs.length; v++) {
                for(var p =0; p < docs[v].stop_seq.length; p++) {
                    db.collection('Trips').update(
                        { "tripid": docs[v].tripid, "stop_seq.stopId": docs[v].stop_seq[p].stopId },
                        { $set: {"stop_seq.$.Eta1": moment.duration(moment(docs[v].stop_seq[p].staticArivalTime,"HH:mm:ss").diff(st)).asMinutes()}}
                    );
                }
            }
        });

        db.collection("Trips").distinct("stop_seq.loc").then(function(numItems){

            tstopSeqArr = numItems;

            for (var p =0;p<tstopSeqArr.length;p++){
                tdist_list.push(distance(locObj, tstopSeqArr[p],'N'));
            }

            distance_sorting(tdist_list,tstopSeqArr);
            tstopSeqArr.splice(3,tstopSeqArr.length);

            async.eachSeries(tstopSeqArr, function(stopLoc, callback) {

                    findStopID(stopLoc, function(response1) {
                        getTripIDs(response1, function(response2) {
                            async.eachSeries(response2, function(trip, callback2) {
                                getTripDetails(trip.tripid, function(response3) {
                                    routes1.push(response3[0]);
                                    callback2();
                                });
                            }, function(err) {
                                if(err) throw err;
                                var routes2 = routes1;
                                routes1 = [];
                                tmp.push({"loc": {
                                    "lat": response1.stop_seq[0].loc.lat,
                                    "lon": response1.stop_seq[0].loc.lon,
                                },
                                    "stopName": response1.stop_seq[0].stopName,
                                    "stopId": response1.stop_seq[0].stopId,
                                    "routes": routes2
                                });
                                callback();
                            });
                        });
                    });
                    function  findStopID(stopLoc, callback) {
                        db.collection("Trips").findOne(
                            {
                                "stop_seq.loc.lat": stopLoc.lat,
                                "stop_seq.loc.lon": stopLoc.lon
                            }, {
                                _id: 0,
                                "tripid": 1,
                                "stop_seq.$.stopId": 1
                            }, function (err, stop) {

                                if(err) callback(err);
                                else return callback(stop);

                            });
                    };

                    function getTripIDs(stopDetails, callback) {

                        db.collection('Trips').aggregate([
                            {
                                $match : { 'stop_seq.stopId' : stopDetails.stop_seq[0].stopId }
                            },
                            {
                                $unwind: "$stop_seq"
                            },
                            {
                                $match : { 'stop_seq.stopId' : stopDetails.stop_seq[0].stopId }
                            },
                            {
                                $project: { tripid: 1, routeid: 1, stop_seq: 1,
                                    stop_seq: { Eta1: { '$cond': {  "if": { '$lte': ['$stop_seq.Eta1', 0] },
                                        "then": "DEPARTED",
                                        "else": '$stop_seq.Eta1' } } } }
                            },
                            {
                                $sort: { 'stop_seq.Eta1': 1 , 'tripid': 1}
                            },
                            {
                                $group : { _id : '$routeid', tripid: { $first: '$tripid' } }
                            }], function(err, trips) {

                            if(err) callback(err);
                            else return callback(trips);
                        });
                    };

                    function getTripDetails(tripID, callback) {
                        db.collection('Trips').find({"tripid":tripID}).toArray(function(err,res){
                            if(err) callback(err);
                            else return callback(res);
                        });
                    };

                }, function(err) {
                    if(err) throw err;
                    console.log("3 STOPS OBJECT BUILT");
                    //console.log(tmp);
                    return callbackM(tmp);
                }
            );
        });
    });

}


//console.log(tmp);

 var p = new Promise(function (resolve, reject) {
 if (0)
 reject(new Error('Error'));
 else
 resolve();
 });

 p.then(function () {
 // console.log(stopSeqArr.lat);
 });

function distance(locObj, userLoc, unit) {

    var radlat1 = Math.PI * locObj.lat / 180;
    var radlat2 = Math.PI * userLoc.lat / 180;
    var theta = locObj.lon - userLoc.lon;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
        dist = dist * 1.609344
    }
    if (unit == "N") {
        dist = dist * 0.8684
    }
    return dist;
}

function distance_sorting(dist_list, arr) {

    for (var i = 0; i < dist_list.length; i++) {
        for (var j = 0; j < dist_list.length - 1; j++) {
            if (dist_list[j] > dist_list[j + 1]) {

                var temp = dist_list[j + 1];
                dist_list[j + 1] = dist_list[j];
                dist_list[j] = temp;

                var t = arr[j + 1];
                arr[j + 1] = arr[j];
                arr[j] = t;
            }
        }
    }
}

module.exports = router;