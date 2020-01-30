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
var node_1 = require("./runtime/node");
var baiyesrecognizer_1 = require("./recognition/baiyesrecognizer");
var fault_1 = require("../fault");
var Net = /** @class */ (function () {
    /* Constructor */
    function Net(interpret) {
        /* The links. Key represents the return type of the link */
        this.links = {};
        /* Fetch all links */
        this.load();
        /* Save the interpret */
        this.interpret = interpret;
        /* Make the recognizer */
        this.recognizer = new baiyesrecognizer_1.NaiveRecognizer(this, interpret);
    }
    /* Initialize the classifier */
    Net.prototype.train = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                /* Train the recognizer */
                this.recognizer.recall();
                return [2 /*return*/];
            });
        });
    };
    /* Given an utterance, choose a node */
    Net.prototype.choose = function (utterance) {
        return __awaiter(this, void 0, void 0, function () {
            var subject, bestMatch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.recognizer.classify(utterance)];
                    case 1:
                        subject = _a.sent();
                        bestMatch = this.get().find(function (l) { return subject ? l.subjects.includes(subject) : false; });
                        /* Check if match */
                        if (!bestMatch) {
                            throw new fault_1.Fault("Command couldn't be understood.");
                        }
                        /* Pick node */
                        return [2 /*return*/, bestMatch];
                }
            });
        });
    };
    /* Get nodes with given return type */
    Net.prototype.get = function (type) {
        /* Get name */
        var typename = typeof type === 'string' ? type :
            typeof type === 'function' ? type.name :
                'nothing';
        /* Return nodes with given key */
        var links = this.links[typename];
        return links ? links : [];
    };
    /* Check if module belongs to the net */
    Net.prototype.has = function (link) {
        var _a;
        /* Check */
        return (_a = this.links[link.output]) === null || _a === void 0 ? void 0 : _a.includes(link);
    };
    /* Load modules */
    Net.prototype.load = function () {
        var _this = this;
        /* The module resolver */
        var resolver = function (Module) {
            /* Check if 'Nodes' namespace exists */
            if (!Module.Nodes) {
                return null;
            }
            /* Make it all */
            for (var key in Module.Nodes) {
                /* Make it, and register */
                var node = new Module.Nodes[key]();
                /* Check if ok, and push links */
                if (node instanceof node_1.Node) {
                    _this.register.apply(_this, node.links);
                }
            }
        };
        /* Fetch all modules */
        require('require-all')({
            /* In the nodes folder... */
            dirname: __dirname + '/runtime/nodes',
            /* .. take all modules */
            filter: /.*\.js$/,
            /* ... and instantiate them */
            resolve: resolver
        });
    };
    /* Get the root nodes ordered by subject */
    Net.prototype.root = function () {
        /* Make the dictionary and get all root links */
        var dictionary = {};
        var links = this.get();
        /* The intermediary map containing nodes * subjects */
        var pairs = links.flatMap(function (link) { return link.subjects.map(function (subject) { return [subject, link]; }); });
        /* Sort according to depth */
        pairs.sort(function (_a, _b) {
            var subA = _a[0], _linkA = _a[1];
            var subB = _b[0], _linkB = _b[1];
            var _c, _d, _e, _f;
            /* Check for equality */
            if (subA === subB) {
                return 0;
            }
            /* Split alongside dots */
            var depthA = (_d = (_c = /\./g.exec(subA)) === null || _c === void 0 ? void 0 : _c.length, (_d !== null && _d !== void 0 ? _d : 0));
            var depthB = (_f = (_e = /\./g.exec(subB)) === null || _e === void 0 ? void 0 : _e.length, (_f !== null && _f !== void 0 ? _f : 0));
            /* Compare the depth */
            var depthDiff = depthA - depthB;
            if (depthDiff !== 0) {
                return depthDiff;
            }
            /* Depth is equal. Order does not matter */
            return +(subA > subB) - +(subA < subB);
        });
        /* Iterate */
        pairs.forEach(function (_a) {
            var subject = _a[0], link = _a[1];
            /* Get depth, and access fields */
            var fields = subject.split('.');
            var depth = fields.length - 1;
            /* Check if all parent nodes exist */
            var node = dictionary;
            for (var i = 0; i < depth; i++) {
                /* If i_th field does not exists */
                if (!(fields[i] in node)) {
                    /* Error */
                    throw new Error("Link has subject " + subject + ", but no parent subject " + fields.slice(0, i + 1).join('.') + " was declared.");
                }
                /* Go deeper */
                node = node[fields[i]].sublinks;
            }
            /* Check if subject is free */
            if (fields[depth] in node) {
                throw new Error("Subject " + subject + " was already claimed by another link.");
            }
            /* Add it */
            node[fields[depth]] = { link: link, sublinks: {} };
        });
        /* Return */
        return dictionary;
    };
    /* Register a new link */
    Net.prototype.register = function () {
        var _this = this;
        var links = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            links[_i] = arguments[_i];
        }
        /* Get all functions */
        links.forEach(function (link) {
            /* Get output type */
            var output = link.output;
            /* Check if dictionary has key, and put link in it */
            var array = _this.links[output];
            array = array ? array : [];
            array.push(link);
            /* Set */
            _this.links[output] = array;
        });
    };
    return Net;
}());
exports.Net = Net;
