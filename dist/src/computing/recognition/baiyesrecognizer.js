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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var natural_1 = __importDefault(require("natural"));
var recognizer_1 = require("./recognizer");
var interpret_1 = require("../../interaction/nlp/data/interpret");
var assert_1 = require("../../tools/assert");
var NaiveRecognizer = /** @class */ (function (_super) {
    __extends(NaiveRecognizer, _super);
    /* The constructor */
    function NaiveRecognizer(net, interpret) {
        var _this = 
        /* Parent */
        _super.call(this, net, interpret) || this;
        /* Initialize own fields */
        _this.nodes = net.root();
        /* Populate the classifier hierarchy */
        _this.classifiers = _this.populate(_this.nodes);
        return _this;
    }
    NaiveRecognizer.prototype.populate = function (links, identifier, link) {
        if (identifier === void 0) { identifier = null; }
        if (link === void 0) { link = null; }
        var _a, _b;
        /* The subclassifier array */
        var subclassifiers = {};
        /* Get all keys */
        for (var key in links) {
            /* Check if self key */
            if (!links.hasOwnProperty(key)) {
                continue;
            }
            /* Make identifier */
            var subid = identifier ? identifier + "." + key : "" + key;
            /* Add key, and populate */
            subclassifiers[key] = this.populate(links[key].sublinks, subid, links[key].link);
        }
        /* Get own training data */
        var data = (_b = (_a = link) === null || _a === void 0 ? void 0 : _a.nldata, (_b !== null && _b !== void 0 ? _b : []));
        /* Return */
        return {
            /* Only create a classifier if link has sublinks */
            classifier: Object.entries(links).length != 0 ? new natural_1.default.LogisticRegressionClassifier() : null,
            /* Add the rest of the object properties */
            identifier: identifier,
            subclassifiers: subclassifiers,
            data: data
        };
    };
    NaiveRecognizer.prototype.preprocess = function (sentence) {
        return interpret_1.Interpret.cure(sentence);
    };
    NaiveRecognizer.prototype.train = function () {
        return __awaiter(this, void 0, void 0, function () {
            var addDocuments, samples, subtrain;
            var _this = this;
            return __generator(this, function (_a) {
                addDocuments = function (classifier, text, stem) {
                    text.map(function (t) { return _this.preprocess(t); }).forEach(function (t) { return classifier.addDocument(t, stem); });
                };
                samples = {};
                subtrain = function (hierarchy) {
                    /* Check if any subclassifiers */
                    if (Object.entries(hierarchy.subclassifiers).length == 0) {
                        /* Leaf. Check if not root node */
                        if (hierarchy.identifier) {
                            /* Save single training data */
                            samples[hierarchy.identifier] = hierarchy.data;
                        }
                    }
                    else {
                        /* Node. Assert classifier exists */
                        assert_1.assert(hierarchy.classifier != null, "Node classifier is null!");
                        /* Get the classifier */
                        var classifier_1 = hierarchy.classifier;
                        /* Check if this is the root node */
                        if (hierarchy.identifier) {
                            /* For each sentence, train this node */
                            addDocuments(classifier_1, hierarchy.data, hierarchy.identifier);
                        }
                        /* For each subclass */
                        Object.entries(hierarchy.subclassifiers).forEach(function (_a) {
                            var _ = _a[0], subhierarchy = _a[1];
                            /* Assert subhierarchy isn't root */
                            assert_1.assert(subhierarchy.identifier != null, "Subclassifier cannot be root!");
                            /* Train the child */
                            subtrain(subhierarchy);
                            /* For each sentence, train this node */
                            addDocuments(classifier_1, samples[subhierarchy.identifier], subhierarchy.identifier);
                        });
                        /* End training */
                        classifier_1.train();
                        /* Now, it is time to fullfill the invariant
                           and concatenate all children data with self,
                           for memoization purposes */
                        var childrenData = Object.entries(hierarchy.subclassifiers).flatMap(function (_a) {
                            var _ = _a[0], subhierarchy = _a[1];
                            var _b;
                            /* Assert subhierarchy isn't root */
                            assert_1.assert(subhierarchy.identifier != null, "Subclassifier cannot be root!");
                            /* Return */
                            return _b = samples[subhierarchy.identifier], (_b !== null && _b !== void 0 ? _b : []);
                        });
                        var ownData = hierarchy.data;
                        /* Concatenate and set */
                        if (hierarchy.identifier) {
                            samples[hierarchy.identifier] = __spreadArrays(ownData, childrenData);
                        }
                    }
                };
                /* Train the subclassifiers */
                subtrain(this.classifiers);
                return [2 /*return*/];
            });
        });
    };
    NaiveRecognizer.prototype.recall = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                /* Train network */
                this.train();
                return [2 /*return*/];
            });
        });
    };
    NaiveRecognizer.prototype.classify = function (utterance) {
        return __awaiter(this, void 0, void 0, function () {
            var pick;
            return __generator(this, function (_a) {
                pick = function (hierarchy, threshold) {
                    if (threshold === void 0) { threshold = null; }
                    var _a;
                    /* Check classifier */
                    if (!hierarchy.classifier) {
                        throw new Error("Classifier has not been trained.");
                    }
                    /* Get classifications and sort */
                    var classification = hierarchy.classifier
                        .getClassifications(utterance.text)
                        .sort(function (c) { return c.value; });
                    /* Get top classification score */
                    var score = classification[0].value;
                    var label = classification[0].label;
                    /* Try get the subclassifier */
                    var subidentifier = label.replace(/.*\.([^\.]+)$/g, "$1");
                    var subhierarchy = hierarchy.subclassifiers[subidentifier];
                    /* Make the threshold check */
                    var thresholdOk = threshold ? score > threshold : true;
                    /* Check if there are subclassifiers */
                    if (((_a = subhierarchy) === null || _a === void 0 ? void 0 : _a.classifier) && thresholdOk) {
                        /* Pick in the subhierarchy */
                        return pick(subhierarchy);
                    }
                    else {
                        /* Return if threshold */
                        return thresholdOk ? label : null;
                    }
                };
                /* Check if the top classification is over 1/2 */
                return [2 /*return*/, pick(this.classifiers, 0.5)];
            });
        });
    };
    return NaiveRecognizer;
}(recognizer_1.Recognizer));
exports.NaiveRecognizer = NaiveRecognizer;
