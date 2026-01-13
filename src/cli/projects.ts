import { Command } from "commander";
import { ProjectsRepository } from "../repositories/projectsRepository";
import { UsersRepository } from "../repositories/usersRepository";
import { ProjectsUsersRepository } from "../repositories/projectsUserssRepository";

const program = new Command();
program.version("1.0.0").description("Edit projects");

program
    .command("add <projectName> [isPublic] [users]")
    .description("Create a new project")
    .action(async (projectName: string, isPublic?: boolean, users?: string) => {
        const { create } = ProjectsRepository;
        const newProjectId = await create(projectName, isPublic);

        const usersIds = await getUserIds(users);

        const { create: createProjectUser } = ProjectsUsersRepository;
        const newProjectUsersIds = await Promise.all(
            usersIds.map((userId) => createProjectUser(newProjectId, userId)),
        );
        if (newProjectUsersIds.some((id) => id === -1))
            throw new Error("Error adding users to project");

        console.log(`Project created with Id: ${newProjectId}`);

        process.exit(1);
    });
program.parse(process.argv);

const getUserIds = async (users: string | undefined): Promise<number[]> => {
    const splitUsers =
        users?.split(",")?.map((u) => u.trim()) ?? ([] as string[]);
    return (
        await Promise.all<number>(
            splitUsers.map(async (idOrUsername: string) => {
                if (Number.isInteger(Number(idOrUsername)))
                    return Number(idOrUsername);
                const { findByUsername } = UsersRepository;
                const user = await findByUsername(idOrUsername);
                return user?.id ?? -1;
            }),
        )
    ).filter((id) => id !== -1);
};
