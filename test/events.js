var test = require("tape");

var util = require("./util");

var client = util.getClient();
var lowhwm = util.getClient(15, null, null, {command_queue_high_water: 3});

var singleStringReply = util.singleStringReply;
var integerReply = util.integerReply;
var arrayReply = util.arrayReply;
var emptyReply = util.emptyReply;
var errorReply = util.errorReply;
var singleResult = util.singleResult;
var server_version_at_least = util.server_version_at_least;

var sawReady = false;
var sawConnect = false;

client.on("ready", function () {
    sawReady = true;
});

client.on("connect", function () {
    sawConnect = true;
});

client.on("idle", function () {
    sawIdle = true;
});

// drain

test("ready", function (t) {
    t.ok(sawReady);
    t.end();
});

test("connect", function (t) {
    // TODO is there a way to test the no_ready_check flag?
    t.ok(sawConnect);
    t.end();
});

test("error", function (t) {
    client.on("error", function (err) {
        t.ok(err);
        t.end();
    });
    // protocol error w/ no callback
    client.set("EVENTS_");
});

test("idle", function (t) {
    t.ok(sawIdle);
    t.end();
});

test("reconnecting", function (t) {
    t.plan(6);

    client.on("reconnecting", function on_reconnect(params) {
        client.on("ready", function on_connect() {
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

test("drain", function (t) {
    t.plan(16);

    lowhwm.on("drain", function () {
        t.ok(1, "Saw drain");
        setImmediate(function () {
            t.ok(lowhwm.ping(singleStringReply(t, "PONG")), "drained");
        });
    });
    t.ok(lowhwm.ping(singleStringReply(t, "PONG")), "should not buffer yet");
    t.ok(lowhwm.ping(singleStringReply(t, "PONG")), "should not buffer yet");
    t.notOk(lowhwm.ping(singleStringReply(t, "PONG")), "at hwm");
    t.notOk(lowhwm.ping(singleStringReply(t, "PONG")), "past hwm");
});

test("cleanup", function (t) {
    t.plan(5);
    client.on("end", function () {
        t.ok(1, "Saw end event");
    });
    client.quit(singleStringReply(t));
    lowhwm.quit(singleStringReply(t));
});
