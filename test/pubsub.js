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

test("SUBSCRIBE simple", function (t) {
    t.plan(14);
    var channel = "DOGE";
    var test_message = "HELLO THIS IS DOGE";

    subscriber.on("subscribe", function (chan, count) {
        t.equals(chan, channel, "right channel");
        t.equals(count, 1, "right subscriber count");
    });
    subscriber.on("unsubscribe", function (chan, count) {
        t.equals(chan, channel, "right channel");
        t.equals(count, 0, "right subscriber count");
    });
    subscriber.on("message", function (chan, msg) {
        t.equals(chan, channel, "right channel");
        t.equals(msg, test_message, "right message");
        subscriber.unsubscribe(channel, singleStringReply(t, channel));
        client.publish(channel, "BYE", integerReply(t, 0));
    });
    subscriber.subscribe(channel, singleStringReply(t, channel));
    client.publish(channel, test_message, integerReply(t, 1));
});

test("PSUBSCRIBE simple", function (t) {
    t.plan(15);
    var pattern = "*E";
    var channel = "PDOGE";
    var test_message = "HELLO THIS IS PDOGE";

    subscriber.on("psubscribe", function (patt, count) {
        t.equals(patt, pattern, "right pattern");
        t.equals(count, 1, "right subscriber count");
    });
    subscriber.on("punsubscribe", function (patt, count) {
        t.equals(patt, pattern, "right pattern");
        t.equals(count, 0, "right subscriber count");
    });
    subscriber.on("pmessage", function (patt, chan, msg) {
        t.equals(patt, pattern, "right pattern");
        t.equals(chan, channel, "right channel");
        t.equals(msg, test_message, "right message");
        subscriber.punsubscribe(pattern, singleStringReply(t, pattern));
        client.publish(channel, "BYE", integerReply(t, 0));
    });
    subscriber.psubscribe(pattern, singleStringReply(t, pattern));
    client.publish(channel, test_message, integerReply(t, 1));
});

test("SUB AND PSUB", function (t) {
    t.plan(17);
    var pattern = "P*E";
    var channel = "DOGE";
    var test_message = "HELLO THIS IS PDOGE";

    subscriber.removeAllListeners();

    subscriber.on("message", function (chan, msg) {
        t.equals(chan, channel, "right channel");
        t.equals(msg, test_message, "right message");
        subscriber.punsubscribe(pattern, singleStringReply(t, pattern));
    });

    subscriber.on("pmessage", function (patt, chan, msg) {
        t.equals(patt, pattern, "right pattern");
        t.equals(chan, "PDOGE", "right channel");
        t.equals(msg, test_message, "right message");
        subscriber.punsubscribe(pattern, singleStringReply(t, pattern));
    });
    subscriber.subscribe(channel, singleStringReply(t, channel));
    subscriber.psubscribe(pattern, singleStringReply(t, pattern));
    client.publish(channel, test_message, integerReply(t, 1));
    client.publish("PDOGE", test_message, integerReply(t, 1));
});

test("subscriber mode switched on", function (t) {
    try {
        // can't send "GET" because we're in subscriber mode
        subscriber.get("PUBSUB_");
    } catch (e) {
        t.ok(e, "caught error");
        t.end();
    }
});

test("two channels", function (t) {
    t.plan(14);
    var channel1 = "CAM1";
    var channel2 = "CAM2";
    var message1 = "Camera 1";
    var message2 = "Camera 2";

    subscriber.removeAllListeners();

    subscriber.on("message", function (channel, message) {
        if (channel == channel1) {
            t.equals(message, message1);
            subscriber.unsubscribe(channel1, singleStringReply(t, channel1));
        }
        else if (channel == channel2) {
            t.equals(message, message2);
            subscriber.unsubscribe(channel2, singleStringReply(t, channel2));
        }
        else {
            t.fail("Unexpected channel");
        }
    });

    subscriber.subscribe(channel1, singleStringReply(t, channel1));
    subscriber.subscribe(channel2, singleStringReply(t, channel2));
    client.publish(channel1, message1, integerReply(t, 1));
    client.publish(channel2, message2, integerReply(t, 1));
});

test("unsubscribe empty", function (t) {
    t.plan(2);
    subscriber.unsubscribe();
    subscriber.unsubscribe(emptyReply(t));
});

test("punsubscribe empty", function (t) {
    t.plan(2);
    subscriber.punsubscribe();
    subscriber.punsubscribe(emptyReply(t));
});

test("no crosstalk", function (t) {
    t.plan(12);

    subscriber.removeAllListeners();
    subscriber.subscribe("PUBSUB_1", singleStringReply(t, "PUBSUB_1"));
    subscriber.subscribe("PUBSUB_2", singleStringReply(t, "PUBSUB_2"));
    subscriber.on("message", function (channel, message) {
        t.equals(channel, "PUBSUB_2");
        t.equals(message, "TEST");
    });
    subscriber.unsubscribe("PUBSUB_1", singleStringReply(t, "PUBSUB_1"));

    client.publish("PUBSUB_1", "NOPE", integerReply(t, 0));
    client.publish("PUBSUB_2", "TEST", integerReply(t, 1));
});

test("resubscribe", function (t) {
    var count = 0;

    // when connection is ended all subscriptions are renewed upon reconnect.

    subscriber.removeAllListeners();

    subscriber.on("message", function(channel, message) {
        if (channel === "PUBSUB_R1") {
            t.equals(message, "TEST 1", "message 1 ack'd");
            subscriber.stream.end();

        } else if (channel === "PUBSUB_R2") {
            t.equals(message, "TEST 2", "message 2 ack'd");
            subscriber.stream.end();

        } else {
            t.fail("Unknown channel.");
        }
    });

    // NOTE: I expected both channels to be ack'd...
    subscriber.subscribe("PUBSUB_R1", "PUBSUB_R2", singleStringReply(t, "PUBSUB_R1"));

    subscriber.on("ready", function () {
        count++;
        if (count == 1) {
            client.publish("PUBSUB_R1", "TEST 1", integerReply(t, 1));
        }
        else if (count == 2) {
            client.publish("PUBSUB_R2", "TEST 2", integerReply(t, 1));
        }
        else {
            t.end();
        }
    });

    client.publish("PUBSUB_R1", "TEST 1", integerReply(t, 1));
});

// TODO keyspace notifications?

test("cleanup", function (t) {
    t.plan(4);
    client.quit(singleStringReply(t));
    subscriber.quit(singleStringReply(t));
});
