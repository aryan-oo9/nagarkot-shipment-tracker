import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export interface CopyReferenceButtonProps {
  referenceNumber: string;
  className?: string;
}

export const CopyReferenceButton: React.FC<CopyReferenceButtonProps> = ({
  referenceNumber,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(referenceNumber);
      } else {
        // Fallback for non-secure / unsupported contexts
        const textarea = document.createElement('textarea');
        textarea.value = referenceNumber;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      setAnnouncement(`Reference number ${referenceNumber} copied to clipboard.`);

      setTimeout(() => {
        setCopied(false);
        setAnnouncement('');
      }, 2000);
    } catch {
      setAnnouncement('Failed to copy reference number.');
    }
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Screen-reader announcement container */}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>

      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy reference number ${referenceNumber}`}
        title="Copy reference number to clipboard"
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md
          transition-colors duration-150 cursor-pointer
          border border-border-input bg-surface text-ink-secondary hover:text-ink-primary hover:border-brand-600
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700
          ${copied ? 'bg-status-delivered-bg border-status-delivered-border text-status-delivered-text' : ''}
          ${className}
        `}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-status-delivered-text shrink-0" aria-hidden="true" />
            <span className="text-status-delivered-text font-semibold">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-current shrink-0" aria-hidden="true" />
            <span>Copy ref</span>
          </>
        )}
      </button>
    </div>
  );
};
