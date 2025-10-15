import { TranslateResponseAlternative } from "./translate-response-alternative";
export type TranslateResponse = {
    to: string;
    translation: string;
    alternatives?: TranslateResponseAlternative[];
    service: string | undefined;
};