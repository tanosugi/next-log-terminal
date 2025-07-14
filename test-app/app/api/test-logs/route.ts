import { NextResponse } from 'next/server';

// Simple in-memory log store for testing
let logs: any[] = [];
let isCapturing = false;

export async function GET() {
  return NextResponse.json({
    logs,
    isCapturing,
    count: logs.length,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, logData } = body;

  switch (action) {
    case 'start':
      isCapturing = true;
      logs = []; // Clear previous logs
      return NextResponse.json({
        success: true,
        message: 'Log capture started',
      });

    case 'stop':
      isCapturing = false;
      return NextResponse.json({
        success: true,
        message: 'Log capture stopped',
        capturedLogs: [...logs],
      });

    case 'add':
      if (isCapturing && logData) {
        logs.push({
          timestamp: new Date().toISOString(),
          ...logData,
        });
      }
      return NextResponse.json({ success: true });

    case 'clear':
      logs = [];
      return NextResponse.json({ success: true, message: 'Logs cleared' });

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}
