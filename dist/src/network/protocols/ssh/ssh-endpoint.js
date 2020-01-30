"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var cfg = require("../../../../cfg/network.json");
var chalk = require("chalk");
var fault_1 = require("../../../fault");
var endpoint_1 = require("../../endpoint");
var server_1 = require("../../server");
var ssh_word_transform_1 = require("./ssh-word-transform");
var SSHEndpoint = /** @class */ (function (_super) {
    __extends(SSHEndpoint, _super);
    /* Constructor */
    function SSHEndpoint(server, client) {
        var _this = 
        /* Call parent */
        _super.call(this, server, 'type') || this;
        /* Save ssh data */
        _this.client = client;
        _this.channel = null;
        _this.curedStdin = null;
        return _this;
    }
    Object.defineProperty(SSHEndpoint.prototype, "curedStream", {
        /* Get the cured input stream */
        get: function () {
            /* Check channel */
            if (!this.curedStdin) {
                throw new Error("Stream hasn't been initialized.");
            }
            /* Return */
            return this.curedStdin;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SSHEndpoint.prototype, "stream", {
        /* Get the stream */
        get: function () {
            /* Check channel */
            if (!this.channel) {
                throw new Error("Stream hasn't been initialized.");
            }
            /* Return */
            return this.channel;
        },
        /* Set the stream */
        set: function (channel) {
            /* If not null */
            if (this.channel != null) {
                /* Error */
                throw new Error("Stream can only be set once for an SSH endpoint.");
            }
            /* Set */
            this.channel = channel;
            /* Pipe stdin to curing transform. Handle errors */
            this.curedStdin = this.channel.stdin.pipe(new ssh_word_transform_1.SSHWordTransform());
        },
        enumerable: true,
        configurable: true
    });
    SSHEndpoint.prototype.kill = function () {
        /* Call base class */
        _super.prototype.kill.call(this);
        /* Kill SSH client */
        this.client.connection.end();
    };
    SSHEndpoint.prototype.greet = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var clearance, descriptor, separator;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        clearance = ((_a = this.authenticator) === null || _a === void 0 ? void 0 : _a.identifier) || cfg.server.ssh.clearance;
                        descriptor = this.name
                            ? "Endpoint is " + this.name + " (clearance " + clearance + ")"
                            : "Default endpoint (clearance " + clearance + ")";
                        separator = '#######################################################';
                        /* Make the stream and give it to the endpoint ; handshake */
                        return [4 /*yield*/, this.write(this.stream.stdout, "\r\n\r\n" + separator + "\r\n")];
                    case 1:
                        /* Make the stream and give it to the endpoint ; handshake */
                        _b.sent();
                        return [4 /*yield*/, this.write(this.stream.stdout, "# Mainframe @0.0.0.0\r\r\n")];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.write(this.stream.stdout, "# " + descriptor + "\r\n")];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, this.write(this.stream.stdout, separator + "\r\n\r\n")];
                    case 4:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SSHEndpoint.prototype.write = function (stream, msg) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!stream.write(msg)) return [3 /*break*/, 2];
                        /* Must wait for drain */
                        return [4 /*yield*/, new Promise(function (resolve) {
                                /* Subscribe to drain */
                                stream.once('drain', resolve);
                            })];
                    case 1:
                        /* Must wait for drain */
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    SSHEndpoint.prototype.say = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var formatted;
            return __generator(this, function (_a) {
                formatted = chalk(templateObject_1 || (templateObject_1 = __makeTemplateObject(["    {bold >} ", "\r\n"], ["    {bold >} ", "\\r\\n"])), message);
                /* Write */
                this.write(this.stream.stdout, formatted);
                return [2 /*return*/];
            });
        });
    };
    SSHEndpoint.prototype.report = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var formatted;
            return __generator(this, function (_a) {
                formatted = chalk(templateObject_2 || (templateObject_2 = __makeTemplateObject(["    {bold >} ", "\r\n"], ["    {bold >} ", "\\r\\n"])), message);
                /* Write */
                this.write(this.stream.stderr, formatted);
                return [2 /*return*/];
            });
        });
    };
    SSHEndpoint.prototype.hear = function () {
        return __awaiter(this, void 0, void 0, function () {
            var chunks, onData, cursor, uncuredData, data, i;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        /* Write decorator */
                        this.write(this.stream.stdout, chalk(templateObject_3 || (templateObject_3 = __makeTemplateObject(["{bold >}"], ["{bold >}"]))));
                        chunks = [];
                        onData = function (chunk) {
                            /* Add to buffer */
                            chunks.push(chunk);
                            /* Map backspaces to \b */
                            var curedChunk = Array.from(chunk).flatMap(function (char, idx) {
                                return char === ssh_word_transform_1.SSHWordTransform.backspace
                                    ? [0x08, 0x20, 0x08]
                                    : [char];
                            });
                            /* Print */
                            _this.stream.stdout.write(Buffer.from(curedChunk).toString('ascii'));
                        };
                        /* Subscribe event and open */
                        this.curedStream.addListener('data', onData);
                        this.curedStream.allowData = true;
                        /* Wait till stream closes */
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                /* Error reporter */
                                var thrower = function () { return reject(new fault_1.Fault("Endpoint link has been severed.")); };
                                /* Handle errors */
                                _this.curedStream
                                    .once('error', thrower)
                                    .once('close', thrower)
                                    .once('end', thrower);
                                /* Stop when stream blocks */
                                _this.curedStream.once('block', function () {
                                    /* Unsub error handling */
                                    _this.curedStream
                                        .removeListener('error', thrower)
                                        .removeListener('close', thrower)
                                        .removeListener('end', thrower);
                                    /* Unsubscrive event */
                                    _this.curedStream.removeListener('data', onData);
                                    /* Done */
                                    resolve();
                                });
                            })
                            /* Print newline */
                        ];
                    case 1:
                        /* Wait till stream closes */
                        _a.sent();
                        /* Print newline */
                        return [4 /*yield*/, this.write(this.stream.stdout, '\r\n')];
                    case 2:
                        /* Print newline */
                        _a.sent();
                        cursor = 0;
                        uncuredData = Buffer.concat(chunks);
                        data = Buffer.alloc(uncuredData.length);
                        /* Go through each char */
                        for (i = 0; i < uncuredData.length; i++) {
                            /* Check character */
                            if (uncuredData[i] !== ssh_word_transform_1.SSHWordTransform.backspace) {
                                /* Not a backspace. Add into buffer at cursor position */
                                data[cursor] = uncuredData[i];
                                /* Increment cursor */
                                cursor++;
                            }
                            else {
                                /* It is a backspace. Decrement cursor, but stay positive */
                                if (cursor > 0) {
                                    cursor--;
                                }
                            }
                        }
                        /* Return data */
                        return [2 /*return*/, data.subarray(0, cursor).toString('ascii')];
                }
            });
        });
    };
    return SSHEndpoint;
}(endpoint_1.Endpoint));
exports.SSHEndpoint = SSHEndpoint;
var templateObject_1, templateObject_2, templateObject_3;
