var test = require("tape");

var util = require("./util");

var singleStringReply = util.singleStringReply;
var integerReply = util.integerReply;
var arrayReply = util.arrayReply;
var emptyReply = util.emptyReply;
var errorReply = util.errorReply;
var singleResult = util.singleResult;
var server_version_at_least = util.server_version_at_least;

test("OFFLINE_QUEUE ON", function (t) {
    t.plan(6);
    var client = util.getDirtyClient(0, 9999, null, {max_attempts: 1});
    client.on("error", function (err) {
        t.ok(err, "Unable to connect");
    });
    client.set("OFFLINE_", "TEST", errorReply(t));
    t.equals(client.offline_queue.length, 1, "Queued the SET command");
    client.quit(errorReply(t));
});

test("OFFLINE_QUEUE OFF", function (t) {
    t.plan(5);
    var client = util.getDirtyClient(0, 9999, null, {
        max_attempts: 1,
        enable_offline_queue: false
    });
    client.on("error", function (err) {
        t.ok(err, "Unable to connect");
    });
    setTimeout(function () {
        client.set("OFFLINE_", "TEST", errorReply(t));
        client.quit(errorReply(t));
    }, 50);
});
