var Emitter = require('events').EventEmitter;
var _ = require('underscore');

var MockStore = function() {
    var self = this;
    var _allmocks = [];

    self.getAll = function() {
        return _allmocks;
    };

    self.cleanAll = function() {
        _allmocks = [];
    };

    /**
     * Ad da mock, if there is duplicate, replace the old one
     */
    self.addMock = function(mock) {
        for (var i = 0, length = _allmocks.length; i < length; i++) {
            if (_allmocks[i].path === mock.path && _allmocks[i].method === mock.method) {
                _allmocks[i] = mock;
                self.emit('ADD_CONFLICT', mock.path);
                return;
            }
        }
        _allmocks.push(mock);
        self.emit('NEW_MOCK_ADDED', mock);
    };

    self.listMock = function() {
        if (_allmocks.length === 0) {
            return;
        }
        console.log('Mocks currently loaded: ');
        _allmocks.forEach(function(mock) {
            console.log(mock.method + ": " + mock.path, mock.response.value);
        });
    };

    self.getMock = function(path) {
        var result = [];
        for (var i = 0, length = _allmocks.length; i < length; i++) {
            if (_allmocks[i].path === path) {
                result.push(_allmocks[i]);
            }
        }
        return result;
    };
};

MockStore.prototype = new Emitter();

module.exports = MockStore;