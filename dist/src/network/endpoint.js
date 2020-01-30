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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var authcode_1 = require("./authentication/authcode");
var fault_1 = require("../fault");
var access_json_1 = __importDefault(require("../../cfg/access.json"));
var crypto_1 = require("crypto");
var util_1 = require("util");
var database_1 = require("./authentication/database");
var repl_1 = require("../interaction/repl");
var Endpoint = /** @class */ (function () {
    /* Constructor */
    function Endpoint(server, inputmode) {
        if (inputmode === void 0) { inputmode = 'type'; }
        /* Default fields */
        this.server = server;
        this.authcode = null;
        this.displayName = null;
        /* Create the REPL */
        this.repl = new repl_1.REPL(this, inputmode);
    }
    Object.defineProperty(Endpoint.prototype, "name", {
        /* Get name */
        get: function () { return this.displayName; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Endpoint.prototype, "authenticator", {
        /* Get authkey */
        get: function () { return this.authcode; },
        enumerable: true,
        configurable: true
    });
    /* Kill the endpoint */
    Endpoint.prototype.kill = function () {
        /* Rescind */
        this.server.rescind(this);
    };
    /* The endpoint is ready */
    Endpoint.prototype.ready = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        /* Register */
                        this.server.register(this);
                        /* Run REPL */
                        return [4 /*yield*/, this.repl.run()];
                    case 1:
                        /* Run REPL */
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /* Authenticate */
    Endpoint.prototype.authenticate = function (login, passcode) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, kdf, key, targetKey, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, database_1.Database.getEndpointID(login)];
                    case 1:
                        endpoint = _c.sent();
                        /* Check if endpoint w/ given login exists */
                        if (endpoint == null) {
                            /* Throw */
                            throw new fault_1.Fault("Endpoint does not exist.");
                        }
                        kdf = util_1.promisify(crypto_1.pbkdf2);
                        return [4 /*yield*/, kdf(passcode, endpoint.salt, access_json_1.default.algorithms.pbkdf2.iterations, access_json_1.default.algorithms.pbkdf2.keylength, access_json_1.default.algorithms.pbkdf2.hash)];
                    case 2:
                        key = _c.sent();
                        targetKey = Buffer.from(endpoint.pass, 'base64');
                        if (!crypto_1.timingSafeEqual(targetKey, key)) {
                            /* Throw */
                            throw new fault_1.Fault("Invalid password for this endpoint.");
                        }
                        /* Save name */
                        this.displayName = endpoint.name;
                        if (!endpoint.authid) return [3 /*break*/, 4];
                        /* Invalidate old authcode and make new one */
                        (_a = this.authcode) === null || _a === void 0 ? void 0 : _a.invalidate();
                        _b = this;
                        return [4 /*yield*/, authcode_1.Authcode.get(endpoint.authid)];
                    case 3:
                        _b.authcode = _c.sent();
                        _c.label = 4;
                    case 4: 
                    /* Return the authcode */
                    return [2 /*return*/, this.authcode];
                }
            });
        });
    };
    /* Register a new endpoint */
    Endpoint.register = function (name, login, passcode, authkey) {
        if (authkey === void 0) { authkey = null; }
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, saltbuffer, salt, kdf, keybuffer, key, authid;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, database_1.Database.getEndpointID(login)];
                    case 1:
                        endpoint = _b.sent();
                        /* Check if endpoint w/ given login exists */
                        if (endpoint != null) {
                            /* Throw */
                            throw new fault_1.Fault("Endpoint login is already in use.");
                        }
                        saltbuffer = crypto_1.randomBytes(access_json_1.default.salt.endpoint);
                        salt = saltbuffer.toString('base64');
                        kdf = util_1.promisify(crypto_1.pbkdf2);
                        return [4 /*yield*/, kdf(passcode, salt, access_json_1.default.algorithms.pbkdf2.iterations, access_json_1.default.algorithms.pbkdf2.keylength, access_json_1.default.algorithms.pbkdf2.hash)];
                    case 2:
                        keybuffer = _b.sent();
                        key = keybuffer.toString('base64');
                        authid = (_a = authkey) === null || _a === void 0 ? void 0 : _a.identifier;
                        /* Insert into database */
                        return [4 /*yield*/, database_1.Database.registerEndpoint(name, login, key, salt, authid != null ? authid : null)];
                    case 3:
                        /* Insert into database */
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Endpoint;
}());
exports.Endpoint = Endpoint;
