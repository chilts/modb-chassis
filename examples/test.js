var async = require('async');
var flake = require('flake')('eth0');

var modbChassis = require('./modb-chassis.js');

modbChassis.requireDyno('modb-dyno-memory');
modbChassis.requireDyno('modb-dyno-leveldb');

var chassis = modbChassis.createChassis();

chassis.createTable('session', 'modb-dyno-memory');

chassis.createTable(
    'user',
    'modb-dyno-leveldb',
    './table/user'
);

async.series(
    [
        function(done) {
            chassis.putItem('user', 'chilts', flake(), { nick : 'chilts' }, done);
        },
        function(done) {
            chassis.set('user', 'chilts', flake(), { admin : true }, done);
        },
        function(done) {
            chassis.inc('user', 'chilts', flake(), 'logins', done);
        },
        function(done) {
            chassis.del('user', 'chilts', flake(), [ 'admin' ], done);
        },
        function(done) {
            chassis.set('user', 'chilts', flake(), { updated : new Date() }, done);
        },
    ],
    function(err) {
        console.log('All done writing to user.chilts:', err);
        chassis.getItem('user', 'chilts', function(err, user) {
            console.log('chilts:', user);
            chassis.flatten('user', 'chilts', user.hash, function(err) {
                console.log('All done flattening user.chilts:', err);
            });
        });
    }
);

var sessionId = 'ihah3ohZ';
chassis.putItem('session', sessionId, flake(), { 'expires' : (new Date()) }, function(err) {
    chassis.getItem('session', sessionId, function(err, item) {
        console.log('item:', item);
    });
});
