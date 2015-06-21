var MockStore = function () {
    var self = this;
    var _allmocks = [];

    self.getAll = function () {
        return _allmocks;
    };

    /**
     * Ad da mock, if there is duplicate, replace the old one
     */
    self.addMock = function (mock) {
        for (var i = 0, length = _allmocks.length; i < length; i++) {
            if (_allmocks[i].path === mock.path && _allmocks[i].method === mock.method) {
                _allmocks[i] = mock;
                return;
            }
        }
        _allmocks.push(mock);
    };

    self.listMock = function () {
        console.log('Mocks currently loaded: ');
        _allmocks.forEach(function (mock) {
            console.log(mock.method + ": " + mock.path);
        });
    }

    self.getMock = function (path) {
        var result = [];
        for (var i = 0, length = _allmocks.length; i < length; i++) {
            if (_allmocks[i].path === path) {
                result.push(_allmocks[i]);
            }
        }
        return result;
    };
};

module.exports = MockStore;