var test = require("tape").test;

var util = require("../util");
var client = util.getClient();
var bufferClient = util.getClient(15, null, null, {return_buffers: true});
var singleStringReply = util.singleStringReply;
var integerReply = util.integerReply;

test("incr simple", function (t) {
    t.plan(4);
    client.incr("INCR_NOCB");
    client.incr("INCR_", integerReply(t, 1));
    client.incr("INCR_", integerReply(t, 2));
});

test("check no callback", function (t) {
    t.plan(2);
    client.get("INCR_NOCB", singleStringReply(t, "1"));
});

test("incr above maxint", function (t) {
    t.plan(4);
    client.set("INCR_", "9007199254740992", singleStringReply(t));

    // This fails with a standard client because of JavaScript numbers.
    // client.incr("INCR_", singleStringReply(t, "9007199254740993"));

    bufferClient.incr("INCR_", singleStringReply(t, "9007199254740993"));
});

test("cleanup", function (t) {
    t.plan(4);
    client.quit(singleStringReply(t));
    bufferClient.quit(singleStringReply(t));
});
