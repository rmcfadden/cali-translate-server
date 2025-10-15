import { OllamaTranslateAlternative } from "./ollama-translate-alternative";
export type OllamaTranslateResponse = {
    translation: string;
    alternatives: OllamaTranslateAlternative[];
};