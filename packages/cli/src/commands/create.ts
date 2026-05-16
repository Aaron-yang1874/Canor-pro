import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesDir = path.join(__dirname, '../../templates/plugin');

interface PluginAnswers {
  name: string;
  description: string;
  author: string;
}

async function replaceTemplateVariables(content: string, variables: PluginAnswers): Promise<string> {
  return content
    .replace(/\{\{name\}\}/g, variables.name)
    .replace(/\{\{description\}\}/g, variables.description)
    .replace(/\{\{author\}\}/g, variables.author);
}

async function copyTemplateFiles(targetDir: string, variables: PluginAnswers): Promise<void> {
  const files = await fs.readdir(templatesDir);

  for (const file of files) {
    const sourcePath = path.join(templatesDir, file);
    const stat = await fs.stat(sourcePath);

    if (stat.isFile()) {
      let content = await fs.readFile(sourcePath, 'utf-8');
      content = await replaceTemplateVariables(content, variables);
      const targetPath = path.join(targetDir, file);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, content);
    }
  }
}

export async function createPlugin(): Promise<void> {
  console.log(chalk.blue('Creating a new Canor plugin...\n'));

  const answers = await inquirer.prompt<PluginAnswers>([
    {
      type: 'input',
      name: 'name',
      message: 'Plugin name:',
      validate: (input) => input.length > 0 || 'Plugin name is required'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Plugin description:',
      default: 'A Canor plugin'
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author:',
      default: 'Anonymous'
    }
  ]);

  const targetDir = path.join(process.cwd(), answers.name);

  try {
    await fs.mkdir(targetDir, { recursive: true });
    await copyTemplateFiles(targetDir, answers);

    console.log(chalk.green(`\n✓ Plugin "${answers.name}" created successfully!`));
    console.log(chalk.gray(`  Location: ${targetDir}`));
    console.log(chalk.gray('\n  Get started:'));
    console.log(chalk.cyan(`    cd ${answers.name}`));
    console.log(chalk.cyan('    canor dev'));
  } catch (error) {
    console.error(chalk.red('Failed to create plugin:'), error);
    process.exit(1);
  }
}
