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

test("setup", function (t) {
    t.plan(2);
    // Need to ensure that the client is connected before the version test below
    client.ping(singleStringReply(t, "PONG"));
});

test("EVAL simple", function (t) {
    if (!server_version_at_least(client, [2, 5, 0])) {
        t.ok("Skipping eval tests, Redis server too old.");
        t.end();
    }

    t.plan(12);
    // test {EVAL - Lua integer -> Redis protocol type conversion}
    client.eval("return 100.5", 0, integerReply(t, 100));
    // test {EVAL - Lua string -> Redis protocol type conversion}
    client.eval("return 'hello world'", 0, singleStringReply(t, "hello world"));
    // test {EVAL - Lua true boolean -> Redis protocol type conversion}
    client.eval("return true", 0, integerReply(t, 1));
    // test {EVAL - Lua false boolean -> Redis protocol type conversion}
    client.eval("return false", 0, singleResult(t, null));
    // test {EVAL - Lua status code reply -> Redis protocol type conversion}
    client.eval("return {ok='fine'}", 0, singleStringReply(t, "fine"));
    // test {EVAL - Lua error reply -> Redis protocol type conversion}
    client.eval("return {err='this is an error'}", 0, errorReply(t));
});

test("EVAL table", function (t) {
    if (!server_version_at_least(client, [2, 5, 0])) {
        t.ok("Skipping eval tests, Redis server too old.");
        t.end();
    }

    // test {EVAL - Lua table -> Redis protocol type conversion}
    client.eval("return {1,2,3,'ciao',{1,2}}", 0,
        arrayReply(t, [1, 2, 3, "ciao", [1, 2]]));
});

test("EVAL KEYS/ARGS", function (t) {
    if (!server_version_at_least(client, [2, 5, 0])) {
        t.ok("Skipping eval tests, Redis server too old.");
        t.end();
    }

    // test {EVAL - Are the KEYS and ARGS arrays populated correctly?}
    client.eval("return {KEYS[1],KEYS[2],ARGV[1],ARGV[2]}", 2, "a", "b", "c", "d",
        arrayReply(t, ["a", "b", "c", "d"]));
});

test("EVAL KEYS/ARGS array format", function (t) {
    if (!server_version_at_least(client, [2, 5, 0])) {
        t.ok("Skipping eval tests, Redis server too old.");
        t.end();
    }
    // test {EVAL - parameters in array format gives same result}
    client.eval(["return {KEYS[1],KEYS[2],ARGV[1],ARGV[2]}", 2, "a", "b", "c", "d"],
        arrayReply(t, ["a", "b", "c", "d"]));
});

test("EVAL INCR KEY", function (t) {
    if (!server_version_at_least(client, [2, 5, 0])) {
        t.ok("Skipping eval tests, Redis server too old.");
        t.end();
    }

    // test {EVAL - Redis integer -> Lua type conversion}
    client.eval("local foo = redis.call('incr','incr key')\nreturn {type(foo),foo}", 0,
        arrayReply(t, ["number", 1]));
});

test("EVAL BULK REPLY", function (t) {
    if (!server_version_at_least(client, [2, 5, 0])) {
        t.ok("Skipping eval tests, Redis server too old.");
        t.end();
    }

    client.set("EVAL_1", "BULK REPLY", singleStringReply(t));
    // test {EVAL - Redis bulk -> Lua type conversion}
    client.eval("local foo = redis.call('get','EVAL_1'); return {type(foo),foo}", 0,
        arrayReply(t, ["string", "BULK REPLY"]));
});

test("EVAL multi-bulk", function (t) {
    if (!server_version_at_least(client, [2, 5, 0])) {
        t.ok("Skipping eval tests, Redis server too old.");
        t.end();
    }

    // test {EVAL - Redis multi bulk -> Lua type conversion}
    client.rpush("EVAL_MULTI", "a", "b", "c", integerReply(t, 3));
    client.eval("local foo = redis.call('lrange', 'EVAL_MULTI',0,-1); return {type(foo),foo[1],foo[2],foo[3],# foo}", 0,
        arrayReply(t, ["table", "a", "b", "c", 3]));
});

test("EVAL status conversion", function (t) {
    if (!server_version_at_least(client, [2, 5, 0])) {
        t.ok("Skipping eval tests, Redis server too old.");
        t.end();
    }

    // test {EVAL - Redis status reply -> Lua type conversion}
    client.eval("local foo = redis.call('set','mykey','myval'); return {type(foo),foo['ok']}", 0,
        arrayReply(t, ["table", "OK"]));
});

test("EVAL error conversion", function (t) {
    if (!server_version_at_least(client, [2, 5, 0])) {
        t.ok("Skipping eval tests, Redis server too old.");
        t.end();
    }

    client.set("EVAL_ERROR", "error reply value", singleStringReply(t));
    // test {EVAL - Redis error reply -> Lua type conversion}
    client.eval("local foo = redis.pcall('incr','EVAL_ERROR'); return {type(foo),foo['err']}", 0,
        arrayReply(t, ["table", "ERR value is not an integer or out of range"]));
});

test("EVAL nil conversion", function (t) {
    if (!server_version_at_least(client, [2, 5, 0])) {
        t.ok("Skipping eval tests, Redis server too old.");
        t.end();
    }

    client.set("EVAL_ERROR", "error reply value", singleStringReply(t));
    // test {EVAL - Redis nil bulk reply -> Lua type conversion}
    client.eval("local foo = redis.call('get','nil reply key'); return {type(foo),foo == false}", 0,
        arrayReply(t, ["boolean", 1]));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
