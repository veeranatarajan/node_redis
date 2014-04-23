var test = require("tape");

var util = require("../util");

var crypto = require("crypto");

var client = util.getClient();

var singleStringReply = util.singleStringReply;
var integerReply = util.integerReply;
var arrayReply = util.arrayReply;
var emptyReply = util.emptyReply;
var errorReply = util.errorReply;
var singleResult = util.singleResult;
var server_version_at_least = util.server_version_at_least;

test("setup", function (t) {
    t.plan(6);
    // Need to ensure that the client is connected before the version test below
    client.ping(singleStringReply(t, "PONG"));
    client.get("EVALSHA_", emptyReply(t));
    client.set("EVALSHA_", "stored value", singleStringReply(t));
});

test("EVALSHA", function (t) {
    if (!server_version_at_least(client, [2, 5, 0])) {
        t.ok("Skipping evalsha tests, Redis server too old.");
        t.end();
    }

    t.plan(4);
    var source = "return redis.call('get', 'EVALSHA_')";
    var sha = crypto.createHash("sha1").update(source).digest("hex");

    client.eval(source, 0, singleStringReply(t, "stored value"));
    client.evalsha(sha, 0, singleStringReply(t, "stored value"));
});

test("EVALSHA error", function (t) {
    if (!server_version_at_least(client, [2, 5, 0])) {
        t.ok("Skipping evalsha tests, Redis server too old.");
        t.end();
    }

    t.plan(2);
    client.evalsha("ffffffffffffffffffffffffffffffffffffffff", 0, errorReply(t));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
