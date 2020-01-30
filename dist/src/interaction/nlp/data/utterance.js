"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interpret_1 = require("./interpret");
/* An interpreted text typed/spoken by an user */
var Utterance = /** @class */ (function () {
    /* Build an utterance */
    function Utterance(interpret, intent, semantics) {
        /* Save text and parse */
        this.intent = intent;
        this.semantics = semantics;
    }
    Object.defineProperty(Utterance.prototype, "text", {
        /* The original text */
        get: function () { return this.semantics.text(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Utterance.prototype, "cured", {
        /* The cured text */
        get: function () { return interpret_1.Interpret.cure(this); },
        enumerable: true,
        configurable: true
    });
    return Utterance;
}());
exports.Utterance = Utterance;
;
