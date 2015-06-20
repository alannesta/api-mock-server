var MockStore = function() {
    var self = this;
    var  _mock = [];

    self.getAll = function() {
        return _mock;
    };

    /**
     * Ad da mock, if there is duplicate, replace the old one
     */
    self.addMock = function(mock) {
        for (var i = 0, length = _mock.length; i < length; i++) {
            if (_mock[i].path === mock.path && _mock[i].method === mock.method) {
                _mock[i] = mock;
                return;
            }
        }

        _mock.push(mock);

    };

    self.listMock = function() {
        _mock.forEach(function(mock) {
            console.log('Mocks currently loaded: ');
            console.log(mock.method + ": " + mock.path);
        });
    }
};

module.exports = new MockStore();