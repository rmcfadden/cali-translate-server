import { TranslateResponseAlternative } from "./translate-response-alternative";
import { TranslateResponseDetails } from "./translate-response-details";

export type TranslateResponse = {
    to: string;
    translation: string;
    alternatives?: TranslateResponseAlternative[];
    service: string | undefined;
    details?: TranslateResponseDetails;
};
