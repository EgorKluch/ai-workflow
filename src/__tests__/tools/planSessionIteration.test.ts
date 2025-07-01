import { jest } from '@jest/globals';
import { McpSession } from 'flowmcp';
import { createMockSession } from '../helpers/mockSession.js';
import { planSessionIteration } from '../../tools/planSessionIteration/index.js';

describe('planSessionIteration', () => {
  let session: McpSession;

  beforeEach(() => {
    session = createMockSession();
    jest.clearAllMocks();
  });

  describe('successful planning', () => {
    it('should return planning prompt', async () => {
      const args = {
        project: '/test/project'
      };

      const result = await planSessionIteration(session, args);

      expect(result.prompt).toBeDefined();
      expect(typeof result.prompt).toBe('string');
      expect(result.prompt.length).toBeGreaterThan(0);
    });

    it('should include available processes in planning context', async () => {
      const args = {
        project: '/test/project'
      };

      const result = await planSessionIteration(session, args);

      // Should contain some planning-related content
      expect(result.prompt).toContain('process');
      expect(result.processes).toBeDefined();
      expect(typeof result.processes).toBe('object');
    });
  });

  describe('validation', () => {
    it('should handle valid project parameter', async () => {
      const args = {
        project: '/valid/project/path'
      };

      const result = await planSessionIteration(session, args);

      expect(result.prompt).toBeDefined();
      expect(result.processes).toBeDefined();
    });
  });


}); 