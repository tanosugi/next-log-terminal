export { UnifiedLogger } from './logger';
export { getLoggerConfig } from './config';
export type { LoggerConfig, LogMetadata, LogLevel } from './types';

import { UnifiedLogger } from './logger';
export const logger = new UnifiedLogger();
