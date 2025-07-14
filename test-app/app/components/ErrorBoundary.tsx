'use client';

import type { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  // Note: In a real app, you'd use a class component or error boundary library
  // This is a simplified version for demonstration
  return <div>{children}</div>;
}
