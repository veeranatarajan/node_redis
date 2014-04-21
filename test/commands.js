var client = require("./util").getClient();
client.unref();
client.flushdb(function () {
    require("./commands/get");
    require("./commands/set");
});
