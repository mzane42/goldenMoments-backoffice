/**
 * MDXEditor Component
 * Rich text editor with WYSIWYG interface for non-technical users
 */

import * as React from 'react';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  ListsToggle,
  BlockTypeSelect,
  CreateLink,
  InsertThematicBreak,
  Separator,
  type MDXEditorMethods,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import './mdxeditor.css';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface MDXEditorComponentProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  error?: string;
  rows?: number;
}

export function MDXEditorComponent({
  value,
  onChange,
  label,
  placeholder = 'Commencez à écrire...',
  className,
  error,
  rows = 10,
}: MDXEditorComponentProps) {
  const editorRef = React.useRef<MDXEditorMethods>(null);
  
  // Calculate min height based on rows (approximate)
  const minHeight = `${rows * 24}px`;

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      
      <div 
        className={cn(
          'rounded-md border border-input bg-background overflow-hidden',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all',
          error && 'border-destructive focus-within:ring-destructive',
          'mdx-editor-wrapper'
        )}
        style={{ minHeight }}
      >
        <MDXEditor
          ref={editorRef}
          markdown={value}
          onChange={onChange}
          placeholder={placeholder}
          contentEditableClassName="prose prose-sm dark:prose-invert max-w-none px-4 py-3 focus:outline-none"
          plugins={[
            // Core editing features
            headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
            listsPlugin(),
            linkPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            
            // Toolbar with user-friendly controls
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <Separator />
                  <BoldItalicUnderlineToggles />
                  <Separator />
                  <BlockTypeSelect />
                  <Separator />
                  <ListsToggle />
                  <Separator />
                  <CreateLink />
                  <Separator />
                  <InsertThematicBreak />
                </>
              ),
            }),
          ]}
          className="mdx-editor-custom"
        />
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      <p className="text-xs text-muted-foreground">
        Utilisez la barre d'outils ci-dessus pour formater votre texte. Pas besoin de connaître le Markdown !
      </p>
    </div>
  );
}

