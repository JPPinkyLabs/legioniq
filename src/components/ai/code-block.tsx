import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export type CodeBlockProps = {
  code: string;
  language: string;
  className?: string;
  children?: React.ReactNode;
};

export const CodeBlock = ({ code, language, className, children }: CodeBlockProps) => {
  return (
    <div className={cn('relative group', className)}>
      <div className="overflow-x-auto rounded-lg border border-border bg-muted/50">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
          <span className="text-xs font-mono text-muted-foreground">{language}</span>
          {children}
        </div>
        <pre className="p-4 overflow-x-auto">
          <code className="text-sm font-mono">{code}</code>
        </pre>
      </div>
    </div>
  );
};

export type CodeBlockCopyButtonProps = {
  code: string;
  onCopy?: () => void;
  onError?: () => void;
};

export const CodeBlockCopyButton = ({ code, onCopy, onError }: CodeBlockCopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      onError?.();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0"
      onClick={handleCopy}
      aria-label="Copy code"
    >
      {copied ? (
        <Check className="h-3 w-3" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );
};

