var test = require("tape").test;

var util = require("../util");
var client = util.getClient();
var client2 = util.getClient();

var singleStringReply = util.singleStringReply;
var integerReply = util.integerReply;
var arrayReply = util.arrayReply;
var emptyReply = util.emptyReply;
var errorReply = util.errorReply;
var singleResult = util.singleResult;
var server_version_at_least = util.server_version_at_least;

test("lpush (setup)", function (t) {
    t.plan(2);
    client.lpush("RPOPLPUSH_1", "ZERO", "ONE", integerReply(t, 2));
});

test("rpoplpush preexisting data", function (t) {
    t.plan(2);
    client.rpoplpush("RPOPLPUSH_1", "RPOPLPUSH_2",
        singleStringReply(t, "ZERO"));
});

test("rpoplpush simple", function (t) {
    t.plan(2);
    client.rpoplpush("RPOPLPUSH_1", "RPOPLPUSH_2", singleStringReply(t, "ONE"));
});

test("receiver has elements", function (t) {
    t.plan(2);
    client.llen("RPOPLPUSH_2", integerReply(t, 2));
});

test("cleanup", function (t) {
    t.plan(4);
    client.quit(singleStringReply(t));
    client2.quit(singleStringReply(t));
});
