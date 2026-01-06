import { TranslateResponse } from "./translate-response";
import { TranslateRequest } from "./translate-request";

export default abstract class Translator {
    abstract translate(request: TranslateRequest): Promise<TranslateResponse>;
}