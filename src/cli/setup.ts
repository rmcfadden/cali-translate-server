import { Command } from "commander";
import { UsersRepository } from "../repositories/users-repository";
import { ProjectsRepository } from "../repositories/projects-repository";

const program = new Command();
program.version("1.0.0").description("Setup");

program
    .command("create <password>")
    .description("Setup admin user and default project")
    .action(async (password: string) => {
        const { findByUsername, create: createAdmin } = UsersRepository;
        const adminUser = await findByUsername("admin");
        const adminUserId = adminUser
            ? adminUser.id
            : await createAdmin("admin", password);
        console.log(
            adminUser
                ? `Admin user already exist swith Id: ${adminUserId}`
                : `Admin user created with Id: ${adminUserId}`,
        );

        const { create: createProject, findByName } = ProjectsRepository;
        const existingProject = await findByName("default");
        const defaultProjectId = existingProject
            ? existingProject.id
            : await createProject("default", true);
        console.log(
            existingProject
                ? `Default project already exists with Id: ${defaultProjectId}`
                : `Default project created with Id: ${defaultProjectId}`,
        );
        process.exit(1);
    });

program.parse(process.argv);
