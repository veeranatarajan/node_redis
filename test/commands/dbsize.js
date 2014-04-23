var test = require("tape");

var util = require("../util");
var client = util.getClient();

var singleStringReply = util.singleStringReply;
var integerReply = util.integerReply;
var arrayReply = util.arrayReply;
var emptyReply = util.emptyReply;
var errorReply = util.errorReply;
var singleResult = util.singleResult;
var server_version_at_least = util.server_version_at_least;

test("flush", function (t) {
    t.plan(2);
    client.flushdb(singleStringReply(t));
});

test("DBSIZE", function (t) {
    t.plan(4);
    client.dbsize(integerReply(t, 0));
    client.set("DBSIZE_", "TEST", singleStringReply(t));
});

test("DBSIZE 2", function (t) {
    t.plan(2);
    client.dbsize(integerReply(t, 1));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
