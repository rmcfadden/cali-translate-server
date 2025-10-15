import { TranslateResponse } from "../translate-response";
import Translator from "../translator";

export default class MockTranslator extends Translator {
    async translate(text: string, to: string): Promise<TranslateResponse> {
        return {
            text: `[Mock translation to ${to}]: ${text}`,
            to
        } as TranslateResponse
    }
}