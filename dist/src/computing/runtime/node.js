"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var repl_1 = require("../../interaction/repl");
/* A node contains multiple links */
var Node = /** @class */ (function () {
    /* The default constructor */
    function Node() {
    }
    Object.defineProperty(Node.prototype, "links", {
        /* The links of a node */
        get: function () {
            var _a, _b, _c;
            /* The list of links */
            var links = [];
            var allsubjects = new Set();
            var _loop_1 = function () {
                /* Check if link */
                if (!Reflect.getMetadata('link:', this_1, propname)) {
                    return "continue";
                }
                /* Get its signature */
                var output = Reflect.getMetadata('link:output', this_1, propname);
                var parameters = Reflect.getMetadata('design:paramtypes', this_1, propname);
                /* Typecheck */
                if (parameters[0] !== repl_1.REPL) {
                    throw new Error("A link must have take REPL as its first parameter");
                }
                /* Get subjects */
                var subjects = (_a = Reflect.getMetadata('link:subjects', this_1, propname), (_a !== null && _a !== void 0 ? _a : []));
                /* Check subjects exists */
                if (subjects.length == 0) {
                    /* Check if node terminal */
                    if (output === 'nothing') {
                        throw new Error("A terminal link must have at least one subject");
                    }
                }
                else {
                    /* Check if overlap */
                    if (subjects.some(function (s) { return allsubjects.has(s); })) {
                        /* There is an ovelap. */
                        throw new Error("Link subjects must not overlap");
                    }
                    /* Merge */
                    subjects.forEach(function (s) { return allsubjects.add(s); });
                }
                /* Get nldata file */
                var nlfile = (_b = Reflect.getMetadata('link:nldata', this_1.constructor), (_b !== null && _b !== void 0 ? _b : {}));
                var nldata = (_c = subjects.flatMap(function (subject) { var _a, _b; return _b = (_a = nlfile) === null || _a === void 0 ? void 0 : _a[subject], (_b !== null && _b !== void 0 ? _b : []); }), (_c !== null && _c !== void 0 ? _c : []));
                /* Make input list */
                var input = parameters.slice(1).map(function (f) { return f.name; });
                /* Convert the handler */
                var handler = this_1[propname];
                /* Its ok. Add it */
                links.push({ node: this_1, handler: handler, output: output, input: input, subjects: subjects, nldata: nldata });
            };
            var this_1 = this;
            /* Go through all properties */
            for (var propname in this) {
                _loop_1();
            }
            /* Return */
            return links;
        },
        enumerable: true,
        configurable: true
    });
    return Node;
}());
exports.Node = Node;
