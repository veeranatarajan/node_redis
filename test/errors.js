var test = require("tape");

var util = require("./util");

// TODO order matters here or the queue state bumps
//   the subscribe after the publish
var subscriber = util.getClient();
var client = util.getClient();

var singleStringReply = util.singleStringReply;
var integerReply = util.integerReply;
var arrayReply = util.arrayReply;
var emptyReply = util.emptyReply;
var errorReply = util.errorReply;
var server_version_at_least = util.server_version_at_least;

test("Forward Subscriber Errors", function (t) {
    var chan = "FORWARD_1";
    var message = "Some message";
    var toThrow = new Error("Forced exception");

    var originalHandlers = client.listeners("error");
    subscriber.removeAllListeners("error");
    subscriber.once("error", function (err) {
        t.equals(err, toThrow, "Trapped correct error.");
        subscriber.listeners("error").push(originalHandlers);
        t.end();
    });

    subscriber.on("message", function (channel, data) {
        t.equals(channel, chan, "correct channel");
        t.equals(data, message, "got pubsub message");
        throw toThrow;
    });

    subscriber.subscribe(chan);

    client.publish(chan, "Some message");
});

test("Forward Client Errors", function (t) {
    var toThrow = new Error("Forced exception");

    var originalHandlers = client.listeners("error");
    client.removeAllListeners("error");
    client.once("error", function (err) {
        t.equals(err, toThrow, "Trapped correct error.");
        client.listeners("error").push(originalHandlers);
        t.end();
    });

    client.get("FORWARD_NO_SUCH_KEY", function (err, reply) {
        throw toThrow;
    });
});

test("Forward send_command errors", function (t) {
    var originalHandlers = client.listeners("error");
    client.removeAllListeners("error");
    client.once("error", function (err) {
        t.ok(err instanceof Error, "Trapped an error.");
        client.listeners("error").push(originalHandlers);
        t.end();
    });

    client.send_command("NO_SUCH_COMMAND", []);
});

test("Forward send_command errors 2", function (t) {
    var toThrow = new Error("Forced exception");
    var originalHandlers = client.listeners("error");
    client.removeAllListeners("error");
    client.once("error", function (err) {
        t.equals(err, toThrow, "Trapped correct error.");
        client.listeners("error").push(originalHandlers);
        t.end();
    });

    client.send_command("NO_SUCH_COMMAND", [], function () {
        throw toThrow;
    });
});

test("cleanup", function (t) {
    t.plan(4);
    client.quit(singleStringReply(t));
    subscriber.quit(singleStringReply(t));
});
