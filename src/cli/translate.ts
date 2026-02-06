import { Command } from 'commander';
import app from '../app';

const program = new Command();
program
    .version('1.0.0')
    .description('Edit api keys');

program
  .command('translate <username>')
  .description('Create a new api key for username')
  .action(async (username: string) => {
    const response = await app.get('/api/translate')
    console.log('Translation response:', response, username);
  });

program.parse(process.argv);