import Translator from '../translators/mock-translator';

describe('translator', () => {  
    test('translator translate', async () => {
        const translator = new Translator(); 
        const {to, translation} = await translator.translate('Hello, world!', 'es');
        expect(to).toBe("es");
        expect(translation).toBe("[Mock translation to es]: Hello, world!");
    })
});