var test = require("tape");

var util = require("./util");

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

test("watch/multi", function (t) {
    if (!server_version_at_least(client, [2, 2, 0])) {
        t.ok("Skipping tests, Redis server too old.");
        t.end();
    }

    t.plan(6);
    client.watch("TX_", singleStringReply(t));
    client.incr("TX_", integerReply(t, 1));
    multi = client.multi();
    multi.incr("TX_", function () {t.fail("Never called");});
    multi.exec(emptyReply(t));
});

test("watch/multi transaction", function (t) {
    if (!server_version_at_least(client, [2, 2, 0])) {
        t.ok("Skipping tests, Redis server too old.");
        t.end();
    }
    // Test WATCH command aborting transactions, look for parser offset errors.

    t.plan(6);
    client.set("TX_2", 200);

    client.set("TX_", 0);
    client.watch("TX_");
    client.incr("TX_");
    var multi = client.multi()
        .incr("TX_")
        .exec(function (err, replies) {
            // Failure expected because of pre-multi incr
            t.notOk(err);
            t.notOk(replies);

            client.get("TX_2", singleStringReply(t, "200"));
        });

    client.set("TX_UNRELATED", 100, singleStringReply(t));
});

test("UNWATCH", function (t) {
    if (!server_version_at_least(client, [2, 2, 0])) {
        t.ok("Skipping tests, Redis server too old.");
        t.end();
    }

    client.watch("UNWATCH_", singleStringReply(t));
    client.incr("UNWATCH_", integerReply(t, 1));
    client.unwatch(singleStringReply(t));
    multi = client.multi();
    multi.incr("UNWATCH_", integerReply(t, 2));
    multi.exec(arrayReply(t, [2]));
});

// TODO DISCARD is BROKEN (does not send w/o exec!
test.skip("DISCARD", function (t) {
    if (!server_version_at_least(client, [2, 2, 0])) {
        t.ok("Skipping tests, Redis server too old.");
        t.end();
    }

    multi = client.multi();
    multi.incr("TX_", function () {t.fail("Never called");});
    multi.discard(singleStringReply(t));
    // TODO should *not* be able to exec multi here?
});

// TODO DISCARD is BROKEN (does not send w/o exec!)
test.skip("DISCARD unwatches", function (t) {
    if (!server_version_at_least(client, [2, 2, 0])) {
        t.ok("Skipping tests, Redis server too old.");
        t.end();
    }

    client.watch("DISCARD_", singleStringReply(t));
    client.incr("DISCARD_", integerReply(t, 1));
    client.multi().discard(singleStringReply(t));
    // TODO should *not* be able to exec multi here?

    var multi = client.multi();
    multi.incr("DISCARD_", integerReply(t, 2));
    multi.exec(arrayReply(t, [2]));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
