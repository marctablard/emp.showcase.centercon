'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {
  /**
   * The code content to display
   */
  children: React.ReactNode;
  /**
   * The language for syntax highlighting
   */
  language?: string;
  /**
   * Whether to show line numbers
   */
  showLineNumbers?: boolean;
  /**
   * Whether to enable copy button
   */
  enableCopy?: boolean;
  /**
   * Additional class name for the pre element
   */
  className?: string;
}

/**
 * Code component for displaying code snippets with syntax highlighting
 */
export function Code({
  children,
  language,
  showLineNumbers = false,
  enableCopy = true,
  className,
  ...props
}: CodeProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (typeof children !== 'string') return;

    navigator.clipboard
      .writeText(children)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error('Could not copy to clipboard:', err));
  };

  // Get text content for copying
  const getTextContent = (): string => {
    if (typeof children === 'string') {
      return children;
    }
    return '';
  };

  return (
    <div className="relative group">
      <pre
        className={cn(
          'p-4 rounded-md bg-slate-950 text-slate-50 overflow-x-auto font-mono text-sm',
          showLineNumbers && 'pl-12 relative',
          className,
        )}
        {...props}
      >
        {language && (
          <div className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">{language}</div>
        )}
        {showLineNumbers && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-slate-900 flex flex-col items-end pr-2 py-4 text-slate-500 select-none">
            {getTextContent()
              .split('\n')
              .map((_, i) => (
                <div key={i} className="text-xs">
                  {i + 1}
                </div>
              ))}
          </div>
        )}
        {children}
      </pre>
      {enableCopy && (
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-800 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

/**
 * Inline code component for displaying short code snippets inline with text
 */
export function InlineCode({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        'relative rounded bg-slate-100 px-[0.3rem] py-[0.2rem] font-mono text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-50',
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}
