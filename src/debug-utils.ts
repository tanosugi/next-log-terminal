// Debug utilities for development and testing

interface CapturedLog {
  timestamp: string;
  level: string;
  message: string;
  args: any[];
  metadata?: any;
}

// In-memory storage for captured logs during testing
const capturedLogs: CapturedLog[] = [];

// Flag to track if capture is enabled
let isCapturing = false;

export function enableCapture() {
  isCapturing = true;
  capturedLogs.length = 0; // Clear previous logs
}

export function disableCapture() {
  isCapturing = false;
}

export function getCapturedLogs() {
  return { logs: capturedLogs, isCapturing };
}

export function clearCapturedLogs() {
  capturedLogs.length = 0;
}

export function captureLog(
  level: string,
  message: string,
  args: any[],
  metadata?: any,
) {
  if (isCapturing) {
    capturedLogs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      args,
      metadata,
    });
  }
}
