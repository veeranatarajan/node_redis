var test = require("tape").test;

var util = require("../util");
var client = util.getDirtyClient(0, 9006, "filefish.redistogo.com");
var singleStringReply = util.singleStringReply;
var integerReply = util.integerReply;

test("auth", function (t) {
    t.plan(2);
    client.auth("664b1b6aaf134e1ec281945a8de702a9", singleStringReply(t));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
