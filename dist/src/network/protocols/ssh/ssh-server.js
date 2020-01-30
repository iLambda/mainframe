"use strict";
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
var ssh2 = require("ssh2");
var fs_1 = require("fs");
var path_1 = require("path");
var ssh_endpoint_1 = require("./ssh-endpoint");
var SSHServer = /** @class */ (function () {
    /* Build a SSHServer */
    function SSHServer() {
        /* Compute path to the keys */
        var keys = cfg.server.ssh.keys.map(function (key) { return path_1.resolve(__dirname, '../../../../../', key.private); });
        /* Make the server */
        this.sshendpoints = [];
        this.sshserver = new ssh2.Server({
            /* The host keys */
            hostKeys: keys.map(function (f) { return fs_1.readFileSync(f); }),
            // The display name of the server
            ident: "Mainframe SSH Endpoint",
            /* The greeting send before handshaking */
            greeting: cfg.server.ssh.messages.greeting,
            /* The banner sent before authentication */
            banner: cfg.server.ssh.messages.banner
        }, 
        /* The connection handler */
        this.onConnect.bind(this));
    }
    Object.defineProperty(SSHServer.prototype, "endpoints", {
        /* Return endpoints */
        get: function () {
            /* Shallow copy */
            return this.sshendpoints;
        },
        enumerable: true,
        configurable: true
    });
    SSHServer.prototype.register = function (endpoint) {
        /* Add */
        this.sshendpoints.push(endpoint);
        /* Return */
        return endpoint;
    };
    SSHServer.prototype.rescind = function (endpoint) {
        /* Find index */
        var idx = this.sshendpoints.indexOf(endpoint);
        /* Check if endpoint was in the list */
        if (idx < 0) {
            return;
        }
        /* Actually remove */
        this.sshendpoints.splice(idx, 1);
    };
    /* Run server */
    SSHServer.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    /* Run the server */
                    return [4 /*yield*/, new Promise(function (resolve) {
                            /* Start listening */
                            _this.sshserver.listen(
                            /* The SSH port */
                            cfg.server.ssh.port, 
                            /* Hostname */
                            cfg.server.ssh.hostname, 
                            /* Callback */
                            resolve);
                        })];
                    case 1:
                        /* Run the server */
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /* Called when a connection is established */
    SSHServer.prototype.onConnect = function (connection, info) {
        /* New endpoint */
        var endpoint = new ssh_endpoint_1.SSHEndpoint(this, { connection: connection, info: info });
        /* Register callbacks */
        connection.on('authentication', this.onAuthentication.bind(this, endpoint));
        connection.on('ready', this.onReady.bind(this, endpoint));
        connection.on('end', this.onDisconnect.bind(this, endpoint));
    };
    /* Called when a client is disconnected */
    SSHServer.prototype.onAuthentication = function (endpoint, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ctx.accept();
                return [2 /*return*/];
            });
        });
    };
    /* Called when a client is ready */
    SSHServer.prototype.onReady = function (endpoint) {
        var _this = this;
        /* Client has been authenticated */
        endpoint.client.connection.on('session', function (accept, reject) {
            /* Accept the session request */
            var session = accept();
            /* Listen PTY event */
            session.once('pty', function (accept) { return accept(); });
            /* Listen 'shell' event */
            session.once('shell', function (accept) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            /* Save stream */
                            endpoint.stream = accept();
                            /* Greet and ready */
                            return [4 /*yield*/, endpoint.greet()];
                        case 1:
                            /* Greet and ready */
                            _a.sent();
                            return [4 /*yield*/, endpoint.ready()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    };
    /* Called when a client is disconnected */
    SSHServer.prototype.onDisconnect = function (endpoint) {
        /* Rescind */
        this.rescind(endpoint);
    };
    return SSHServer;
}());
exports.SSHServer = SSHServer;
