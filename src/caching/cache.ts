export default class Cache<T = string> {
    private cache: Map<string, T>;
    constructor() {
        this.cache = new Map<string, T>();
    } 
    get(key: string): T | undefined {
        return this.cache.get(key);
    }
    
    set(key: string, value: T): void {
        this.cache.set(key, value);
    }
}