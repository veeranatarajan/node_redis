var test = require("tape");

var util = require("./util");

var client = util.getClient(15, null, null, {detect_buffers: true});

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

test("single buffer or string", function (t) {
    t.plan(6);
    var val = "string value";
    var buff = new Buffer(val);
    client.set("DETECT_", val, singleStringReply(t));
    client.get("DETECT_", singleStringReply(t, val));
    client.get(new Buffer("DETECT_"), singleResult(t, buff));
});

test("array of Strings", function (t) {
    client.hmset("DETECT_2", "key 1", "val 1", "key 2", "val 2", singleStringReply(t));
    client.hmget("DETECT_2", "key 1", "key 2", arrayReply(t, ["val 1", "val 2"]));
});

test("array of Buffers", function (t) {
    client.hmget(new Buffer("DETECT_2"), "key 1", "key 2",
        arrayReply(t, [new Buffer("val 1"), new Buffer("val 2")]));
});

test("array of strings w/ undefined values", function (t) {
    // regression test for #344
    client.hmget("DETECT_2", "key 3", "key 4", arrayReply(t, [null, null]));
});

test("object of strings", function (t) {
    t.plan(2);
    client.hgetall("DETECT_2", singleResult(t, {"key 1": "val 1", "key 2": "val 2"}));
});

test("object of buffers", function (t) {
    t.plan(2);
    client.hgetall(new Buffer("DETECT_2"),
        singleResult(t, {"key 1": new Buffer("val 1"), "key 2": new Buffer("val 2")}));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
