"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ollama_translator_1 = require("./ollama-translator");
var TranslatorFactory = /** @class */ (function () {
    function TranslatorFactory() {
    }
    TranslatorFactory.create = function (_) {
        // Here you can add logic to choose different translators based on configuration
        return new ollama_translator_1.default();
    };
    return TranslatorFactory;
}());
exports.default = TranslatorFactory;
