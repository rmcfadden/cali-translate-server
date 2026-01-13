import { n } from "ollama/dist/shared/ollama.415fa141";
import ICache from "./icache";
import MemoryCache from "./memory-cache";
import MysqlCache from "./mysql-cache";

const CacheFactory = () => {
    const _caches = new Map<string, { new (projectId?: number): ICache }>([
        ["mysql", MysqlCache],
        ["memory", MemoryCache],
    ]);
    const create = (
        name: string,
        projectId: number | undefined = undefined,
    ): ICache | undefined => {
        const CacheClass = _caches.get(name);
        return CacheClass ? new CacheClass(projectId) : undefined;
    };
    return {
        create,
    };
};

export default CacheFactory();
