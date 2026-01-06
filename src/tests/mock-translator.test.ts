import Translator from '../translators/mock-translator';
import { TranslateRequest } from '../translate-request';

describe('translator', () => {  
    test('translator translate', async () => {
        const translator = new Translator(); 
        const request: TranslateRequest = {
            text: 'Hello, world!',
            to: 'es'
        };
        const {to, translation} = await translator.translate(request);
        expect(to).toBe("es");
        expect(translation).toBe("[Mock translation to es]: Hello, world!");
    })
});