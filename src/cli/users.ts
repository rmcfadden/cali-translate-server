import { Command } from 'commander';
import { UsersRepository } from '../repositories/usersRepository';

    const program = new Command();

    program
      .version('1.0.0')
      .description('Edit users');

    program
      .command('add <username> <password>')
      .description('Add a new user')
      .action(async (username: string, password: string) => {
        const {create} = UsersRepository;
        const newUserId = await create(username, password);
        console.log(`User created with ID: ${newUserId}`);
      });

    program.parse(process.argv);