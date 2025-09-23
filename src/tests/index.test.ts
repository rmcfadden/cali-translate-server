import {greet} from './greet';

describe('index', () => {  
    test('dummy test', () => {
        expect(greet).toBe("Hello, World!");
    })
});