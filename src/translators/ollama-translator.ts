import { TranslateRequest } from "../translate-request";
import { TranslateResponse } from "../translate-response";
import Translator from "../translator";
import { OllamaTranslateResponse } from "./ollama-translate-response";
import { Ollama } from "ollama";
import dotenv from "dotenv";

dotenv.config();

export default class OllamaTranslator extends Translator {
    async translate(request: TranslateRequest): Promise<TranslateResponse> {
        const { text, to } = request;
        console.log("process.env.OLLAMA_URL:", process.env.OLLAMA_URL);
        const host = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
        console.log("Using Ollama host:", host);
        const ollama = new Ollama({ host });
        const message = `Translate: "${text}" to ${to}.`;
        console.log("translating:", message);
        const response = await ollama.chat({
            model: "wizardlm2", //'gemma3:4b',
            messages: [{ role: "user", content: message }],
            stream: false,
            options: { temperature: 0.5 },
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
                                details: { type: "string" },
                            },
                        },
                    },
                },
                required: ["translation", "alternatives"],
            },
        });
        const {
            message: { content },
        } = response;
        console.log("ollama response:", response);

        const parsedResponse: OllamaTranslateResponse = JSON.parse(content);
        return {
            translation: parsedResponse?.translation ?? "",
            alternatives: (parsedResponse?.alternatives ?? []).map((alt) => ({
                translation: alt.translation,
                details: alt.details,
            })),
            to,
            service: "ollama",
        } as TranslateResponse;
    }
}
