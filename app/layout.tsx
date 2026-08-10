import React, { type ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Readiness Diagnostic | Tai Labs',
  description:
    'Turn AI uncertainty into a clear, team-by-team diagnostic score and targeted upskilling roadmap for your organization.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-ink flex flex-col font-sans antialiased">
        <header className="border-b border-borderCustom bg-bg py-4 px-6 sm:px-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 text-ink hover:opacity-90 transition-opacity">
              <div className="w-5 h-5 bg-accent rounded-sm flex items-center justify-center text-white font-mono text-[10px] font-bold">
                T
              </div>
              <span className="font-mono text-xs font-semibold tracking-wider uppercase text-ink">
                Tai Labs <span className="text-ink-muted font-normal">| Diagnostic Instrument</span>
              </span>
            </a>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-10">
          {children}
        </main>

        <footer className="border-t border-borderCustom py-6 px-6 sm:px-10 bg-bg text-xs text-ink-muted">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 font-mono">
            <span>© {new Date().getFullYear()} Tai Labs Inc. Clinical AI Readiness Diagnostic</span>
            <span>Clinical confidence, clear action</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
