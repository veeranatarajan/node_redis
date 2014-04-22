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

test("bitpos empty", function (t) {
    if (!server_version_at_least(client, [2, 8, 7])) {
        t.ok("Skipping bitpos tests, Redis server too old.");
        t.end();
    }

    t.plan(4);
    client.bitpos("BITPOS_", 0, integerReply(t, 0));
    client.bitpos("BITPOS_", 1, integerReply(t, -1));
});

test("bitpos bit", function (t) {
    if (!server_version_at_least(client, [2, 8, 7])) {
        t.ok("Skipping bitpos tests, Redis server too old.");
        t.end();
    }
    t.plan(6);
    client.set("BITPOS_", new Buffer([0xff, 0xf0, 0]), singleStringReply(t));
    client.bitpos("BITPOS_", 0, integerReply(t, 12));
    client.bitpos("BITPOS_", 1, integerReply(t, 0));
});

test("bitpos bit start", function (t) {
    if (!server_version_at_least(client, [2, 8, 7])) {
        t.ok("Skipping bitpos tests, Redis server too old.");
        t.end();
    }
    t.plan(8);
    client.set("BITPOS_", new Buffer([0, 0xff, 0xf0]), singleStringReply(t));
    client.bitpos("BITPOS_", 0, 1, integerReply(t, 20));
    client.bitpos("BITPOS_", 1, 0, integerReply(t, 8));
    client.bitpos("BITPOS_", 1, 1, integerReply(t, 8));
});

test("bitpos bit start end", function (t) {
    if (!server_version_at_least(client, [2, 8, 7])) {
        t.ok("Skipping bitpos tests, Redis server too old.");
        t.end();
    }
    t.plan(22);
    client.set("BITPOS_", new Buffer([0, 0xff, 0]), singleStringReply(t));
    client.bitpos("BITPOS_", 0, 0, -1, integerReply(t, 0));
    client.bitpos("BITPOS_", 0, 1, -1 , integerReply(t, 16));
    client.bitpos("BITPOS_", 0, 2, -1 , integerReply(t, 16));
    client.bitpos("BITPOS_", 0, 2, 200 , integerReply(t, 16));
    client.bitpos("BITPOS_", 0, 1, 1 , integerReply(t, -1));
    client.bitpos("BITPOS_", 1, 0, -1, integerReply(t, 8));
    client.bitpos("BITPOS_", 1, 1, -1 , integerReply(t, 8));
    client.bitpos("BITPOS_", 1, 2, -1 , integerReply(t, -1));
    client.bitpos("BITPOS_", 1, 2, 200 , integerReply(t, -1));
    client.bitpos("BITPOS_", 1, 1, -1 , integerReply(t, 8));
});

test("bitpos end changes behavior", function (t) {
    if (!server_version_at_least(client, [2, 8, 7])) {
        t.ok("Skipping bitpos tests, Redis server too old.");
        t.end();
    }
    t.plan(8);
    client.set("BITPOS_", new Buffer([0xff, 0xff, 0xff]), singleStringReply(t));
    client.bitpos("BITPOS_", 0, integerReply(t, 24));
    client.bitpos("BITPOS_", 0, 0, integerReply(t, 24));
    client.bitpos("BITPOS_", 0, 0, -1 , integerReply(t, -1));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
