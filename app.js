var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var postman = require('./postman');
var chalk = require('chalk');
var MockSore = require('./mock_store');

var mocks = new MockSore();

var testSenario = {
    "method": "GET",
    "path": "agencies",
    "response": {
        "status": 200,
        "type": "application/json",
        "value": {
            "agencies": [
                {"id": 1, "name": "Yellow Pages Group"},
                {"id": 2, "name": "Acquisio"}
            ]
        }
    }
};

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
app.use(require('connect-livereload')({
    port: 35722
}));


/**
 * Init app routes
 *
 */
function init() {

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
    mocks.addMock(senario);
}


var server = app.listen(3000, function () {
    init();

    //postman.addSenario(testSenario);

    postman.getFromMockable('user/standard', function(result) {
        var response = JSON.parse(result);
        response.routes.forEach(function(senario) {
            registerSenario(senario);
        });

        mocks.listMock();
    });

    var host = server.address().address;
    var port = server.address().port;
    console.log('app listening at http://%s:%s', host, port);
});