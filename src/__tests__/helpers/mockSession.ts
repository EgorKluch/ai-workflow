import { jest } from '@jest/globals';
import { McpSession, Logger } from 'flowmcp';

export function createMockSession(): McpSession {
  const mockLogger = new Logger();
  const session = new McpSession();
  
  // Mock the addError method to make it trackable by Jest
  mockLogger.addError = jest.fn();
  mockLogger.addWarning = jest.fn();
  
  // Ensure logger is properly initialized
  (session as any).logger = mockLogger;
  
  return session;
}

export function createMockLogger(): Logger {
  const logger = new Logger();
  logger.addError = jest.fn();
  logger.addWarning = jest.fn();
  return logger;
}

export interface MockCallToolRequest {
  params: {
    arguments: Record<string, any>;
  };
}

export function createMockRequest(args: Record<string, any>): MockCallToolRequest {
  return {
    params: {
      arguments: args
    }
  };
} 