var test = require("tape");

var util = require("./util");

var client = util.getClient();

var singleStringReply = util.singleStringReply;
var integerReply = util.integerReply;
var arrayReply = util.arrayReply;
var emptyReply = util.emptyReply;
var errorReply = util.errorReply;
var singleResult = util.singleResult;
var server_version_at_least = util.server_version_at_least;

test("domain", function (t) {
    var domain;
    try {
        domain = require('domain').create();
    } catch (err) {
        t.ok("Skipping domain tests because we couldn't find the domain module");
        t.end();
    }

    if (domain) {
        domain.run(function () {
            client.set('domain', 'value', function (err, res) {
                t.ok(process.domain, "We have a domain");
                var notFound = res.not.existing.thing; // ohhh nooooo
            });
        });

        // this is the expected and desired behavior
        domain.on('error', function (err) {
            t.ok(err, "Trapped error: " + err.message);
            t.end();
        });
    }
});

test("cleanup", function (t) {
    t.plan(2);
    client.quit(singleStringReply(t));
});
