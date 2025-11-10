/**
 * Markdown Editor Component
 * Simple markdown editor with preview
 */

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  error?: string;
  rows?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  label,
  placeholder = 'Écrivez en Markdown...',
  className,
  error,
  rows = 10,
}: MarkdownEditorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Éditer</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-2">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={cn(
              'font-mono text-sm',
              error && 'border-destructive'
            )}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="mt-2">
          <div className={cn(
            'min-h-[200px] rounded-md border border-input bg-background px-3 py-2',
            'prose prose-sm dark:prose-invert max-w-none'
          )}>
            {value ? (
              <div 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: convertMarkdownToHTML(value) 
                }} 
              />
            ) : (
              <p className="text-muted-foreground italic">
                Aucun contenu à prévisualiser
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      <p className="text-xs text-muted-foreground">
        Supporte le Markdown: **gras**, *italique*, # Titre, - Liste, etc.
      </p>
    </div>
  );
}

// Simple markdown to HTML converter
function convertMarkdownToHTML(markdown: string): string {
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  return html;
}

