var express = require('express');
var async = require('async');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var postman = require('./postman');
var MockSore = require('./mock_store');
var Q = require('q');

var mocks = new MockSore();

var testSenario = {
    "method": "GET",
    "path": "agencies/2/accounts",
    "response": {
        "status": 200,
        "type": "application/json",
        "value": {
            "agencies": [
                "empty"
            ]
        }
    }
};

var testSenario2 = {
    "method": "GET",
    "path": "agencies/2/accounts",
    "response": {
        "status": 200,
        "type": "application/json",
        "value": {
            "agencies": [
                "not empty"
            ]
        }
    }
};


/**
 * Init app routes and load middlewares
 *
 */
function init() {

    loadMiddleware();

    /**
     *  handle initial senario request
     */
    app.post('/init', function(req, res) {
        req.body.routes.forEach(function(senario) {
            registerSenario(senario);
        });
        res.send('Senario Loaded');
    });

    /**
     *  add single senario request
     */

    app.post('/addSenario', function(req, res) {
        var senario = req.body;
        mocks.addMock(senario);
        res.send('success');
    });

    // bootstrap, register all senarios
    mocks.getAll().forEach(function(senario) {
        registerSenario(senario);
    });

    mocks.listMock();

    mocks.on('ADD_CONFLICT', function(path) {
        console.log('conflict detected ---> ' + path);
    });

    mocks.on('NEW_MOCK_ADDED', function(senario) {
        //console.log('add ', senario);
        registerSenario(senario);
    });
}

function registerSenario(senario) {

    var index = mocks.findMockIndex(senario);

    app[mocks.getAll()[index].method.toLowerCase()]('/' + mocks.getAll()[index].path, function(req, res) {
        var response = mocks.getAll()[index].response;
        if (response.type === 'application/json' && response.status == 200) {
            res.status(200).json(response.value);
        }
    });
}


function loadMiddleware() {
    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
    app.use(multer()); // for parsing multipart/form-data
    //app.use(require('connect-livereload')({
    //    port: 35722
    //}));
    app.use(express.static('public'));
}

function startServer() {
    return app.listen(3000, function() {
        console.log('server started...');
        init();
    });
}

// app main
var server = startServer();

getFromMockable();

/*
* Async style
*
* */

// async.series([function(callback) {
//    postman.getFromMockable('user/standard', function(result) {
//        var senarios = JSON.parse(result);
//        senarios.routes.forEach(function(senario) {
//            mocks.addMock(senario);
//        });
//        console.log('mockable stuff done');
//        callback(null, 'step1 done');
//    });
//}, function(callback) {
//    postman.addSenario(testSenario, function() {
//        console.log('add senario done');
//        callback(null, 'step2 done');
//    });
//}, function(callback) {
//    postman.addSenario(testSenario2, function() {
//        console.log('add senario done');
//        callback(null, 'step3 done');
//    });
//}], function(err, results) {
//    console.log(results);
//});


/*
* Q style
*
* */

//replaceSenario().then(getFromMockable);

function getFromMockable() {
    var deferred = Q.defer();
    postman.getFromMockable('user/standard', function(result) {
        var senarios = JSON.parse(result);
        senarios.routes.forEach(function(senario) {
            mocks.addMock(senario);
        });
        console.log('mockable stuff done');
        deferred.resolve();
    });
    return deferred.promise;
}

function replaceSenario() {
    var deferred = Q.defer();
    postman.addSenario(testSenario2, function() {
        console.log('add senario done');
        deferred.resolve();
    });
    return deferred.promise;
}
