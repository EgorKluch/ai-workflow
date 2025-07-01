import { jest } from '@jest/globals';
import { McpSession } from 'flowmcp';
import { createMockSession } from '../helpers/mockSession.js';
import { GetSessionProcessesErrorCode } from '../../tools/getSessionProcesses/getSessionProcesses.types.js';
import { getSessionProcesses } from '../../tools/getSessionProcesses/index.js';

describe('getSessionProcesses', () => {
  let session: McpSession;

  beforeEach(() => {
    session = createMockSession();
    jest.clearAllMocks();
  });

  describe('successful processes retrieval', () => {
    it('should return available processes with purposes', async () => {
      const args = {
        project: '/test/project'
      };

      const result = await getSessionProcesses(session, args);

      expect(result.processes).toBeDefined();
      expect(typeof result.processes).toBe('object');
      expect(Object.keys(result.processes).length).toBeGreaterThan(0);
      
      // Check that we have the expected processes from real config
      expect(result.processes).toHaveProperty('problemAnalysis');
      expect(result.processes).toHaveProperty('technicalDiscovery');
      expect(result.processes).toHaveProperty('requirementsClarification');
      
      // Verify values are strings (purposes)
      Object.values(result.processes).forEach(purpose => {
        expect(typeof purpose).toBe('string');
        expect(purpose.length).toBeGreaterThan(0);
      });
    });

    it('should return consistent process mapping', async () => {
      const args = {
        project: '/test/project'
      };

      const result = await getSessionProcesses(session, args);

      // Each process should map to its purpose
      Object.entries(result.processes).forEach(([name, purpose]) => {
        expect(typeof name).toBe('string');
        expect(typeof purpose).toBe('string');
        expect(name.length).toBeGreaterThan(0);
        expect(purpose.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validation errors', () => {
    it('should return error when project parameter is missing', async () => {
      const args = {
        project: ''
      };

      const result = await getSessionProcesses(session, args);

      expect(result).toEqual({ processes: {} });
      expect(session.logger.addError).toHaveBeenCalledWith({
        code: GetSessionProcessesErrorCode.INVALID_REQUEST,
        message: 'Project parameter is required',
        context: { arguments: args }
      });
    });

    it('should return error when project parameter is null', async () => {
      const args = {
        project: null as any
      };

      const result = await getSessionProcesses(session, args);

      expect(result).toEqual({ processes: {} });
      expect(session.logger.addError).toHaveBeenCalledWith({
        code: GetSessionProcessesErrorCode.INVALID_REQUEST,
        message: 'Project parameter is required',
        context: { arguments: args }
      });
    });
  });


}); 