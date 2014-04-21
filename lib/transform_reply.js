module.exports.reply_to_object = reply_to_object;
module.exports.reply_to_strings = reply_to_strings;

// hgetall converts its replies to an Object.  If the reply is empty, null is returned.
function reply_to_object(reply) {
    var obj = {}, j, jl, key, val;

    if (reply.length === 0) {
        return null;
    }

    for (j = 0, jl = reply.length; j < jl; j += 2) {
        key = reply[j].toString();
        val = reply[j + 1];
        obj[key] = val;
    }

    return obj;
}

function reply_to_strings(reply) {
    var i;

    if (Buffer.isBuffer(reply)) {
        return reply.toString();
    }

    if (Array.isArray(reply)) {
        for (i = 0; i < reply.length; i++) {
            if (reply[i] !== null && reply[i] !== undefined) {
                reply[i] = reply[i].toString();
            }
        }
        return reply;
    }

    return reply;
}
