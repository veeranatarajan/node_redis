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
    t.plan(8);
    client.set("BITOP_EMPTY", "", singleStringReply(t));
    client.set("BITOP_1111", new Buffer([0xff]), singleStringReply(t));
    client.set("BITOP_110011001111", new Buffer([0xf0, 0xf0, 0xff]), singleStringReply(t));
    client.set("BITOP_001100111111", new Buffer([0x0f, 0x0f, 0xff]), singleStringReply(t));
});

test("BITOP NOT empty string", function (t) {
    if (!server_version_at_least(client, [2, 6, 0])) {
        t.ok("Skipping tests, Redis server too old.");
        t.end();
    }

    t.plan(4);
    client.bitop("NOT", "BITOP_DEST", "BITOP_EMPTY", integerReply(t, 0));
    client.get("BITOP_DEST", emptyReply(t));
});

test("BITOP NOT 1111", function (t) {
    if (!server_version_at_least(client, [2, 6, 0])) {
        t.ok("Skipping tests, Redis server too old.");
        t.end();
    }

    t.plan(4);
    client.bitop("NOT", "BITOP_DEST", "BITOP_1111", integerReply(t, 1));
    client.get("BITOP_DEST", singleResult(t, "\x00"));
});

test("BITOP NOT 110011001111", function (t) {
    if (!server_version_at_least(client, [2, 6, 0])) {
        t.ok("Skipping tests, Redis server too old.");
        t.end();
    }

    t.plan(4);
    client.bitop("NOT", "BITOP_DEST", "BITOP_110011001111", integerReply(t, 3));
    client.get("BITOP_DEST", singleResult(t, "\x0f\x0f\x00"));
});

test("BITOP AND", function (t) {
    if (!server_version_at_least(client, [2, 6, 0])) {
        t.ok("Skipping tests, Redis server too old.");
        t.end();
    }

    t.plan(4);
    client.bitop("AND", "BITOP_DEST", "BITOP_110011001111", "BITOP_001100111111", integerReply(t, 3));
    client.get("BITOP_DEST", singleResult(t, new Buffer([0, 0, 0xff]).toString()));
});

test("BITOP OR", function (t) {
    if (!server_version_at_least(client, [2, 6, 0])) {
        t.ok("Skipping tests, Redis server too old.");
        t.end();
    }

    t.plan(4);
    client.bitop("OR", "BITOP_DEST", "BITOP_110011001111", "BITOP_001100111111", integerReply(t, 3));
    client.get("BITOP_DEST", singleResult(t, new Buffer([0xff, 0xff, 0xff]).toString()));
});

test("BITOP XOR", function (t) {
    if (!server_version_at_least(client, [2, 6, 0])) {
        t.ok("Skipping tests, Redis server too old.");
        t.end();
    }

    t.plan(4);
    client.bitop("XOR", "BITOP_DEST", "BITOP_110011001111", "BITOP_001100111111", integerReply(t, 3));
    client.get("BITOP_DEST", singleResult(t, new Buffer([0xff, 0xff, 0]).toString()));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
