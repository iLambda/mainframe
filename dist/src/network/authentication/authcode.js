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
var cfg = require("../../../cfg/access.json");
var fault_1 = require("../../fault");
var database_1 = require("./database");
var crypto_1 = require("crypto");
var util_1 = require("util");
var Authcode = /** @class */ (function () {
    /* Constructor */
    function Authcode(id, level) {
        /* The auth key id */
        this.id = null;
        /* Clearance level */
        this.level = NaN;
        /* Initialize */
        this.level = level;
        this.id = id;
    }
    Object.defineProperty(Authcode.prototype, "valid", {
        /* Is the authcode valid ? */
        get: function () { return this.id != null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Authcode.prototype, "clearance", {
        /* The clearance level */
        get: function () { return isNaN(this.level) ? null : this.level; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Authcode.prototype, "identifier", {
        /* The key ID */
        get: function () { return this.id; },
        enumerable: true,
        configurable: true
    });
    /* Invalidate */
    Authcode.prototype.invalidate = function () {
        /* Invalidate */
        this.level = NaN;
        this.id = null;
    };
    /* Cure the passcode */
    Authcode.cure = function (passcode) {
        /* TODO */
        return passcode;
    };
    /* Hash the passcode */
    Authcode.hash = function (passcode) {
        return __awaiter(this, void 0, void 0, function () {
            var cured, pepper, kdf, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cured = this.cure(passcode);
                        pepper = cfg.pepper.authcode;
                        kdf = util_1.promisify(crypto_1.pbkdf2);
                        return [4 /*yield*/, kdf(cured, pepper, cfg.algorithms.pbkdf2.iterations, cfg.algorithms.pbkdf2.keylength, cfg.algorithms.pbkdf2.hash)];
                    case 1:
                        key = _a.sent();
                        /* Hash */
                        return [2 /*return*/, key.toString('ascii')];
                }
            });
        });
    };
    /* Make an auth code */
    Authcode.get = function (passcodeOrID) {
        return __awaiter(this, void 0, void 0, function () {
            var dbrequest, entry;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dbrequest = function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, key;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = typeof (passcodeOrID);
                                        switch (_a) {
                                            case 'string': return [3 /*break*/, 1];
                                            case 'number': return [3 /*break*/, 4];
                                        }
                                        return [3 /*break*/, 6];
                                    case 1: return [4 /*yield*/, this.hash(passcodeOrID)];
                                    case 2:
                                        key = _b.sent();
                                        return [4 /*yield*/, database_1.Database.getAuthkey(key)];
                                    case 3: 
                                    /* Check key validity */
                                    return [2 /*return*/, _b.sent()];
                                    case 4: return [4 /*yield*/, database_1.Database.getAuthkeyByID(passcodeOrID)];
                                    case 5: 
                                    /* Return */
                                    return [2 /*return*/, _b.sent()];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); };
                        return [4 /*yield*/, dbrequest()];
                    case 1:
                        entry = _a.sent();
                        /* If does not exist */
                        if (entry == null) {
                            /* Throw */
                            throw new fault_1.Fault("Authorization code does not exist.");
                        }
                        /* Check its validity */
                        if (entry.revoked) {
                            /* Log into db (TODO) */
                            /* Throw */
                            throw new fault_1.Fault("Authorization code has been revoked.", "The specified authorization code has been revoked. This incident will be reported in the log.");
                        }
                        /* Get the data */
                        return [2 /*return*/, new Authcode(entry.id, entry.clearance)];
                }
            });
        });
    };
    /* Check if task is allowed */
    Authcode.prototype.allows = function (task) {
        return __awaiter(this, void 0, void 0, function () {
            var tasklevel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        /* If invalidated */
                        if (this.id == null || this.clearance == null) {
                            /* Code is not valid */
                            throw new fault_1.Fault("Authorization code is invalid.");
                        }
                        return [4 /*yield*/, database_1.Database.isAuthkeyRevoked(this.id)];
                    case 1:
                        /* Check if revoked */
                        if (_a.sent()) {
                            /* Log into db (TODO) */
                            /* Throw */
                            throw new fault_1.Fault("Authorization code has been revoked.", "The specified authorization code has been revoked. This incident will be reported in the log.");
                        }
                        return [4 /*yield*/, database_1.Database.getTaskClearance(task)];
                    case 2:
                        tasklevel = _a.sent();
                        /* Check if task exists */
                        if (tasklevel == null) {
                            /* Task not found. Can't be performed */
                            return [2 /*return*/, false];
                        }
                        /* Compare clearance level */
                        return [2 /*return*/, this.clearance <= tasklevel];
                }
            });
        });
    };
    /* Assert that the task is allowed. */
    Authcode.prototype.allowed = function (task) {
        return __awaiter(this, void 0, void 0, function () {
            var tasklevel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        /* If invalidated */
                        if (this.id == null || this.clearance == null) {
                            /* Code is not valid */
                            throw new fault_1.Fault("Authorization code is invalid.");
                        }
                        return [4 /*yield*/, database_1.Database.isAuthkeyRevoked(this.id)];
                    case 1:
                        /* Check if revoked */
                        if (_a.sent()) {
                            /* Log into db (TODO) */
                            /* Throw */
                            throw new fault_1.Fault("Authorization code has been revoked.", "The specified authorization code has been revoked. This incident will be reported in the log.");
                        }
                        return [4 /*yield*/, database_1.Database.getTaskClearance(task)];
                    case 2:
                        tasklevel = _a.sent();
                        /* Check if task exists */
                        if (tasklevel == null) {
                            /* Task not found. Can't be performed */
                            throw new fault_1.Fault("This task cannot be performed.", "No clearance level has been defined for this task.");
                        }
                        /* Compare clearance level */
                        if (!(this.clearance <= tasklevel)) {
                            /* Not enough clearance */
                            throw new fault_1.Fault("Insufficient permission.", "This task requires clearance level " + tasklevel + ".");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return Authcode;
}());
exports.Authcode = Authcode;
