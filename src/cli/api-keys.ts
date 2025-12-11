import { Command } from 'commander';
import crypto from 'crypto';
import { UsersRepository } from '../repositories/usersRepository';
import { ApiKeyRepository } from '../repositories/apiKeyRepository';
import { ApiQuotaRepository } from '../repositories/apiQuotaRepository';

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
        const token = Buffer.from(`${name}:${secret}`).toString('base64');
        console.log(`Api key created with Id: ${newApiKeyId} and name: ${name} and secret: ${secret}\n`);
        console.log(`Header x-api-key: ${token}`);
        console.log(`Query x-api-key=${token}`);
        process.exit(1);        
    });

    program
      .command('get <key>')
      .description('Get api key by name or id')
      .action(async (key: string) => {
        const {findByName, findById} = ApiKeyRepository;
        const apiKey = isNaN(Number(key)) ? await findByName(key) : await findById(Number(key));
        if (!apiKey) {
            console.error(`Api key "${key}" not found`);
            process.exit(1);
        } 
        console.log(`Api Key name: ${apiKey.name}, User Id: ${apiKey.user_id}, Enabled: ${apiKey.is_enabled}, Created: ${apiKey.created}`);
        process.exit(1);

      });

    program
      .command('quota-list <key>')
      .description('List quotas for api key')
      .action(async (key: string) => {
        const apiKey = await getApiKeyByKeyOrExit(key);
        const {listByApiKey} = ApiQuotaRepository;
        const quotas  = await listByApiKey(apiKey.id);
        console.log(`Quotas: ${JSON.stringify(quotas)}`);
        process.exit(1);
      });

    program
      .command('quota-add <key> <intervalUnit> <interval>')
      .description('Add quota for api key')
      .action(async (key: string, interval_unit: string, interval: number) => {
        const apiKey = await getApiKeyByKeyOrExit(key);    
        const {create} = ApiQuotaRepository;
        const newQuotaId = await create({api_key_id: apiKey.id, interval, interval_unit});
        console.log(`Quota created with Id: ${newQuotaId}`);
        process.exit(1);
      });

  const getApiKeyByKeyOrExit = async (key: string) => {
    const {findByName, findById} = ApiKeyRepository;
    const apiKey = isNaN(Number(key)) ? await findByName(key) : await findById(Number(key));
      if (!apiKey) {
            console.error(`Api key "${key}" not found`);
            process.exit(1);
        } 
    return apiKey;
  }


  program.parse(process.argv);