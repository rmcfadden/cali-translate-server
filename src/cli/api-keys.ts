import { Command } from 'commander';
import crypto from 'crypto';
import { UsersRepository } from '../repositories/usersRepository';
import { ApiKeyRepository } from '../repositories/apiKeyRepository';

  const program = new Command();

  program
    .version('1.0.0')
    .description('Edit api keys');

  program
    .command('add <username>')
    .description('Create a new api key for username')
    .action(async (username: string) => {
        const {findByUsername} = UsersRepository;
        const existingUser = await findByUsername(username);
        if (!existingUser) {
            console.error(`User with username "${username}" does not exist`);
            process.exit(1);
        }
        const name = crypto.randomBytes(32).toString('hex');
        const secret = crypto.randomBytes(32).toString('hex');
        const {create} = ApiKeyRepository;
        const newApiKeyId = await create({user_id: existingUser.id, name, secret});
        console.log(`Api key created with Id: ${newApiKeyId} and name: ${name} and secret: ${secret}`);
        process.exit(1);
    });


  program.parse(process.argv);