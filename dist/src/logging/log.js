"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston = require("winston");
/* The logger */
var Logger = /** @class */ (function () {
    /* The default constructor */
    function Logger(name) {
        /* Save name */
        this.name = name;
        /* Make the logger */
        this.logger = winston.createLogger({
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: "log/" + this.name + ".log" })
            ]
        });
    }
    /* Log */
    Logger.prototype.log = function (level, msg) { this.logger.log(level, "{" + this.name + "} " + msg); };
    /* Log with levels */
    Logger.prototype.error = function (msg) { this.log('error', msg); };
    Logger.prototype.warn = function (msg) { this.log('warn', msg); };
    Logger.prototype.info = function (msg) { this.log('info', msg); };
    Logger.prototype.verbose = function (msg) { this.log('verbose', msg); };
    Logger.prototype.debug = function (msg) { this.log('debug', msg); };
    Logger.prototype.silly = function (msg) { this.log('silly', msg); };
    return Logger;
}());
exports.Logger = Logger;
