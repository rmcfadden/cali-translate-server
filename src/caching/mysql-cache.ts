import ICache from "./icache";
import { CachesRepository } from "../repositories/cachesRepository";
import { ProjectRepository } from "../repositories/projectRepository";

const MysqlCache: ICache = {
    get: async (key: string): Promise<string | undefined> => {
        const project = await ProjectRepository.findByName("default");
        if (!project) throw new Error("Default project not found");
        return (await CachesRepository.get(project.id, key))?.value;
    },
    set: async (key: string, value: string) => {
        const project = await ProjectRepository.findByName("default");
        if (!project) throw new Error("Default project not found");
        const { create } = CachesRepository;
        await create(project.id, key, value);
    },
};

export default MysqlCache;
