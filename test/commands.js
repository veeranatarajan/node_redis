var client = require("./util").getClient();
client.unref();
client.flushdb(function () {
    require("./commands/append");
    require("./commands/auth");
    require("./commands/get");
    require("./commands/set");
});
