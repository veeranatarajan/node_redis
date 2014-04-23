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

test("SETUP", function (t) {
    t.plan(2);
    client.set("DECR_", 1000, singleStringReply(t));
});

test("DECR", function (t) {
    t.plan(2);
    client.decr("DECR_");
    client.decr("DECR_", integerReply(t, 998));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
