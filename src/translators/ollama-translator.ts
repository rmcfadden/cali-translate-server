import { TranslateRequest } from "../translate-request";
import { TranslateResponse } from "../translate-response";
import Translator from "../translator";
import { OllamaTranslateResponse } from "./ollama-translate-response";
import {Ollama} from 'ollama';


export default class OllamaTranslator extends Translator {
    async translate(request: TranslateRequest): Promise<TranslateResponse> {
        const  {text, to } = request;
        const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
        const message = `Translate: "${text}" to ${to}.`;
        console.log('translating:',message);
        const response = await ollama.chat({
            model: 'wizardlm2',//'gemma3:4b',
            messages: [{ role: 'user', content: message }],
            stream:false,
            options:{temperature: 0.5},
            format: {
            type: "object",
            properties: {
                translation: { type: "string" },
                alternatives: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                    translation: { type: "string" },
                    details: { type: "string" }
                    }
                }
                }
            },
            required: ["translation","alternatives"]
            }
        });
        const {message: {content}}  = response;
        const parsedResponse: OllamaTranslateResponse = JSON.parse(content);
        return {
            translation: parsedResponse?.translation ?? "",
            alternatives: (parsedResponse?.alternatives ?? [])
                .map(alt => ({ translation: alt.translation, details: alt.details })),
            to,
            service: "ollama"   
        } as TranslateResponse
    }
}