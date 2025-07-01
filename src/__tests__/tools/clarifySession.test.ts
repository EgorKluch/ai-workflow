import { jest } from '@jest/globals';
import { McpSession } from 'flowmcp';
import { createMockSession } from '../helpers/mockSession.js';
import { ClarifySessionErrorCode } from '../../tools/clarifySession/clarifySession.types.js';
import { clarifySession } from '../../tools/clarifySession/index.js';

describe('clarifySession', () => {
  let session: McpSession;

  beforeEach(() => {
    session = createMockSession();
    jest.clearAllMocks();
  });

  describe('successful clarification', () => {
    it('should return clarification prompt with available processes', async () => {
      const args = {
        project: '/test/project',
        context: 'Unclear requirements about user authentication flow'
      };

      const result = await clarifySession(session, args);

      expect(result.prompt).toContain('You are responsible for resolving');
      expect(result.prompt).toContain('PROBLEM CONTEXT PROVIDED: Unclear requirements about user authentication flow');
      expect(result.prompt).toContain('AVAILABLE PROCESSES FOR SELECTION:');
      expect(result.prompt).toContain('- problemAnalysis:');
      expect(result.prompt).toContain('- technicalDiscovery:');
      expect(result.prompt).toContain('- requirementsClarification:');
      expect(result.prompt).toContain('RESOLUTION ALGORITHM:');
      expect(result.prompt).toContain('1. Analyze the provided problem context');
      expect(result.prompt).toContain('2. Select appropriate processes');
      expect(result.prompt).toContain('3. Validate that selected processes make logical sense');
      expect(result.prompt).toContain('4. Call runSessionIteration with selected processes');
      expect(result.prompt).toContain('5. If after iteration completion the problem is not resolved');

      expect(result.context).toBe('Unclear requirements about user authentication flow');
      expect(result.processes).toHaveProperty('problemAnalysis');
      expect(result.processes).toHaveProperty('technicalDiscovery');
      expect(result.processes).toHaveProperty('requirementsClarification');
    });

    it('should handle context with special characters', async () => {
      const specialContext = 'Context with\nnewlines\tand\ttabs and "quotes" and \'apostrophes\' and 🚀 unicode';
      const args = {
        project: '/test/project',
        context: specialContext
      };

      const result = await clarifySession(session, args);

      expect(result.prompt).toContain(`PROBLEM CONTEXT PROVIDED: ${specialContext}`);
      expect(result.context).toBe(specialContext);
    });

    it('should work with very long context', async () => {
      const longContext = 'A'.repeat(5000);
      const args = {
        project: '/test/project',
        context: longContext
      };

      const result = await clarifySession(session, args);

      expect(result.prompt).toContain(`PROBLEM CONTEXT PROVIDED: ${longContext}`);
      expect(result.context).toBe(longContext);
    });

    it('should include all available processes in prompt', async () => {
      const args = {
        project: '/test/project',
        context: 'Need help with process selection'
      };

      const result = await clarifySession(session, args);

      // Check that processes from real config are mentioned
      expect(Object.keys(result.processes).length).toBeGreaterThan(0);
      Object.keys(result.processes).forEach(processName => {
        expect(result.prompt).toContain(`- ${processName}:`);
      });
    });
  });

  describe('validation errors', () => {
    it('should return error when project parameter is missing', async () => {
      const args = {
        project: '',
        context: 'Some context'
      };

      const result = await clarifySession(session, args);

      expect(result).toEqual({ prompt: '', processes: {}, context: '' });
      expect(session.logger.addError).toHaveBeenCalledWith({
        code: ClarifySessionErrorCode.INVALID_REQUEST,
        message: 'Project parameter is required',
        context: { arguments: args }
      });
    });

    it('should return error when project parameter is null', async () => {
      const args = {
        project: null as any,
        context: 'Some context'
      };

      const result = await clarifySession(session, args);

      expect(result).toEqual({ prompt: '', processes: {}, context: '' });
      expect(session.logger.addError).toHaveBeenCalledWith({
        code: ClarifySessionErrorCode.INVALID_REQUEST,
        message: 'Project parameter is required',
        context: { arguments: args }
      });
    });

    it('should return error when context parameter is missing', async () => {
      const args = {
        project: '/test/project',
        context: ''
      };

      const result = await clarifySession(session, args);

      expect(result).toEqual({ prompt: '', processes: {}, context: '' });
      expect(session.logger.addError).toHaveBeenCalledWith({
        code: ClarifySessionErrorCode.INVALID_REQUEST,
        message: 'Context parameter is required - describe the problem that requires clarification',
        context: { arguments: args }
      });
    });

    it('should return error when context parameter is null', async () => {
      const args = {
        project: '/test/project',
        context: null as any
      };

      const result = await clarifySession(session, args);

      expect(result).toEqual({ prompt: '', processes: {}, context: '' });
      expect(session.logger.addError).toHaveBeenCalledWith({
        code: ClarifySessionErrorCode.INVALID_REQUEST,
        message: 'Context parameter is required - describe the problem that requires clarification',
        context: { arguments: args }
      });
    });

    it('should return error when context parameter is undefined', async () => {
      const args = {
        project: '/test/project',
        context: undefined as any
      };

      const result = await clarifySession(session, args);

      expect(result).toEqual({ prompt: '', processes: {}, context: '' });
      expect(session.logger.addError).toHaveBeenCalledWith({
        code: ClarifySessionErrorCode.INVALID_REQUEST,
        message: 'Context parameter is required - describe the problem that requires clarification',
        context: { arguments: args }
      });
    });
  });

  describe('response structure', () => {
    it('should return correct response structure', async () => {
      const args = {
        project: '/test/project',
        context: 'Test context'
      };

      const result = await clarifySession(session, args);

      expect(result).toHaveProperty('prompt');
      expect(result).toHaveProperty('processes');
      expect(result).toHaveProperty('context');
      
      expect(typeof result.prompt).toBe('string');
      expect(typeof result.processes).toBe('object');
      expect(typeof result.context).toBe('string');
      
      expect(result.context).toBe('Test context');
      expect(Object.keys(result.processes).length).toBeGreaterThan(0);
    });

    it('should return processes as name-purpose mapping', async () => {
      const args = {
        project: '/test/project',
        context: 'Test context'
      };

      const result = await clarifySession(session, args);

      // Verify we have processes and they have string values (purposes)
      expect(result.processes).toHaveProperty('problemAnalysis');
      expect(typeof result.processes.problemAnalysis).toBe('string');
      expect(result.processes.problemAnalysis.length).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle empty context', async () => {
      const args = {
        project: '/test/project',
        context: ''
      };

      const result = await clarifySession(session, args);

      expect(session.logger.addError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'INVALID_REQUEST',
          message: 'Context parameter is required - describe the problem that requires clarification'
        })
      );
    });
  });
}); 