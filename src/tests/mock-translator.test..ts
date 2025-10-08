import Translator from '../translators/mock-translator';

describe('translator', () => {  
    test('translator translate', async () => {
        const translator = new Translator(); 
        const reesponse = await translator.translate('Hello, world!', 'es');

        //expect(greet).toBe("Hello, World!");
    })
});