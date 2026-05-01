'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { registerRichText } from '@lexical/rich-text';
import { useEffect } from 'react';

/**
 * Registers @lexical/rich-text handlers (bold, italic, underline, etc.) with the editor.
 */
export function RichTextBehaviorPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return registerRichText(editor);
  }, [editor]);
  return null;
}
