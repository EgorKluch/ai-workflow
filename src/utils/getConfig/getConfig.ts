import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getConfig<TConfig = unknown>(projectPath?: string): TConfig {
  let configPath: string;
  
  // If projectPath is provided, try to find .ai/workflow.yaml
  if (projectPath) {
    const aiConfigPath = path.join(projectPath, '.ai/workflow.yaml');
    if (fs.existsSync(aiConfigPath)) {
      configPath = aiConfigPath;
    } else {
      // Fallback to default config.yaml
      configPath = path.join(__dirname, '../../../config/config.yaml');
    }
  } else {
    // Default behavior - use config.yaml
    configPath = path.join(__dirname, '../../../config/config.yaml');
  }
  
  const configContent = fs.readFileSync(configPath, 'utf8');
  return yaml.load(configContent) as TConfig;
}

export function getCoreConfig<TConfig = unknown>(projectPath?: string): TConfig {
  let configPath: string;
  
  // If projectPath is provided, try to find .ai/core.yaml
  if (projectPath) {
    const aiCoreConfigPath = path.join(projectPath, '.ai/core.yaml');
    if (fs.existsSync(aiCoreConfigPath)) {
      configPath = aiCoreConfigPath;
    } else {
      // Fallback to default core.yaml
      configPath = path.join(__dirname, '../../../config/core.yaml');
    }
  } else {
    // Default behavior - use core.yaml
    configPath = path.join(__dirname, '../../../config/core.yaml');
  }
  
  const configContent = fs.readFileSync(configPath, 'utf8');
  return yaml.load(configContent) as TConfig;
} 