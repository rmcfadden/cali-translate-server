import { TranslateRequestOptions } from "./translate-request-options";
export type TranslateRequest = {
    to: string;
    text: string;
    service: string | undefined;
    options?: TranslateRequestOptions;
};