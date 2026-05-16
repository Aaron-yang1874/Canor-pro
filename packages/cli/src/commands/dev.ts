import chalk from 'chalk';
import chokidar from 'chokidar';
import path from 'path';

export async function devPlugin(): Promise<void> {
  const pluginDir = process.cwd();

  console.log(chalk.blue('Starting Canor plugin development mode...\n'));
  console.log(chalk.gray(`  Watching: ${pluginDir}`));
  console.log(chalk.gray('  Press Ctrl+C to stop\n'));

  const watcher = chokidar.watch(path.join(pluginDir, '**/*.{ts,js,json}'), {
    ignored: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
    persistent: true,
    ignoreInitial: true
  });

  watcher
    .on('add', (filePath) => console.log(chalk.green(`  + ${path.relative(pluginDir, filePath)}`)))
    .on('change', (filePath) => console.log(chalk.yellow(`  ~ ${path.relative(pluginDir, filePath)}`)))
    .on('unlink', (filePath) => console.log(chalk.red(`  - ${path.relative(pluginDir, filePath)}`)))
    .on('error', (error) => console.error(chalk.red('Error:'), error));

  process.on('SIGINT', async () => {
    console.log(chalk.yellow('\n\nStopping watcher...'));
    await watcher.close();
    process.exit(0);
  });
}
