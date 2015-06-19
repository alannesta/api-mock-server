var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var postman = require('./postman');

var urlRoot = '/';
var mocks = [];     // keep track of currently running mocks

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

function init() {

    /**
     *  handle the senario request
     */
    app.post('/init', function(req, res) {
       //console.log(req.body);
        req.body.routes.forEach(function(mockConfig) {
            mocks.push(mockConfig);
            app[mockConfig['method'].toLowerCase()](urlRoot + mockConfig['path'], function(req, res) {
                var response = mockConfig['response'];
                if (response.type === 'application/json' && response.status == 200) {
                    res.status(200).json(eval(response.value));
                }
            });
        });
        res.send('Senario Loaded');

    });

    /**
     *  handle the add senario request
     */

    app.post('/addSenario', function(req, res) {
        console.log(req.body);
        res.send('ok');
    });

    //postman.getFromMockable('http://acquisio.mockable.io/user/standard');
}

var server = app.listen(3000, function () {
    init();

    postman.addSenario(testSenario);

    var host = server.address().address;
    var port = server.address().port;
    console.log('app listening at http://%s:%s', host, port);
});