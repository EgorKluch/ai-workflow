import { jest } from '@jest/globals';
import { McpSession } from 'flowmcp';
import { createMockSession } from '../helpers/mockSession.js';
import { UpdateSessionErrorCode } from '../../tools/updateSession/updateSession.types.js';
import { updateSession } from '../../tools/updateSession/index.js';

describe('updateSession', () => {
  let session: McpSession;

  beforeEach(() => {
    session = createMockSession();
    jest.clearAllMocks();
  });

  describe('successful update session', () => {
    it('should return update session prompt', async () => {
      const args = {
        project: '/test/project'
      };

      const result = await updateSession(session, args);

      expect(result.prompt).toBeDefined();
      expect(typeof result.prompt).toBe('string');
      expect(result.prompt.length).toBeGreaterThan(0);
      expect(result.prompt).toContain('session');
    });
  });

  describe('validation errors', () => {
    it('should return error when project parameter is missing', async () => {
      const args = {
        project: ''
      };

      const result = await updateSession(session, args);

      expect(result).toEqual({ prompt: '' });
      expect(session.logger.addError).toHaveBeenCalledWith({
        code: UpdateSessionErrorCode.INVALID_REQUEST,
        message: 'Project parameter is required',
        context: { arguments: args }
      });
    });
  });


}); 