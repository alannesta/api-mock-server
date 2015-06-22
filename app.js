var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var postman = require('./postman');
var MockSore = require('./mock_store');

var mocks = new MockSore();

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

    app.get('/agencies', function(req, res) {
        res.send('init agencies');
    });

    mocks.getAll().forEach(function(senario) {
        registerSenario(senario);
    });

    mocks.on('ADD_CONFLICT', function(path) {
        console.log('conflict detected ---> ' + path);
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
        init(app);
        console.log('started');
        postman.getFromMockable('user/standard', function(result) {
            var senarios = JSON.parse(result);
            senarios.routes.forEach(function(senario) {
                mocks.addMock(senario);
            });

            mocks.listMock();
        });
    });
}
var server = startServer(app);

postman.addSenario(testSenario, function() {
    console.log('replace mock');
});

//
//function restartServer(server, app) {
//    server.close();
//    server = null;
//    app = express();
//    app.get('/agencies', function(req, res) {
//        res.send('override agencies');
//    });
//    return startServer(app);
//}
//
//var server = startServer(app);
//server = restartServer(server, app);


//var server = app.listen(3000, function () {
//    init(app);
//
//    postman.addSenario(testSenario, function() {
//        console.log('replace mock');
//    });
//
//    postman.getFromMockable('user/standard', function(result) {
//        var senarios = JSON.parse(result);
//        senarios.routes.forEach(function(senario) {
//            registerSenario(senario);
//        });
//
//        mocks.listMock();
//
//    });
//});