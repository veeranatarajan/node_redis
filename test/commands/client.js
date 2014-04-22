var test = require("tape");

var util = require("../util");

var client = util.getClient();
var client2 = util.getClient();
var client3 = util.getClient();
client3.unref();

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

test("CLIENT SETNAME", function (t) {
    if (!server_version_at_least(client, [2, 6, 9])) {
        t.ok("Skipping client setname tests, Redis server too old.");
        t.end();
    }

    t.plan(6);
    client.client("setname", "RUTH", singleStringReply(t));
    client2.client("setname", "RENEE", singleStringReply(t));
    client3.client("setname", "ESTEBAN", singleStringReply(t));
});

test("CLIENT GETNAME", function (t) {
    if (!server_version_at_least(client, [2, 6, 9])) {
        t.ok("Skipping client getname tests, Redis server too old.");
        t.end();
    }

    t.plan(6);
    client.client("getname", singleStringReply(t, "RUTH"));
    client2.client("getname", singleStringReply(t, "RENEE"));
    client3.client("getname", singleStringReply(t, "ESTEBAN"));
});

test("CLIENT LIST", function (t) {
    if (!server_version_at_least(client, [2, 6, 9])) {
        // client list is 2.4.0+ but we're using the setname stuff
        t.ok("Skipping client list tests, Redis server too old.");
        t.end();
    }

    t.plan(6);

    function checkReply(err, reply) {
        if (Array.isArray(reply)) {
            reply = reply[0];
        }
        t.notOk(err, "No error");
        var clients = reply.split("\n");
        var myClients = clients.filter(function (client) {
            if (client.match(/(?:RUTH|RENEE|ESTEBAN)/)) {
                return true;
            }
        });
        t.equals(myClients.length, 3, "Expects 3 clients.");
    }

    client.client("list", checkReply);
    client.multi().client("list").exec(checkReply);
    client.multi([["client", "list"]]).exec(checkReply);
});

test("CLIENT PAUSE", function (t) {
    if (!server_version_at_least(client, [2, 9, 50])) {
        t.ok("Skipping client pause tests, Redis server too old.");
        t.end();
    }

    t.plan(6);
    client.client("pause", 100, singleStringReply(t));
    client2.set("CLIENT_PAUSE", Date.now(), singleStringReply(t));
    client3.get("CLIENT_PAUSE", function (err, reply) {
        t.notOk(err, "No Error");
        t.ok(reply <= Date.now() - 100, "clients were paused for at least 100ms");
    });
});

// TODO Having to skip this for now because it is defeated by the
//   reconnection logic. DOH
test.skip("CLIENT KILL", function (t) {
    if (!server_version_at_least(client, [2, 6, 9])) {
        // client list is 2.4.0+ but we're using the setname stuff
        t.ok("Skipping client list tests, Redis server too old.");
        t.end();
    }

    client.client("list", function (err, clients) {
        t.notOk(err, "No Error");
        var esteban = clients.match(/addr=([^ ]+) fd=\d+ name=ESTEBAN/)[1];
        t.ok(esteban.match(/.+:.+/));
        client.client("kill", esteban, function (err, reply) {
            t.notOk(err, "No Error");
            t.equal(reply, "OK");
            client3.unref();
            client3.set("CLIENT_KILL", "NO I AM DEAD", function (err, reply) {
                t.ok(err, "Error Expected");
                t.notOk(reply, "No reply expected");
                t.end();
            });
        });
    });
});


test("cleanup", function (t) {
    t.plan(4);
    client.quit(singleStringReply(t));
    client2.quit(singleStringReply(t));
});
