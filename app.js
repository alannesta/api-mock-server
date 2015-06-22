var express = require('express');
var async = require('async');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var postman = require('./postman');
var MockSore = require('./mock_store');

var mocks = new MockSore();

var restartFlag = false;

var testSenario = {
    "method": "GET",
    "path": "agencies/2/accounts",
    "response": {
        "status": 200,
        "type": "application/json",
        "value": {
            "agencies": [
                'empty'
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
                'not empty'
            ]
        }
    }
};

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
app.use(require('connect-livereload')({
    port: 35722
}));


/**
 * Init app routes
 *
 */
function init(app) {

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
        //server = restartServer(server, app);
        restartFlag = true;     // when there is a senario conflict, replace the old one, restart the server
    });

    mocks.on('NEW_MOCK_ADDED', function(senario) {
        //console.log('add ', senario);
        registerSenario(senario);
    });
}

function registerSenario(senario) {
    app[senario['method'].toLowerCase()]('/' + senario['path'], function(req, res) {
        var response = senario['response'];
        if (response.type === 'application/json' && response.status == 200) {
            res.status(200).json(response.value);
        }
    });
}

function startServer(app) {
    return app.listen(3000, function() {
        console.log('server started...');
        init(app);
    });
}

function restartServer(server, app) {
    console.log('server restarting...')
    server.close();
    return startServer(app);
}


// app main
var server = startServer(app);

async.series([function(callback) {
    postman.getFromMockable('user/standard', function(result) {
        var senarios = JSON.parse(result);
        senarios.routes.forEach(function(senario) {
            mocks.addMock(senario);
        });
        console.log('mockable stuff done');
        callback(null, 'step1 done');
    });
}, function(callback) {
    postman.addSenario(testSenario, function() {
        console.log('add senario done');
        callback(null, 'step2 done');
    });
}, function(callback) {
    postman.addSenario(testSenario2, function() {
        console.log('add senario done');
        callback(null, 'step3 done');
    });
}], function(err, results) {
    if (restartFlag) {
        app = express();    // new instance of app is required to override the previously defined path...
        server = restartServer(server, app);
    }
});

//postman.addSenario(testSenario, function() {
//    console.log('replace mock');
//});

//postman.getFromMockable('user/standard', function(result) {
//    var senarios = JSON.parse(result);
//    senarios.routes.forEach(function(senario) {
//        mocks.addMock(senario);
//    });
//});

//var server = startServer(app);
//server = restartServer(server, app);
