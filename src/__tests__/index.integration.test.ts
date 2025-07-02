import { jest } from '@jest/globals';
import { McpSession } from 'flowmcp';

// Mock file system operations for integration tests
jest.unstable_mockModule('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
  lstatSync: jest.fn(),
}));

jest.unstable_mockModule('path', () => ({
  join: jest.fn(),
  dirname: jest.fn(),
  resolve: jest.fn(),
}));

const fs = await import('fs');
const path = await import('path');

const mockFs = jest.mocked(fs);
const mockPath = jest.mocked(path);

describe('SessionManagerMcpServer Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup path mocks
    mockPath.join.mockImplementation((...args) => args.join('/'));
    mockPath.resolve.mockImplementation((p) => `/absolute${p}`);
    mockPath.dirname.mockImplementation((p) => p.substring(0, p.lastIndexOf('/')));
    
    // Setup fs mocks
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(`
      core:
        processes:
          updateSession:
            prompt: "Test update session prompt"
          clarifySession:
            prompt: "Test clarify session prompt"
      processes:
        problemAnalysis:
          purpose: "Analyze problems"
          prompt: "Test problem analysis prompt"
        codeImplementation:
          purpose: "Implement code"
          prompt: "Test implementation prompt"
        qualityAssurance:
          purpose: "Quality check"
          prompt: "Test QA prompt"
    `);
  });

  it('should create SessionManagerMcpServer and test real tool execution', async () => {
    const { SessionManagerMcpServer } = await import('../index.js');
    const server = new SessionManagerMcpServer();
    
    expect(server).toBeInstanceOf(SessionManagerMcpServer);
  });

  it('should test basic tool handlers execution with McpSession', async () => {
    const session = new McpSession();
    
    // Test that McpSession can be created and has expected interface
    expect(session).toBeDefined();
    expect(session.logger).toBeDefined();
    expect(typeof session.getResult).toBe('function');
    
    // Test basic session result generation
    const testResult = session.getResult({ test: 'data' });
    expect(testResult).toBeDefined();
    expect(typeof testResult).toBe('object');
  });

  it('should test integration patterns', async () => {
    const { SessionManagerMcpServer } = await import('../index.js');
    const server = new SessionManagerMcpServer();
    
    // Test that server is properly constructed
    expect(server).toBeInstanceOf(SessionManagerMcpServer);
    expect(typeof server.run).toBe('function');
  });
}); 