import { decodePath, resolveProjectPath } from '../../utils/pathUtils/index.js';

describe('pathUtils', () => {
  describe('decodePath', () => {
    it('should decode URL-encoded path components', () => {
      const encodedPath = 'C%3A/Users/test/project';
      const decodedPath = decodePath(encodedPath);
      expect(decodedPath).toBe('C:/Users/test/project');
    });

    it('should handle file:// URLs', () => {
      const fileUrl = 'file:///C:/Users/test/project';
      const decodedPath = decodePath(fileUrl);
      // On Unix systems, fileURLToPath might add leading slash
      expect(decodedPath).toMatch(/^(\/)?[A-Za-z]:[/\\]Users[/\\]test[/\\]project$/);
    });

    it('should handle regular paths without encoding', () => {
      const regularPath = '/Users/test/project';
      const decodedPath = decodePath(regularPath);
      expect(decodedPath).toBe('/Users/test/project');
    });

    it('should handle empty or undefined paths', () => {
      expect(decodePath('')).toBe('');
      expect(decodePath(undefined as any)).toBe(undefined);
    });

    it('should handle malformed file URLs gracefully', () => {
      const malformedUrl = 'file://C%3A/Users/test/project';
      const decodedPath = decodePath(malformedUrl);
      expect(decodedPath).toBe('C:/Users/test/project');
    });

    it('should handle Windows-style paths with backslashes', () => {
      const windowsPath = 'C%3A\\Users\\test\\project';
      const decodedPath = decodePath(windowsPath);
      expect(decodedPath).toBe('C:\\Users\\test\\project');
    });
  });

  describe('resolveProjectPath', () => {
    it('should resolve and decode paths', () => {
      const encodedPath = 'C%3A/Users/test/project';
      const resolvedPath = resolveProjectPath(encodedPath);
      // On Unix systems, Windows paths are treated as relative, so we check if decoding worked
      expect(resolvedPath).toContain('C:/Users/test/project');
    });

    it('should handle relative paths', () => {
      const relativePath = './test/project';
      const resolvedPath = resolveProjectPath(relativePath);
      expect(resolvedPath).toMatch(/test[/\\]project$/);
    });

    it('should handle file:// URLs', () => {
      const fileUrl = 'file:///C:/Users/test/project';
      const resolvedPath = resolveProjectPath(fileUrl);
      // On Unix systems, fileURLToPath might add leading slash
      expect(resolvedPath).toMatch(/^(\/)?[A-Za-z]:[/\\]Users[/\\]test[/\\]project$/);
    });
  });
}); 