import chalk from 'chalk';
import { execSync } from 'child_process';

export async function testPlugin(): Promise<void> {
  const pluginDir = process.cwd();

  console.log(chalk.blue('Running tests...\n'));

  try {
    execSync('npx jest', { cwd: pluginDir, stdio: 'inherit' });

    console.log(chalk.green('\n✓ Tests completed successfully!'));
  } catch (error) {
    console.error(chalk.red('\n✗ Tests failed:'), error);
    process.exit(1);
  }
}
