var http = require('http');
var config = require('./config');

exports.getFromMockable = function (url, cb) {

    var base = 'http://acquisio.mockable.io/';

    http.get(base + url, function (res) {

        var body = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            //console.log(chunk);
            body += chunk;  // a stream of binary data?
        });

        res.on('end', function () {
            cb(body);
        });
    });
};

/**
 * @method post to express server to add a senario
 * @param {object} senario to add
 */
exports.addSenario = function (senario, cb) {

    var options = {
        hostname: config.dev.host,
        port: 3000,
        path: '/addSenario',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var req = http.request(options, function (res) {
        //console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            cb(body);
        });
    });

    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    req.write(JSON.stringify(senario));
    req.end();
};
