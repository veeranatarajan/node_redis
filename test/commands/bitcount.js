var test = require("tape").test;

var util = require("../util");
var client = util.getClient();
var singleStringReply = util.singleStringReply;
var integerReply = util.integerReply;

test("bitcount empty", function (t) {
    t.plan(2);
    client.bitcount("BITCOUNT_", integerReply(t, 0));
});

test("bitcount value", function (t) {
    t.plan(4);
    client.set("BITCOUNT_", "foobar", singleStringReply(t));
    client.bitcount("BITCOUNT_", integerReply(t, 26));
});

test("bitcount start end", function (t) {
    t.plan(2);
    client.bitcount("BITCOUNT_", 1, 1, integerReply(t, 6));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
