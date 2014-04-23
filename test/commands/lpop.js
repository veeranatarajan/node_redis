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
    client.lpush("LPOP_1", "ONE", "TWO", integerReply(t, 2));
});

test("lpop simple", function (t) {
    t.plan(2);
    client.lpop("LPOP_1", singleStringReply(t, "TWO"));
});

test("cleanup", function (t) {
    t.plan(4);
    client.quit(singleStringReply(t));
    client2.quit(singleStringReply(t));
});
