import { Command } from 'commander';
import chalk from 'chalk';
import { createPlugin } from './commands/create.js';
import { devPlugin } from './commands/dev.js';
import { buildPlugin } from './commands/build.js';
import { testPlugin } from './commands/test.js';

const program = new Command();

program
  .name('canor')
  .description('Canor Plugin Development CLI')
  .version('1.0.0');

program
  .command('create')
  .description('Create a new Canor plugin')
  .action(createPlugin);

program
  .command('dev')
  .description('Start development mode with file watching')
  .action(devPlugin);

program
  .command('build')
  .description('Build the plugin for production')
  .action(buildPlugin);

program
  .command('test')
  .description('Run plugin tests')
  .action(testPlugin);

program.parse();
