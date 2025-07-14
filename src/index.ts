export { getLoggerConfig } from './config';
export {
  captureLog,
  clearCapturedLogs,
  disableCapture,
  enableCapture,
  getCapturedLogs,
} from './debug-utils';
export { UnifiedLogger } from './logger';
export type { LoggerConfig, LogLevel, LogMetadata } from './types';

import { UnifiedLogger } from './logger';
export const logger = new UnifiedLogger();
