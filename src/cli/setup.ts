import { Command } from 'commander';
import { UsersRepository } from '../repositories/usersRepository';
import { ProjectRepository } from '../repositories/projectRepository';

const program = new Command();
program
  .version('1.0.0')
  .description('Setup');

program
  .command('create <password>')
    .description('Create a new api key for username')
    .action(async (password: string) => {
        const {findByUsername, create: createAdmin} = UsersRepository;
        const adminUser = await findByUsername('admin');
        const adminUserId = adminUser ? adminUser.id : (await createAdmin('admin', password));
        console.log(adminUser ? `Admin user already exist swith Id: ${adminUserId}` : `Admin user created with Id: ${adminUserId}`);

        const {create: createProject, findByName} = ProjectRepository;
        const existingProject = await findByName('default');
        const defaultProjectId = existingProject ? existingProject.id : await createProject('default');
        console.log(existingProject ? `Default project already exists with Id: ${defaultProjectId}` : `Default project created with Id: ${defaultProjectId}`);
        process.exit(1);
    });

program.parse(process.argv);