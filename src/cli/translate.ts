import { Command } from 'commander';
import app from '../app';

const program = new Command();
program
    .version('1.0.0')
    .description('Edit api keys');

program
  .command('translate <username>')
  .description('Create a new api key for username')
  .action(async (to: string, text: string) => {
    const response = await app.get('/api/translate')
    console.log('Translation response:', response);
  });

program.parse(process.argv);