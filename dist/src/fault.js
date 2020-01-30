"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Fault = /** @class */ (function () {
    /* Make an early exit error */
    function Fault(reason, explanation) {
        if (explanation === void 0) { explanation = null; }
        /* Save */
        this.reason = reason;
        this.explanation = explanation;
    }
    return Fault;
}());
exports.Fault = Fault;
