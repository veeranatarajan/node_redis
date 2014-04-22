var test = require("tape");

var util = require("../util");
var client = util.getClient();
var singleStringReply = util.singleStringReply;
var integerReply = util.integerReply;
var arrayReply = util.arrayReply;
var emptyReply = util.emptyReply;
var errorReply = util.errorReply;
var server_version_at_least = util.server_version_at_least;

test("MULTI simple", function (t) {
    var multi = client.multi();
    multi.set("MULTI_", 100);
    multi.incr("MULTI_");
    multi.exec(arrayReply(t, ["OK", 101]));
});

test("MULTI simple", function (t) {
    var multi = client.multi();
    multi.set("MULTI_", 100, singleStringReply(t));
    multi.incr("MULTI_", integerReply(t, 101));
    // TODO is this desired? Callbacks associated above *and* in exec?
    multi.exec(arrayReply(t, ["OK", 101]));
});

test("MULTI protocol error", function (t) {
    t.plan(2);
    var multi = client.multi();
    multi.get("MULTI_");
    multi.set("MULTI_");
    multi.incr("MULTI_");
    multi.exec(errorReply(t));
});

test("MULTI-bulk nested replies", function (t) {
    client.mset("MULTI_1", 10, "MULTI_2", 20, singleStringReply(t));
    client.multi([
        ["mget", "MULTI_1", "MULTI_2"],
        ["incr", "MULTI_1", integerReply(t, 11)],
        ["incr", "MULTI_2", integerReply(t, 21)]

    ]).exec(arrayReply(t, [["10", "20"], 11, 21]));
});

test("MULTI empty nested multi-bulk", function (t) {
    client.sadd("MULTI_SET", "A", "B", "C", integerReply(t, 3));
    var multi = client.multi();
    multi.smembers("MULTI_SET");
    multi.del("MULTI_SET");
    multi.smembers("MULTI_SET");
    multi.exec(function (err, replies) {
        t.notOk(err, "No Error");
        t.equal(replies.length, 3, "Correct number of records");
        t.deepEqual(replies[0].sort(), ["A", "B", "C"]);
        t.equal(replies[1], 1);
        t.deepEqual(replies[2], []);
        t.end();
    });
});

test("MULTI more multibulk", function (t) {
    var multi = client.multi();
    multi.mset("MULTI_1", 10, "MULTI_2", 20);
    multi.incr("MULTI_1", integerReply(t, 11));
    multi.incr("MULTI_2", integerReply(t, 21));
    multi.mget("MULTI_1", "MULTI_2");
    multi.exec(arrayReply(t, ["OK", 11, 21, ["11", "21"]]));
});

test("MULTI nested multi-bulk with nulls", function (t) {
    var multi = client.multi([
        ["mget", ["MULTI_1", "___NOTHING___", "___NOBODYHOME___", "MULTI_2"]],
        ["incr", "MULTI_1"]
    ]);
    multi.exec(arrayReply(t, [["11", null, null, "21"], 12]));
});

test("MULTI nested multi-bulk with object replies", function (t) {
    var multi = client.multi()
        .hmset("MULTI_HASH", "foo", "bar", "id", 11)
        .hmset("MULTI_HASH", {extra: "fancy", things: "here"})
        .hgetall("MULTI_HASH")
        .exec(arrayReply(t, ["OK", "OK", {foo: "bar", id: "11", extra: "fancy", things: "here"}]));
});

test("MULTI exception", function (t) {
    if (!server_version_at_least(client, [2, 6, 5])) {
        t.ok("Skipping exception testing for old Redis server.");
        t.end();
    }
    var multi = client.multi().set("MULTI_");
    multi.exec(function (err, reply) {
        t.ok(err);
        t.notOk(reply);
        t.equals(err.length, 2, "Two errors captured");
        t.ok(err[0].message.match(/ERR/));
        t.ok(err[1].message.match(/EXECABORT/));
        t.end();
    });
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
