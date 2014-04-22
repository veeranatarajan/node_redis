var test = require("tape").test;

var util = require("../util");
var client = util.getClient();

test("set simple", function (t) {
    t.plan(2);
    client.set("SET_NOCB", "no callback");
    client.set("SET_", "bar", util.singleStringReply(t));
});

test("get", function (t) {
    t.plan(2);
    client.get("SET_", util.singleStringReply(t, "bar"));
});

test("utf8", function (t) {
    t.plan(8);
    var hrmph = "ಠ_ಠ";

    client.set(hrmph, "value", util.singleStringReply(t));
    client.get(hrmph, util.singleStringReply(t, "value"));

    client.set("SET_utf8", hrmph, util.singleStringReply(t));
    client.get("SET_utf8", util.singleStringReply(t, hrmph));
});

test("set EX", function (t) {
    t.plan(6);
    client.set("SET_EX", "barEX", "EX", 1, util.singleStringReply(t));
    client.get("SET_EX", util.singleStringReply(t, "barEX"));
    setTimeout(function () {
        client.get("SET_EX", util.emptyReply(t));
    }, 1250);
});

test("set PX", function (t) {
    t.plan(6);
    client.set("SET_PX", "barPX", "PX", 50, util.singleStringReply(t));
    client.get("SET_PX", util.singleStringReply(t, "barPX"));
    setTimeout(function () {
        client.get("SET_PX", util.emptyReply(t));
    }, 75);
});

test("set NX", function (t) {
    t.plan(8);
    client.set("SET_", "zap", "NX", util.emptyReply(t));
    client.get("SET_", util.singleStringReply(t, "bar"));
    client.set("SET_NX", "zap", "NX", util.singleStringReply(t));
    client.get("SET_NX", util.singleStringReply(t, "zap"));
});

test("set XX", function (t) {
    t.plan(8);
    client.set("SET_", "zapXX", "XX", util.singleStringReply(t));
    client.get("SET_", util.singleStringReply(t, "zapXX"));
    client.set("SET_XX", "zapXX", "XX", util.emptyReply(t));
    client.get("SET_XX", util.emptyReply(t));
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(util.singleStringReply(t));
});
