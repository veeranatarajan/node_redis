var test = require("tape").test;

var util = require("../util");
var client = util.getClient();
var singleStringReply = util.singleStringReply;

test("get empty", function (t) {
    t.plan(2);
    client.get("GET_", util.emptyReply(t));
});

test("set value", function (t) {
    t.plan(2);
    client.set("GET_", "bar", singleStringReply(t));
});

test("get", function (t) {
    t.plan(2);
    client.get("GET_", singleStringReply(t, "bar"));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
