var test = require("tape");

var util = require("../util");
var client = util.getClient();

var singleStringReply = util.singleStringReply;
var integerReply = util.integerReply;
var arrayReply = util.arrayReply;
var emptyReply = util.emptyReply;
var errorReply = util.errorReply;
var singleResult = util.singleResult;
var server_version_at_least = util.server_version_at_least;

test("CONFIG GET", function (t) {
    client.config("GET", "port", arrayReply(t, ["port", "6379"]));
});

// No test for CONFIG REWRITE (introduced in 2.8.0) -- changes filesystem.

var maxclients = 10000;

test("CONFIG SET", function (t) {
    client.config("GET", "maxclients", function (err, reply) {
        t.notOk(err, "No error");
        t.equals(reply.length, 2, "right number of replies");
        t.equals(reply[0], "maxclients", "right value retrieved");
        maxclients = reply[1];
        client.config("SET", "maxclients", maxclients - 1, function (err, reply) {
            t.notOk(err, "No error");
            t.equals(reply, "OK", "were able to change it");
            t.end();
        });
    });
});

test("CONFIG SET back to orig", function (t) {
    client.config("GET", "maxclients", function (err, reply) {
        t.notOk(err, "No error");
        t.equals(reply.length, 2, "right number of replies");
        t.equals(reply[0], "maxclients", "right value retrieved");
        t.equals(reply[1], (maxclients - 1).toString());
        maxclients = reply[1];
        client.config("SET", "maxclients", maxclients, function (err, reply) {
            t.notOk(err, "No error");
            t.equals(reply, "OK", "were able to change it");
            t.end();
        });
    });
});

// TODO test for CONFIG RESETSTAT (pending better INFO command parsing)

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
