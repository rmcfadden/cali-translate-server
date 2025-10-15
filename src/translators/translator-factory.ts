import Translator from "../translator";
import OllamaTranslator from "./ollama-translator";

export default class TranslatorFactory {
    static create(_: string): Translator {
        // Here you can add logic to choose different translators based on configuration
        return new OllamaTranslator();
    }
}