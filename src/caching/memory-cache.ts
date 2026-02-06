import ICache from "./icache";

export default class MemoryCache implements ICache {
    private cache: Map<string, string>;

    constructor(_projectId?: number | undefined) {
        // projectId is accepted for interface compatibility but not used in memory cache
        this.cache = new Map<string, string>();
    }
    get(key: string): Promise<string | undefined> {
        return Promise.resolve(this.cache.get(key));
    }
    set(key: string, value: string): Promise<void> {
        this.cache.set(key, value);
        return Promise.resolve();
    }
}
