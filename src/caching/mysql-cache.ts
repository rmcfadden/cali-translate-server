import ICache from "./icache";
import { CachesRepository } from "../repositories/caches-repository";

export default class MysqlCache implements ICache {
    private projectId?: number | undefined;
    constructor(projectId?: number | undefined) {
        this.projectId = projectId;
    }
    async get(key: string): Promise<string | undefined> {
        if (!this.projectId) throw new Error("projectId is undefined");
        return (await CachesRepository.get(this.projectId as number, key))
            ?.value;
    }
    async set(key: string, value: string) {
        if (!this.projectId) throw new Error("projectId is undefined");
        const { create } = CachesRepository;
        await create(this.projectId as number, key, value);
    }
}
