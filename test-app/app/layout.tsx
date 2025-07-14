import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'next-log-terminal Demo',
  description:
    'Demo app for next-log-terminal - See all your Next.js logs in the terminal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
