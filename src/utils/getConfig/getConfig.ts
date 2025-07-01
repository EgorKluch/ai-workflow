import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getConfig<TConfig = unknown>(): TConfig {
  const configPath = path.join(__dirname, '../../../config/config.yaml');
  const configContent = fs.readFileSync(configPath, 'utf8');
  return yaml.load(configContent) as TConfig;
}

export function getCoreConfig<TConfig = unknown>(): TConfig {
  const configPath = path.join(__dirname, '../../../config/core.yaml');
  const configContent = fs.readFileSync(configPath, 'utf8');
  return yaml.load(configContent) as TConfig;
} 