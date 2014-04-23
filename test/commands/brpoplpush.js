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
    client.lpush("BRPOPLPUSH_1", "ZERO", "ONE", integerReply(t, 2));
});

test("brpoplpush preexisting data", function (t) {
    t.plan(2);
    client.brpoplpush("BRPOPLPUSH_1", "BRPOPLPUSH_2", 0,
        singleStringReply(t, "ZERO"));
});

test("brpoplpush simple", function (t) {
    t.plan(6);
    client.brpoplpush("BRPOPLPUSH_1", "BRPOPLPUSH_2", 0, singleStringReply(t, "ONE"));
    client.brpoplpush("BRPOPLPUSH_1", "BRPOPLPUSH_2", 0, singleStringReply(t, "TWO"));
    setTimeout(function () {
        client2.lpush("BRPOPLPUSH_1", "TWO", integerReply(t, 1));
    }, 10);
});

test("brpoplpush timeout", function (t) {
    t.plan(2);
    client.brpoplpush("BRPOPLPUSH_1", "BRPOPLPUSH_2", 1, emptyReply(t));
});

test("receiver has elements", function (t) {
    t.plan(2);
    client.llen("BRPOPLPUSH_2", integerReply(t, 3));
});

test("cleanup", function (t) {
    t.plan(4);
    client.quit(singleStringReply(t));
    client2.quit(singleStringReply(t));
});
