"use strict";

module.exports = Multi;

var to_array = require("./to_array");
var transform_reply = require("./transform_reply");
var reply_to_object = transform_reply.reply_to_object;
var reply_to_strings = transform_reply.reply_to_strings;

function Multi(client, args) {
    this._client = client;
    this.queue = [["MULTI"]];
    if (Array.isArray(args)) {
        this.queue = this.queue.concat(args);
    }
}

Multi.prototype.hmset = function () {
    var args = to_array(arguments), tmp_args;
    if (args.length >= 2 && typeof args[0] === "string" && typeof args[1] === "object") {
        tmp_args = [ "hmset", args[0] ];
        Object.keys(args[1]).map(function (key) {
            tmp_args.push(key);
            tmp_args.push(args[1][key]);
        });
        if (args[2]) {
            tmp_args.push(args[2]);
        }
        args = tmp_args;
    } else {
        args.unshift("hmset");
    }

    this.queue.push(args);
    return this;
};
Multi.prototype.HMSET = Multi.prototype.hmset;

Multi.prototype.exec = function (callback) {
    var self = this;
    var errors = [];
    // drain queue, callback will catch "QUEUED" or error
    // TODO - get rid of all of these anonymous functions which are elegant but slow
    this.queue.forEach(function (args, index) {
        var command = args[0], obj;
        if (typeof args[args.length - 1] === "function") {
            args = args.slice(1, -1);
        } else {
            args = args.slice(1);
        }
        if (args.length === 1 && Array.isArray(args[0])) {
            args = args[0];
        }
        if (command.toLowerCase() === 'hmset' && typeof args[1] === 'object') {
            obj = args.pop();
            Object.keys(obj).forEach(function (key) {
                args.push(key);
                args.push(obj[key]);
            });
        }
        this._client.send_command(command, args, function (err, reply) {
            if (err) {
                var cur = self.queue[index];
                if (typeof cur[cur.length - 1] === "function") {
                    cur[cur.length - 1](err);
                } else {
                    errors.push(new Error(err));
                }
            }
        });
    }, this);

    // TODO - make this callback part of Multi.prototype instead of creating it each time
    return this._client.send_command("EXEC", [], function (err, replies) {
        if (err) {
            if (callback) {
                errors.push(new Error(err));
                callback(errors);
                return;
            } else {
                throw new Error(err);
            }
        }

        var i, il, reply, args;

        if (replies) {
            for (i = 1, il = self.queue.length; i < il; i += 1) {
                reply = replies[i - 1];
                args = self.queue[i];

                // TODO - confusing and error-prone that hgetall is special cased in two places
                if (reply && args[0].toLowerCase() === "hgetall") {
                    replies[i - 1] = reply = reply_to_object(reply);
                }

                if (typeof args[args.length - 1] === "function") {
                    args[args.length - 1](null, reply);
                }
            }
        }

        if (callback) {
            callback(null, replies);
        }
    });
};
Multi.prototype.EXEC = Multi.prototype.exec;
