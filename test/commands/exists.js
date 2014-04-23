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

test("EXISTS", function (t) {
    t.plan(6);
    client.exists("EXISTS_", emptyReply(t));
    client.set("EXISTS_", "TEST", singleStringReply(t));
    client.exists("EXISTS_", integerReply(t, 1));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
