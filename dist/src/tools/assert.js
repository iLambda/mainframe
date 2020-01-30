"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = require("assert");
function assert(condition, msg) {
    if (!condition) {
        throw new assert_1.AssertionError({ message: msg });
    }
}
exports.assert = assert;
