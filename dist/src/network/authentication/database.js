"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var cfg = require("../../../cfg/access.json");
var knex = require("knex");
/* Export database */
var Database = /** @class */ (function () {
    function Database() {
    }
    /* Check authcode */
    Database.getAuthkeyByID = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var candidate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db
                            .from('authkeys')
                            .select('id', 'revoked', 'clearance')
                            .where('id', id)
                            .orderBy('clearance', 'desc')
                            .first()];
                    case 1:
                        candidate = _a.sent();
                        /* Return */
                        if (candidate) {
                            return [2 /*return*/, {
                                    id: candidate.id,
                                    revoked: candidate.revoked,
                                    clearance: candidate.clearance
                                }];
                        }
                        else {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /* Check authcode */
    Database.getAuthkey = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var candidate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db
                            .from('authkeys')
                            .select('id', 'revoked', 'clearance')
                            .where('hash', key)
                            .orderBy('clearance', 'desc')
                            .first()];
                    case 1:
                        candidate = _a.sent();
                        /* Return */
                        if (candidate) {
                            return [2 /*return*/, {
                                    id: candidate.id,
                                    revoked: candidate.revoked,
                                    clearance: candidate.clearance
                                }];
                        }
                        else {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /* Return the permission level of a task */
    Database.getTaskClearance = function (task) {
        return __awaiter(this, void 0, void 0, function () {
            var candidate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db
                            .from('permissions')
                            .select('level')
                            .where('task', task)
                            .first()];
                    case 1:
                        candidate = _a.sent();
                        /* Return */
                        return [2 /*return*/, candidate ? candidate.level : null];
                }
            });
        });
    };
    /* Check if authkey revoked */
    Database.isAuthkeyRevoked = function (id) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var candidate;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.db
                            .from('authkeys')
                            .select('revoked')
                            .where('id', id)
                            .first()];
                    case 1:
                        candidate = _b.sent();
                        /* Return */
                        return [2 /*return*/, ((_a = candidate) === null || _a === void 0 ? void 0 : _a.revoked) == true];
                }
            });
        });
    };
    /* Get ID for an endpoint */
    Database.getEndpointID = function (login) {
        return __awaiter(this, void 0, void 0, function () {
            var candidate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db
                            .from('endpoints')
                            .select('id', 'name', 'pass', 'salt', 'authid')
                            .where('login', login)
                            .first()];
                    case 1:
                        candidate = _a.sent();
                        /* Return */
                        if (candidate) {
                            return [2 /*return*/, {
                                    id: candidate.id,
                                    name: candidate.name,
                                    pass: candidate.pass,
                                    salt: candidate.salt,
                                    authid: candidate.authid
                                }];
                        }
                        else {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /* Register endpoint */
    Database.registerEndpoint = function (name, login, pass, salt, authid) {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = { name: name, login: login, pass: pass, salt: salt, authid: authid };
                        /* Insert */
                        return [4 /*yield*/, this.db('endpoints').insert(endpoint)];
                    case 1:
                        /* Insert */
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /* The database */
    Database.db = knex(__assign(__assign({}, cfg.database), { 
        /* Use null as default */
        useNullAsDefault: true }));
    return Database;
}());
exports.Database = Database;
