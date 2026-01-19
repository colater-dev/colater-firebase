/**
 * CLI init wizard for Colater MCP Server
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { saveConfig, getConfigFile } from '../config.js';
import type { ColaterMCPConfig } from '../config.js';

export async function init() {
  console.log(chalk.bold.blue('\n🎨 Colater MCP Server Setup\n'));

  console.log('This wizard will help you configure the Colater MCP Server.');
  console.log('You will need a Colater API key from: https://colater.ai/settings/api-keys\n');

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiKey',
      message: 'Enter your Colater API key:',
      validate: (input: string) => {
        if (!input) {
          return 'API key is required';
        }
        if (!input.startsWith('colater_sk_')) {
          return 'API key must start with "colater_sk_"';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'apiEndpoint',
      message: 'API endpoint:',
      default: 'https://colater.ai/api/mcp',
    },
    {
      type: 'input',
      name: 'defaultBrandId',
      message: 'Default brand ID (optional, press Enter to skip):',
    },
    {
      type: 'confirm',
      name: 'enableCache',
      message: 'Enable local caching for better performance?',
      default: true,
    },
    {
      type: 'number',
      name: 'cacheTtl',
      message: 'Cache TTL in seconds:',
      default: 300,
      when: (answers: any) => answers.enableCache,
      validate: (input: number) => {
        if (input < 0) {
          return 'TTL must be positive';
        }
        return true;
      },
    },
  ]);

  // Build config
  const config: ColaterMCPConfig = {
    apiKey: answers.apiKey,
    apiEndpoint: answers.apiEndpoint,
    ...(answers.defaultBrandId && { defaultBrandId: answers.defaultBrandId }),
    cache: {
      enabled: answers.enableCache,
      ttl: answers.cacheTtl || 300,
    },
  };

  // Save config
  await saveConfig(config);

  console.log(chalk.green('\n✓ Configuration saved successfully!'));
  console.log(chalk.gray(`  Location: ${getConfigFile()}\n`));

  console.log(chalk.bold('Next steps:\n'));
  console.log('1. Add Colater MCP to your MCP client configuration');
  console.log(chalk.cyan('   For Claude Desktop:'));
  console.log(chalk.gray('   Edit: ~/Library/Application Support/Claude/claude_desktop_config.json\n'));
  console.log('   {');
  console.log('     "mcpServers": {');
  console.log('       "colater": {');
  console.log('         "command": "npx",');
  console.log('         "args": ["-y", "@colater/mcp-server"]');
  console.log('       }');
  console.log('     }');
  console.log('   }\n');

  console.log('2. Restart your MCP client to load the server');
  console.log('3. Test by asking: "Get context for my brand"\n');

  console.log(chalk.gray('Documentation: https://docs.colater.ai/mcp\n'));
}
