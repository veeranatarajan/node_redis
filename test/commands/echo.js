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

test("ECHO", function (t) {
    t.plan(4);
    client.echo("HELLO", singleStringReply(t, "HELLO"));
    client.echo("THIS IS DOGE", singleStringReply(t, "THIS IS DOGE"));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
