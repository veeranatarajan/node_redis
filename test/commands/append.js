var test = require("tape").test;

var util = require("../util");
var client = util.getClient();
var singleStringReply = util.singleStringReply;
var integerReply = util.integerReply;

test("append empty", function (t) {
    t.plan(4);
    client.append("APPEND_", "hello", integerReply(t, 5));
    client.get("APPEND_", singleStringReply(t, "hello"));
});

test("append value", function (t) {
    t.plan(4);
    client.append("APPEND_", " world", integerReply(t, 11));
    client.get("APPEND_", singleStringReply(t, "hello world"));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
