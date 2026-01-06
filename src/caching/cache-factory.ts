import ICache  from './icache';
import MemoryCache from './memory-cache';
import MysqlCache from './mysql-cache';

const CacheFactory = () => {
    const _caches = new Map<string, ICache>([
        ["mysql", MysqlCache],
        ["memory", new MemoryCache()],
    ]);
    const create = (name: string): ICache | undefined => _caches.get(name);
    return {
        create,
    }
}

export default CacheFactory();