import { jest } from '@jest/globals';
import { McpSession } from 'flowmcp';
import { createMockSession } from '../helpers/mockSession.js';

// Mock NODE_MODULES dependencies using jest.unstable_mockModule
jest.unstable_mockModule('fs', () => ({
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

jest.unstable_mockModule('path', () => ({
  dirname: jest.fn(),
  join: jest.fn(),
  resolve: jest.fn(),
}));

// Dynamic imports after mocks
const fs = await import('fs');
const path = await import('path');
const { createSession } = await import('../../tools/createSession/index.js');

const mockFs = jest.mocked(fs);
const mockPath = jest.mocked(path);

describe('createSession', () => {
  let session: McpSession;

  beforeEach(() => {
    session = createMockSession();
    jest.clearAllMocks();
  });

  it('should create session successfully', async () => {
    mockPath.dirname.mockReturnValue('/test');
    mockPath.join.mockReturnValue('/test/session.laml');
    mockFs.existsSync.mockReturnValue(false);

    const args = {
      project: '/test',
      sessionPath: '/test/session.laml'
    };

    const result = await createSession(session, args);

    expect(result.prompt).toBeDefined();
    expect(typeof result.prompt).toBe('string');
    expect(result.processes).toBeDefined();
    expect(typeof result.processes).toBe('object');
    expect(mockFs.writeFileSync).toHaveBeenCalled();
  });

  it('should handle file system error', async () => {
    mockPath.dirname.mockReturnValue('/test');
    mockPath.join.mockReturnValue('/test/session.laml');
    mockFs.existsSync.mockReturnValue(false);
    mockFs.writeFileSync.mockImplementation(() => {
      throw new Error('Permission denied');
    });

    const args = {
      project: '/test',
      sessionPath: '/test/session.laml'
    };

    const result = await createSession(session, args);

    expect(result).toEqual({ prompt: '', processes: {} });
    expect(session.logger.addError).toHaveBeenCalled();
  });

  it('should handle missing project parameter', async () => {
    const args = {
      project: '',
      sessionPath: '/test/session.laml'
    };

    const result = await createSession(session, args);

    expect(result).toEqual({ prompt: '', processes: {} });
    expect(session.logger.addError).toHaveBeenCalledWith({
      code: 'INVALID_REQUEST',
      message: 'Project parameter is required',
      context: expect.any(Object)
    });
  });

  it('should handle missing sessionPath parameter', async () => {
    const args = {
      project: '/test',
      sessionPath: ''
    };

    const result = await createSession(session, args);

    expect(result).toEqual({ prompt: '', processes: {} });
    expect(session.logger.addError).toHaveBeenCalled();
  });

  describe('error handling', () => {
    it('should handle validation for sessionPath format', async () => {
      const args1 = {
        project: '/test/project',
        sessionPath: 'test.txt'
      };

      const result1 = await createSession(session, args1);
      expect(session.logger.addError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'INVALID_REQUEST',
          message: 'sessionPath must end with .laml extension'
        })
      );

      jest.clearAllMocks();
      session = createMockSession();

      const args2 = {
        project: '/test/project',
        sessionPath: ''
      };

      const result2 = await createSession(session, args2);
      expect(session.logger.addError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'INVALID_REQUEST',
          message: 'sessionPath parameter is required'
        })
      );
    });
  });
}); 