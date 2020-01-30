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
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("stream");
var SSHWordTransform = /** @class */ (function (_super) {
    __extends(SSHWordTransform, _super);
    /* Build a transformer */
    function SSHWordTransform() {
        var _this = 
        /* Build */
        _super.call(this, {
            objectMode: false,
            readableObjectMode: false,
            writableObjectMode: false
        }) || this;
        /* Check if stream opened */
        _this.allowData = false;
        return _this;
    }
    Object.defineProperty(SSHWordTransform, "backspace", {
        /* Backspace char */
        get: function () { return SSHWordTransform.ascii('\x7F'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SSHWordTransform, "newline", {
        /* Newline char */
        get: function () { return SSHWordTransform.ascii('\r'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SSHWordTransform, "punctuation", {
        /* Punctuation */
        get: function () {
            var chars = ['?', ' ', '.', '-', '=', '+', '*', '&', "'", ','];
            return chars.map(SSHWordTransform.ascii);
        },
        enumerable: true,
        configurable: true
    });
    /* Get ascii code */
    SSHWordTransform.ascii = function (s) {
        return s.charCodeAt(0);
    };
    /* Check if word */
    SSHWordTransform.isWordCharacter = function (c) {
        return (c >= SSHWordTransform.ascii('A') && c <= SSHWordTransform.ascii('Z')) /* Handle A-Z */
            || (c >= SSHWordTransform.ascii('a') && c <= SSHWordTransform.ascii('z')) /* Handle a-z */
            || (c >= SSHWordTransform.ascii('0') && c <= SSHWordTransform.ascii('9')) /* Handle 0-9 */
            || (c == SSHWordTransform.backspace) /* Handle backspace */
            || SSHWordTransform.punctuation.includes(c); /* Handle punctuation */
    };
    /* Transform */
    SSHWordTransform.prototype._transform = function (buffer, encoding, next) {
        /* Check if opened */
        if (this.allowData) {
            /* Get index of newline */
            var newlineIdx = buffer.indexOf(SSHWordTransform.newline);
            var hasNewline = newlineIdx != -1;
            /* Cut until newline */
            var chunk = hasNewline
                ? buffer.subarray(0, newlineIdx)
                : buffer;
            /* Filter */
            var filteredData = chunk.filter(SSHWordTransform.isWordCharacter);
            /* Check length */
            if (filteredData.length != 0) {
                /* Push */
                this.push(Buffer.from(filteredData));
            }
            /* If newline, close stream */
            if (hasNewline) {
                this.allowData = false;
                /* Send event */
                this.emit('block');
            }
        }
        /* Done */
        next();
    };
    return SSHWordTransform;
}(stream_1.Transform));
exports.SSHWordTransform = SSHWordTransform;
