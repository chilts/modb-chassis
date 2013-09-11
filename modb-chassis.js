// ----------------------------------------------------------------------------
//
// chassis.js - the table manager for MoDB (http://modb.io/).
//
// Copyright (c) 2013 Andrew Chilton <andychilton> - http://chilts.org/blog/
//
// ----------------------------------------------------------------------------

var dynoType = {};

function requireDyno(type) {
    // type should be 'leveldb', 'memory' or 'redis' etc
    var name = type;
    console.log('Loading ' + name);

    // this will either throw or work fine
    var createThisDyno = require(name);

    // store this create function
    dynoType[type] = createThisDyno;
};

// ----------------------------------------------------------------------------
// Chassis

function createChassis() {
    return new Chassis();
}

var Chassis = function() {
    var self = this;
    self.table = {};
};

Chassis.prototype.listTables = function() {
    var self = this;

    var tables = [];
    Object.keys(self.table).forEach(function(tablename, i) {
        var table = self.table[tablename];
        tables.push({
            tablename : tablename,
            type      : table.type,
        });
    });

    return tables;
};

Chassis.prototype.createTable = function(tablename, type, opts) {
    var self = this;

    // type should be something like 'memory', 'leveldb' or 'redis'
    var dyno = dynoType[type](opts);

    var table = {
        dyno      : dyno,
        type      : type,
    };

    // store it for later reference
    self.table[tablename] = table;

    return dyno;
};

Chassis.prototype.deleteTable = function(tablename) {
    var self = this;
    delete self.table[tablename];
};

// ----------------------------------------------------------------------------

// all of these operations should just proxy through to the dyno level
var proxy = [
    // item level
    'putItem', 'getItem', 'delItem', 'flatten',

    // attribute level
    'add', 'inc', 'put', 'del', 'set', 'append', 'addToSet',
];

proxy.forEach(function(operationName, i) {
    Chassis.prototype[operationName] = function(tablename /*, args... */) {
        var self = this;

        // get the rest of these args
        var args = Array.prototype.slice.call(arguments, 1);

        // proxy these requests through
        var dyno = self.table[tablename].dyno;
        dyno[operationName].apply(dyno, args);
    };
});

// ----------------------------------------------------------------------------

module.exports.requireDyno   = requireDyno;
module.exports.createChassis = createChassis;

// ----------------------------------------------------------------------------
