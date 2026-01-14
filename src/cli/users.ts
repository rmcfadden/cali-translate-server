import { Command } from "commander";
import { UsersRepository } from "../repositories/users-repository";

const program = new Command();

program.version("1.0.0").description("Edit users");

program
    .command("add <username> <password>")
    .description("Add a new user")
    .action(async (username: string, password: string) => {
        const { findByUsername, create } = UsersRepository;
        const existingUser = await findByUsername(username);
        if (existingUser) {
            console.error(`User with username "${username}" already exists.`);
            process.exit(1);
        }

        const newUserId = await create(username, password);
        console.log(`User created with Id: ${newUserId}`);
        process.exit(1);
    });

program.parse(process.argv);
