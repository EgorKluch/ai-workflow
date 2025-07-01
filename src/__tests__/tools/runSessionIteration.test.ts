import { jest } from '@jest/globals';
import { McpSession } from 'flowmcp';
import { createMockSession } from '../helpers/mockSession.js';
import { RunSessionIterationErrorCode } from '../../tools/runSessionIteration/runSessionIteration.types.js';
import { runSessionIteration } from '../../tools/runSessionIteration/index.js';

describe('runSessionIteration', () => {
  let session: McpSession;

  beforeEach(() => {
    session = createMockSession();
    jest.clearAllMocks();
  });

  describe('successful iteration execution', () => {
    it('should execute single process successfully', async () => {
      const args = {
        project: '/test/project',
        processes: ['problemAnalysis']
      };

      const result = await runSessionIteration(session, args);

      expect(result.prompt).toContain('Execute the following processes in sequence:');
      expect(result.prompt).toContain('=== PROCESS: problemAnalysis ===');
      expect(result.prompt).toContain('Purpose:');
      expect(result.prompt).toContain('You are responsible');
      expect(result.prompt).toContain('=== END PROCESS: problemAnalysis ===');
      expect(result.prompt).toContain('MANDATORY COMPLETION SEQUENCE:');
      expect(result.prompt).toContain('Call updateSession()');
      expect(result.prompt).toContain('call planSessionIteration()');

      expect(result.processes).toHaveProperty('problemAnalysis');
      expect(result.processes.problemAnalysis).toHaveProperty('purpose');
      expect(result.processes.problemAnalysis).toHaveProperty('prompt');
    });

    it('should execute multiple processes in sequence', async () => {
      const args = {
        project: '/test/project',
        processes: ['problemAnalysis', 'technicalDiscovery', 'codeImplementation']
      };

      const result = await runSessionIteration(session, args);

      expect(result.prompt).toContain('=== PROCESS: problemAnalysis ===');
      expect(result.prompt).toContain('=== END PROCESS: problemAnalysis ===');
      expect(result.prompt).toContain('=== PROCESS: technicalDiscovery ===');
      expect(result.prompt).toContain('=== END PROCESS: technicalDiscovery ===');
      expect(result.prompt).toContain('=== PROCESS: codeImplementation ===');
      expect(result.prompt).toContain('=== END PROCESS: codeImplementation ===');

      expect(Object.keys(result.processes)).toHaveLength(3);
      expect(result.processes.problemAnalysis).toBeDefined();
      expect(result.processes.technicalDiscovery).toBeDefined();
      expect(result.processes.codeImplementation).toBeDefined();
    });

    it('should include context guidance when context provided', async () => {
      const args = {
        project: '/test/project',
        processes: ['problemAnalysis'],
        context: 'Focus on user authentication issues'
      };

      const result = await runSessionIteration(session, args);

      expect(result.prompt).toContain('CONTEXT GUIDANCE:');
      expect(result.prompt).toContain('Focus on user authentication issues');
      expect(result.prompt).toContain('Apply this context to refine your process execution');
      expect(result.context).toBe('Focus on user authentication issues');
    });

    it('should not include context guidance when context not provided', async () => {
      const args = {
        project: '/test/project',
        processes: ['problemAnalysis']
      };

      const result = await runSessionIteration(session, args);

      expect(result.prompt).not.toContain('CONTEXT GUIDANCE:');
      expect(result.context).toBeUndefined();
    });

    it('should maintain process order in prompt', async () => {
      const args = {
        project: '/test/project',
        processes: ['codeImplementation', 'problemAnalysis', 'technicalDiscovery']
      };

      const result = await runSessionIteration(session, args);

      const codeImplIndex = result.prompt.indexOf('=== PROCESS: codeImplementation ===');
      const problemAnalysisIndex = result.prompt.indexOf('=== PROCESS: problemAnalysis ===');
      const techDiscoveryIndex = result.prompt.indexOf('=== PROCESS: technicalDiscovery ===');

      expect(codeImplIndex).toBeLessThan(problemAnalysisIndex);
      expect(problemAnalysisIndex).toBeLessThan(techDiscoveryIndex);
    });
  });

  describe('validation errors', () => {
    it('should return error when project parameter is missing', async () => {
      const args = {
        project: '',
        processes: ['problemAnalysis']
      };

      const result = await runSessionIteration(session, args);

      expect(result).toEqual({ prompt: '', processes: {} });
      expect(session.logger.addError).toHaveBeenCalledWith({
        code: RunSessionIterationErrorCode.INVALID_REQUEST,
        message: 'Project parameter is required',
        context: { arguments: args }
      });
    });

    it('should return error when processes parameter is missing', async () => {
      const args = {
        project: '/test/project',
        processes: undefined as any
      };

      const result = await runSessionIteration(session, args);

      expect(result).toEqual({ prompt: '', processes: {} });
      expect(session.logger.addError).toHaveBeenCalledWith({
        code: RunSessionIterationErrorCode.INVALID_REQUEST,
        message: 'Processes parameter is required and must be a non-empty array',
        context: { arguments: args }
      });
    });

    it('should return error when processes is not an array', async () => {
      const args = {
        project: '/test/project',
        processes: 'problemAnalysis' as any
      };

      const result = await runSessionIteration(session, args);

      expect(result).toEqual({ prompt: '', processes: {} });
      expect(session.logger.addError).toHaveBeenCalledWith({
        code: RunSessionIterationErrorCode.INVALID_REQUEST,
        message: 'Processes parameter is required and must be a non-empty array',
        context: { arguments: args }
      });
    });

    it('should return error when processes array is empty', async () => {
      const args = {
        project: '/test/project',
        processes: []
      };

      const result = await runSessionIteration(session, args);

      expect(result).toEqual({ prompt: '', processes: {} });
      expect(session.logger.addError).toHaveBeenCalledWith({
        code: RunSessionIterationErrorCode.INVALID_REQUEST,
        message: 'Processes parameter is required and must be a non-empty array',
        context: { arguments: args }
      });
    });
  });

  describe('error handling', () => {
    it('should handle empty processes array', async () => {
      const args = {
        project: '/test/project',
        processes: []
      };

      const result = await runSessionIteration(session, args);

      expect(session.logger.addError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'INVALID_REQUEST',
          message: 'Processes parameter is required and must be a non-empty array'
        })
      );
    });
  });
}); 