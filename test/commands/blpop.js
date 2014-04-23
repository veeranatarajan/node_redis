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
    client.lpush("BLPOP_1", "ONE", "TWO", integerReply(t, 2));
});

test("blpop preexisting data", function (t) {
    client.blpop("BLPOP_1", 0, arrayReply(t, ["BLPOP_1", "TWO"]));
});

test("blpop simple", function (t) {
    client.blpop("BLPOP_1", 0, function (err, replies) {
        t.notOk(err, "No error");
        t.ok(replies.length, 2);
        t.deepEqual(replies, ["BLPOP_1", "ONE"], "Expected replies");
    });
    client.blpop("BLPOP_1", 0, arrayReply(t, ["BLPOP_1", "TWO"]));
    setTimeout(function () {
        client2.lpush("BLPOP_1", "TWO", integerReply(t, 1));
    }, 10);
});

test("blpop two lists", function (t) {
    client.blpop("BLPOP_1", "BLPOP_2", 0, arrayReply(t, ["BLPOP_1", "THREE"]));
    setTimeout(function () {
        client2.lpush("BLPOP_1", "THREE", integerReply(t, 1));
        client2.lpush("BLPOP_2", "FOUR", integerReply(t, 1));
    }, 10);
});

test("blpop second list", function (t) {
    client.blpop("BLPOP_1", "BLPOP_2", 0, arrayReply(t, ["BLPOP_2", "FOUR"]));
});

test("blpop timeout", function (t) {
    t.plan(2);
    client.blpop("BLPOP_1", 1, emptyReply(t));
});

test("cleanup", function (t) {
    t.plan(4);
    client.quit(singleStringReply(t));
    client2.quit(singleStringReply(t));
});
