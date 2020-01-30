"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Abandon = /** @class */ (function () {
    /* Make an early exit error */
    function Abandon(reason, continuation) {
        this.reason = reason;
        this.continuation = {
            node: continuation.node,
            input: continuation.input
        };
    }
    return Abandon;
}());
exports.Abandon = Abandon;
