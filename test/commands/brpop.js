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
    client.lpush("BRPOP_1", "ZERO", "ONE", integerReply(t, 2));
});

test("brpop preexisting data", function (t) {
    client.brpop("BRPOP_1", 0, arrayReply(t, ["BRPOP_1", "ZERO"]));
});

test("brpop simple", function (t) {
    client.brpop("BRPOP_1", 0, function (err, replies) {
        t.notOk(err, "No error");
        t.ok(replies.length, 2);
        t.deepEqual(replies, ["BRPOP_1", "ONE"], "Expected replies");
    });
    client.brpop("BRPOP_1", 0, arrayReply(t, ["BRPOP_1", "TWO"]));
    setTimeout(function () {
        client2.lpush("BRPOP_1", "TWO", integerReply(t, 1));
    }, 10);
});

test("brpop two lists", function (t) {
    client.brpop("BRPOP_1", "BRPOP_2", 0, arrayReply(t, ["BRPOP_1", "THREE"]));
    setTimeout(function () {
        client2.lpush("BRPOP_1", "THREE", integerReply(t, 1));
        client2.lpush("BRPOP_2", "FOUR", integerReply(t, 1));
    }, 10);
});

test("brpop second list", function (t) {
    client.brpop("BRPOP_1", "BRPOP_2", 0, arrayReply(t, ["BRPOP_2", "FOUR"]));
});

test("brpop timeout", function (t) {
    t.plan(2);
    client.brpop("BRPOP_1", 1, emptyReply(t));
});

test("cleanup", function (t) {
    t.plan(4);
    client.quit(singleStringReply(t));
    client2.quit(singleStringReply(t));
});
