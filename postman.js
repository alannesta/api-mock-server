var http = require('http');
var config = require('./config');

exports.getFromMockable = function(url) {
    http.get(url, function(res) {
        res.on('data', function(chunk) {
            console.log('BODY: ' + chunk);
        });
    });
};

/**
 * @method post to express server to add a senario
 * @param {object} senario to add
 */
exports.addSenario = function(senario) {

    var options = {
        hostname: config.dev.host,
        port: 3000,
        path: '/addSenario',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var req = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    req.write(JSON.stringify(senario));
    req.end();
};
