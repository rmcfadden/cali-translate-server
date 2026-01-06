import { TranslateRequest } from "../translate-request";
import { TranslateResponse } from "../translate-response";
import Translator from "../translator";

export default class MockTranslator extends Translator {
    async translate(request: TranslateRequest): Promise<TranslateResponse> {
        const  {text, to } = request;
        return {
            translation: `[Mock translation to ${to}]: ${text}`,
            to
        } as TranslateResponse
    }
}