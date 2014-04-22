var test = require("tape");

var util = require("./util");

var client = util.getClient();
var unrefClient = util.getClient();
var endClient = util.getClient();

var singleStringReply = util.singleStringReply;
var integerReply = util.integerReply;
var arrayReply = util.arrayReply;
var emptyReply = util.emptyReply;
var errorReply = util.errorReply;
var singleResult = util.singleResult;
var server_version_at_least = util.server_version_at_least;

test("unref", function (t) {
    t.plan(2);
    unrefClient.unref();
    unrefClient.ping(singleStringReply(t, "PONG"));
    // This works with the 'cleanup' step.
});

test("end", function (t) {
    endClient.end();
    // Same as unref, but now the client is actually closed
    // This is not a clean close like .quit() -- use that instaed.
    t.end();
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
    // Test will timeout if unref() or end() don't work because we are not
    //   expliciitly closing here.
});
