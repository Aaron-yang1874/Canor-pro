import chalk from 'chalk';
import { execSync } from 'child_process';
import path from 'path';

export async function buildPlugin(): Promise<void> {
  const pluginDir = process.cwd();
  const tsconfigPath = path.join(pluginDir, 'tsconfig.json');

  console.log(chalk.blue('Building Canor plugin...\n'));

  try {
    execSync('npx tsc', { cwd: pluginDir, stdio: 'inherit' });

    console.log(chalk.green('\n✓ Build completed successfully!'));
    console.log(chalk.gray(`  Output: ${path.join(pluginDir, 'dist')}`));
  } catch (error) {
    console.error(chalk.red('\n✗ Build failed:'), error);
    process.exit(1);
  }
}
