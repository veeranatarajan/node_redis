var test = require("tape").test;

var util = require("../util");
var client = util.getCleanClient();

test("set simple", function (t) {
    t.plan(2);
    client.set("foo", "bar", util.singleStringReply(t));
});

test("get", function (t) {
    t.plan(2);
    client.get("foo", util.singleStringReply(t, "bar"));
});

test("set EX", function (t) {
    t.plan(6);
    client.set("fooEX", "barEX", "EX", 1, util.singleStringReply(t));
    client.get("fooEX", util.singleStringReply(t, "barEX"));
    setTimeout(function () {
        client.get("fooEX", util.emptyReply(t));
    }, 1250);
});

test("set PX", function (t) {
    t.plan(6);
    client.set("fooPX", "barPX", "PX", 50, util.singleStringReply(t));
    client.get("fooPX", util.singleStringReply(t, "barPX"));
    setTimeout(function () {
        client.get("fooPX", util.emptyReply(t));
    }, 75);
});

test("set NX", function (t) {
    t.plan(8);
    client.set("foo", "zap", "NX", util.emptyReply(t));
    client.get("foo", util.singleStringReply(t, "bar"));
    client.set("fooNX", "zap", "NX", util.singleStringReply(t));
    client.get("fooNX", util.singleStringReply(t, "zap"));
});

test("set XX", function (t) {
    t.plan(8);
    client.set("foo", "zapXX", "XX", util.singleStringReply(t));
    client.get("foo", util.singleStringReply(t, "zapXX"));
    client.set("fooXX", "zapXX", "XX", util.emptyReply(t));
    client.get("fooXX", util.emptyReply(t));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(util.singleStringReply(t));
});