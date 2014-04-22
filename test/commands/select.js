var test = require("tape").test;

var util = require("../util");
var client = util.getClient();
var client2 = util.getClient();

var singleStringReply = util.singleStringReply;
var integerReply = util.integerReply;
var arrayReply = util.arrayReply;
var emptyReply = util.emptyReply;
var errorReply = util.errorReply;
var singleResult = util.singleResult;
var server_version_at_least = util.server_version_at_least;

// This test is somewhat light as almost all tests require SELECT

test("simple select", function (t) {
    t.plan(12);
    client.select(14, singleStringReply(t));
    client.set("SELECT_", "test", singleStringReply(t));
    client.get("SELECT_", singleStringReply(t, "test"));
    client2.get("SEELCT_", emptyReply(t));
    client.del("SELECT_", integerReply(t, 1));
    client.select(15, singleStringReply(t));
});

test("select error emits if no callback", function (t) {
    t.plan(2);
    client.on("error", errorReply(t));
    client.select(9999);
});

test("cleanup", function (t) {
    t.plan(4);
    client.quit(singleStringReply(t));
    client2.quit(singleStringReply(t));
});
