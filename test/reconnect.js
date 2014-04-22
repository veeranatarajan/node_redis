var test = require("tape");

var util = require("./util");

var client = util.getClient();
var subscriber = util.getClient();

var singleStringReply = util.singleStringReply;
var integerReply = util.integerReply;
var arrayReply = util.arrayReply;
var emptyReply = util.emptyReply;
var errorReply = util.errorReply;
var singleResult = util.singleResult;
var server_version_at_least = util.server_version_at_least;

test("reconnect", function (t) {
    t.plan(6);

    client.on("reconnecting", function on_reconnect(params) {
        client.on("connect", function on_connect() {
            client.get("RECONNECT_", singleStringReply(t, "one"));
            client.get("RECONNECT_2", singleStringReply(t, "two"));
        });
    });

    client.set("RECONNECT_", "one", singleStringReply(t));
    client.set("RECONNECT_2", "two", function (err, res) {
        // manually destroy the stream
        // Don't do this in normal programs! use .quit()
        client.stream.destroy();
    });
});

// TODO uh, reconnecting a subscriber seems broken?
test.skip("reconnect subscriber", function (t) {
    t.plan(12);

    subscriber.on("reconnecting", function on_reconnect(params) {
        subscriber.on("connect", function on_connect() {
            client.publish("RECONNECT_", "test", integerReply(t, 1));
            subscriber.unsubscribe("RECONNECT_", function (err, res) {
                t.notOk(err);
                subscriber.get("RECONNECT_3", singleStringReply(t, "three"));
            });
        });
    });

    subscriber.on("message", singleStringReply(t, "test"));

    subscriber.set("RECONNECT_3", "three", singleStringReply(t));
    subscriber.subscribe("RECONNECT_", function (err, res) {
        t.notOk(err);
        subscriber.stream.destroy();
    });

    client.publish("RECONNECT_", "test", integerReply(t, 1));
});

test("cleanup", function (t) {
    t.plan(4);
    client.quit(singleStringReply(t));
    subscriber.quit(singleStringReply(t));
});
