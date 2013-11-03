module.exports.server_version_at_least = server_version_at_least
module.exports.singleStringReply = singleStringReply
module.exports.getClient = getClient
module.exports.getCleanClient = getCleanClient
module.exports.emptyReply = emptyReply

var PORT = 6379;
var HOST = '127.0.0.1';
var DBNUM = 15;

var redis = require("../");
// Running with a truthy argument will enable the wire protocol and other debug logging.
redis.debug_mode = process.argv[2];

function noop () {};

function server_version_at_least(connection, desired_version) {
    // Return true if the server version >= desired_version
    var version = connection.server_info.versions;
    for (var i = 0; i < 3; i++) {
        if (version[i] > desired_version[i]) return true;
        if (version[i] < desired_version[i]) return false;
    }
    return true;
}

function singleStringReply(t, expected) {
    expected = expected || "OK"
    return function (err, reply) {
        t.notOk(err, "No error");
        t.equals(reply, expected, "Got expected value: " + expected);
    }
}

function emptyReply(t) {
    return function (err, reply) {
        t.notOk(err, "No error");
        t.notOk(reply, "Empty reply");
    }
}

var flushed = false;

function getClient(db) {
    if (flushed == false)
        return getCleanClient(db);
    db = db || DBNUM;
    var client = redis.createClient(PORT, HOST);
    client.select(db);
    return client;
}

function getCleanClient(db) {
    flushed = true;
    var client = getClient(db);
    client.flushdb(noop);
    return client;
}