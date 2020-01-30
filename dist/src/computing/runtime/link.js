"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
;
/* Specify this function's natural language data file */
function nldata(data) {
    return function (target) {
        /* Define link: and output type metadata */
        Reflect.defineMetadata('link:nldata', data, target);
    };
}
exports.nldata = nldata;
/* Specify this function represents a link */
function link(output) {
    var _a, _b;
    /* Get output type */
    var outputname = (_b = (_a = output) === null || _a === void 0 ? void 0 : _a.name, (_b !== null && _b !== void 0 ? _b : 'nothing'));
    /* Check if class is node */
    return function (target, key, desc) {
        /* Define link: and output type metadata */
        Reflect.defineMetadata('link:', true, target, key);
        Reflect.defineMetadata('link:output', outputname, target, key);
    };
}
exports.link = link;
/* Specify subject of function */
function subject(subject, modalities) {
    /* Return descriptor */
    return function (target, key, desc) {
        var _a;
        /* Get intent list and push to it */
        var intents = (_a = Reflect.getMetadata('link:subjects', target, key), (_a !== null && _a !== void 0 ? _a : []));
        intents.push(subject);
        /* Define intent & training data*/
        Reflect.defineMetadata('link:subjects', intents, target, key);
    };
}
exports.subject = subject;
