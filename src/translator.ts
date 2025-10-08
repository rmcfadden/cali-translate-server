import { TranslateResponse } from "./translate-response";

export default abstract class Translator {
    abstract translate(text: string, to: string): Promise<TranslateResponse>;
}