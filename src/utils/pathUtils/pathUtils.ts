import { fileURLToPath } from 'url';
import { resolve } from 'path';

/**
 * Decode URL-encoded path components, particularly for Windows compatibility
 * Handles cases where Windows paths like C:/ become C%3A/ 
 */
export function decodePath(path: string): string {
  if (!path) return path;
  
  // Handle file:// URLs
  if (path.startsWith('file://')) {
    try {
      return fileURLToPath(path);
    } catch (error) {
      // If fileURLToPath fails, try to extract path manually
      const urlPath = path.replace(/^file:\/\//, '');
      return decodeURIComponent(urlPath);
    }
  }
  
  // Handle URL-encoded components in regular paths
  try {
    return decodeURIComponent(path);
  } catch (error) {
    // If decoding fails, return original path
    return path;
  }
}

/**
 * Resolve and decode a project path, ensuring it's absolute and properly formatted
 */
export function resolveProjectPath(path: string): string {
  const decodedPath = decodePath(path);
  return resolve(decodedPath);
} 