import { jest } from '@jest/globals';

// Mock fs and yaml modules using ESM approach
jest.unstable_mockModule('fs', () => ({
  readFileSync: jest.fn(),
}));

jest.unstable_mockModule('js-yaml', () => ({
  load: jest.fn(),
}));

// Dynamic imports after mocks
const { getConfig, getCoreConfig } = await import('../../utils/getConfig/index.js');
const fs = await import('fs');
const yaml = await import('js-yaml');

const mockFs = jest.mocked(fs);
const mockYaml = jest.mocked(yaml);

describe('getConfig utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConfig', () => {
    it('should successfully load and parse config.yaml', () => {
      const mockConfigContent = 'config:\n  processes:\n    test: value';
      const mockParsedConfig = { config: { processes: { test: 'value' } } };

      mockFs.readFileSync.mockReturnValue(mockConfigContent);
      mockYaml.load.mockReturnValue(mockParsedConfig);

      const result = getConfig();

      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('config.yaml'),
        'utf8'
      );
      expect(mockYaml.load).toHaveBeenCalledWith(mockConfigContent);
      expect(result).toEqual(mockParsedConfig);
    });

    it('should throw error when config file is not found', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      expect(() => getConfig()).toThrow('ENOENT: no such file or directory');
    });

    it('should throw error when yaml parsing fails', () => {
      const mockConfigContent = 'invalid: yaml: content:';
      
      mockFs.readFileSync.mockReturnValue(mockConfigContent);
      mockYaml.load.mockImplementation(() => {
        throw new Error('Invalid YAML syntax');
      });

      expect(() => getConfig()).toThrow('Invalid YAML syntax');
    });

    it('should return typed config when type parameter provided', () => {
      interface TestConfig {
        config: {
          processes: Record<string, { purpose: string }>;
        };
      }

      const mockConfigContent = 'config:\n  processes:\n    test:\n      purpose: "test purpose"';
      const mockParsedConfig: TestConfig = {
        config: {
          processes: {
            test: { purpose: 'test purpose' }
          }
        }
      };

      mockFs.readFileSync.mockReturnValue(mockConfigContent);
      mockYaml.load.mockReturnValue(mockParsedConfig);

      const result = getConfig<TestConfig>();

      expect(result).toEqual(mockParsedConfig);
      expect(result.config.processes.test.purpose).toBe('test purpose');
    });
  });

  describe('getCoreConfig', () => {
    it('should successfully load and parse core.yaml', () => {
      const mockCoreContent = 'core:\n  processes:\n    updateSession:\n      prompt: "test prompt"';
      const mockParsedCore = {
        core: {
          processes: {
            updateSession: { prompt: 'test prompt' }
          }
        }
      };

      mockFs.readFileSync.mockReturnValue(mockCoreContent);
      mockYaml.load.mockReturnValue(mockParsedCore);

      const result = getCoreConfig();

      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('core.yaml'),
        'utf8'
      );
      expect(mockYaml.load).toHaveBeenCalledWith(mockCoreContent);
      expect(result).toEqual(mockParsedCore);
    });

    it('should throw error when core config file is not found', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      expect(() => getCoreConfig()).toThrow('ENOENT: no such file or directory');
    });

    it('should return typed core config when type parameter provided', () => {
      interface TestCoreConfig {
        core: {
          processes: {
            updateSession: { prompt: string };
          };
        };
      }

      const mockCoreContent = 'core:\n  processes:\n    updateSession:\n      prompt: "test prompt"';
      const mockParsedCore: TestCoreConfig = {
        core: {
          processes: {
            updateSession: { prompt: 'test prompt' }
          }
        }
      };

      mockFs.readFileSync.mockReturnValue(mockCoreContent);
      mockYaml.load.mockReturnValue(mockParsedCore);

      const result = getCoreConfig<TestCoreConfig>();

      expect(result).toEqual(mockParsedCore);
      expect(result.core.processes.updateSession.prompt).toBe('test prompt');
    });
  });

  describe('file path resolution', () => {
    it('should resolve config.yaml path correctly', () => {
      const mockConfigContent = 'test: content';
      mockFs.readFileSync.mockReturnValue(mockConfigContent);
      mockYaml.load.mockReturnValue({ test: 'content' });

      getConfig();

      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        expect.stringMatching(/.*config\.yaml$/),
        'utf8'
      );
    });

    it('should resolve core.yaml path correctly', () => {
      const mockCoreContent = 'test: content';
      mockFs.readFileSync.mockReturnValue(mockCoreContent);
      mockYaml.load.mockReturnValue({ test: 'content' });

      getCoreConfig();

      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        expect.stringMatching(/.*core\.yaml$/),
        'utf8'
      );
    });
  });
}); 