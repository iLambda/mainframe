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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var natural_1 = __importDefault(require("natural"));
var compromise_1 = __importDefault(require("compromise"));
var compromise_numbers_1 = __importDefault(require("compromise-numbers"));
var compromise_sentences_1 = __importDefault(require("compromise-sentences"));
var utterance_1 = require("./utterance");
/* Import compromise plugins */
compromise_1.default.extend(compromise_numbers_1.default);
compromise_1.default.extend(compromise_sentences_1.default);
/* The natural language interpret */
var Interpret = /** @class */ (function () {
    /* Constructor */
    function Interpret() {
    }
    /* Get semantics */
    Interpret.prototype.semantics = function (text) {
        /* Parse it */
        var semantics = compromise_1.default(text);
        /* Normalize text */
        semantics.normalize();
        /* Return */
        return semantics;
    };
    /* Get intent */
    Interpret.prototype.intent = function (semantics) {
        /* Get text */
        var text = semantics.text();
        /* Stem and tokenize */
        var stemmed = this.stemmer.tokenizeAndStem(text);
        // console.log(stemmed);
        return {
            modality: 'question',
            subjects: []
        };
    };
    /* Cure some text */
    Interpret.cure = function (text) {
        /* Return cured text */
        var semantics = text instanceof utterance_1.Utterance ? text.semantics :
            typeof text === "string" ? compromise_1.default(text)
                : text;
        return (semantics.normalize()).text();
    };
    /* Parse an utterance */
    Interpret.prototype.parse = function (text) {
        /* Parse the semantics, then the intent */
        var semantics = this.semantics(text);
        var intent = this.intent(semantics);
        /* Return the utterance */
        return new utterance_1.Utterance(this, intent, semantics);
    };
    /* Tokenize and stem */
    Interpret.prototype.stemtokenize = function (text) {
        return this.stemmer.tokenizeAndStem(text);
    };
    return Interpret;
}());
exports.Interpret = Interpret;
var VoiceInterpret = /** @class */ (function (_super) {
    __extends(VoiceInterpret, _super);
    function VoiceInterpret() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /* The tokenizer */
        _this.tokenizer = new natural_1.default.WordTokenizer();
        /* The stemmer */
        _this.stemmer = natural_1.default.PorterStemmer;
        return _this;
    }
    /* Get closest word that matches in the list of words */
    VoiceInterpret.prototype.closest = function (word, dictionary) {
        /* Return */
        return {
            set: dictionary,
            match: word,
            distance: 0.0
        };
    };
    return VoiceInterpret;
}(Interpret));
exports.VoiceInterpret = VoiceInterpret;
var TypeInterpret = /** @class */ (function (_super) {
    __extends(TypeInterpret, _super);
    function TypeInterpret() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /* The tokenizer */
        _this.tokenizer = new natural_1.default.WordTokenizer();
        /* The stemmer */
        _this.stemmer = natural_1.default.PorterStemmer;
        return _this;
    }
    /* Get closest word that matches in the list of words */
    TypeInterpret.prototype.closest = function (word, dictionary) {
        /* Return */
        return {
            set: dictionary,
            match: word,
            distance: 0.0
        };
    };
    return TypeInterpret;
}(Interpret));
exports.TypeInterpret = TypeInterpret;
