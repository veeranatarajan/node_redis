var test = require("tape").test;

var util = require("../util");
var client = util.getClient();
var singleStringReply = util.singleStringReply;
var integerReply = util.integerReply;
var arrayReply = util.arrayReply;
var emptyReply = util.emptyReply;
var errorReply = util.errorReply;
var singleResult = util.singleResult;
var server_version_at_least = util.server_version_at_least;


test("setup", function (t) {
    t.plan(2);
    // Need to ensure that the client is connected before the version test below
    client.ping(singleStringReply(t, "PONG"));
});

test("bitcount empty", function (t) {
    if (!server_version_at_least(client, [2, 6, 0])) {
        t.ok("Skipping bitcount tests, Redis server too old.");
        t.end();
    }

    t.plan(2);
    client.bitcount("BITCOUNT_", integerReply(t, 0));
});

test("bitcount value", function (t) {
    if (!server_version_at_least(client, [2, 6, 0])) {
        t.ok("Skipping bitcount tests, Redis server too old.");
        t.end();
    }
    t.plan(4);
    client.set("BITCOUNT_", "foobar", singleStringReply(t));
    client.bitcount("BITCOUNT_", integerReply(t, 26));
});

test("bitcount start end", function (t) {
    if (!server_version_at_least(client, [2, 6, 0])) {
        t.ok("Skipping bitcount tests, Redis server too old.");
        t.end();
    }
    t.plan(2);
    client.bitcount("BITCOUNT_", 1, 1, integerReply(t, 6));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
