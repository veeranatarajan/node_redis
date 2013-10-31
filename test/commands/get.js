var test = require("tape").test;

var util = require("../util");
var client = util.getCleanClient();
var singleStringReply = util.singleStringReply;

test("setup", function (t) {
    t.plan(2);
    client.set("foo", "bar", singleStringReply(t));
});

test("get", function (t) {
    t.plan(2);
    client.get("foo", singleStringReply(t, "bar"));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});