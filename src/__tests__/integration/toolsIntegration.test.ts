import { jest } from '@jest/globals';
import { McpSession } from 'flowmcp';
import { createMockSession } from '../helpers/mockSession.js';

// Mock NODE_MODULES dependencies using jest.unstable_mockModule
jest.unstable_mockModule('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

jest.unstable_mockModule('path', () => ({
  join: jest.fn(),
  dirname: jest.fn(),
  resolve: jest.fn(),
}));

// Dynamic imports
const fs = await import('fs');
const path = await import('path');

// Using real config files
const mockFs = jest.mocked(fs);
const mockPath = jest.mocked(path);

describe('Tools Integration', () => {
  let session: McpSession;

  beforeEach(() => {
    session = createMockSession();
    jest.clearAllMocks();
  });

  it('should handle end-to-end workflow', async () => {
    // Setup mocks for file system operations
    mockPath.join.mockReturnValue('/test/path');
    mockFs.existsSync.mockReturnValue(true);
    (mockFs.readFileSync as jest.MockedFunction<any>).mockReturnValue('mock file content');

    // Import tools after mocks are setup
    const { getSessionProcesses } = await import('../../tools/getSessionProcesses/index.js');
    const { updateSession } = await import('../../tools/updateSession/index.js');

    // Test getSessionProcesses with real config
    const processesResult = await getSessionProcesses(session, { project: '/test' });
    expect(processesResult.processes).toBeDefined();
    expect(typeof processesResult.processes).toBe('object');

    // Test updateSession with real config
    const updateResult = await updateSession(session, { 
      project: '/test'
    });
    expect(updateResult.prompt).toBeDefined();
    expect(typeof updateResult.prompt).toBe('string');
  });

  it('should handle tool interaction', async () => {
    const { getSessionProcesses } = await import('../../tools/getSessionProcesses/index.js');
    const { clarifySession } = await import('../../tools/clarifySession/index.js');
    
    // Test getSessionProcesses
    const processesResult = await getSessionProcesses(session, { project: '/test' });
    expect(processesResult.processes).toBeDefined();

    // Test clarifySession
    const clarifyResult = await clarifySession(session, { 
      project: '/test',
      context: 'Need clarification on processes'
    });
    expect(clarifyResult.prompt).toBeDefined();
    expect(clarifyResult.processes).toBeDefined();
  });
}); 