'use client';

import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';

const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'br',
    'hr',
    'strong',
    'em',
    'b',
    'i',
    'u',
    's',
    'mark',
    'small',
    'sub',
    'sup',
    'ul',
    'ol',
    'li',
    'a',
    'code',
    'pre',
    'blockquote',
    'div',
    'span',
  ],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'],
};

interface SanitizedHtmlProps {
  html: string;
  className?: string;
}

/**
 * Renders ticket message HTML after sanitizing it. Message bodies originate
 * from the support/AI side and may contain rich formatting, so they must always
 * be sanitized before being injected into the DOM.
 */
export function SanitizedHtml({ html, className }: SanitizedHtmlProps) {
  const sanitized = useMemo(() => {
    try {
      return DOMPurify.sanitize(html, DOMPURIFY_CONFIG);
    } catch {
      return '';
    }
  }, [html]);

  return (
    <div
      className={cn('prose prose-sm max-w-none text-text-body [&_a]:text-text-action [&_a]:underline', className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

export default SanitizedHtml;
