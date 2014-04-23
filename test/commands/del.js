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
    t.plan(8);
    client.set("DEL_", "TEST", singleStringReply(t));
    client.set("DEL_1", "TESTING", singleStringReply(t));
    client.set("DEL_2", "FOO", singleStringReply(t));
    client.set("DEL_3", "BAR", singleStringReply(t));
});

test("DEL", function (t) {
    t.plan(6);
    client.del("DEL_1");
    client.del("DEL_NOSUCHKEY", integerReply(t, 0));
    client.del("DEL_", integerReply(t, 1));
    client.del("DEL_1", "DEL_2", "DEL_3", integerReply(t, 2));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
