'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin';
import { LinkNode } from '@lexical/link';
import { OverflowNode } from '@lexical/overflow';
import { $getRoot } from 'lexical';
import { newMessageAreaTheme } from './theme';
import { YouTubeEmbedNode } from './youtube-node';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { SendHorizontalIcon } from 'lucide-react';
import { Button } from '@/shared/ui/atoms/button';
import { cn } from '@/shared/utils/cn';
import { ToolbarPlugin } from './toolbar';
import { RichTextBehaviorPlugin } from './rich-text-plugin';

export type MessageEditorSubmitPayload = {
  /** Plain text for validation/fallback */
  text: string;
  /** Full Lexical editor state to persist (links, YouTube, formatting) */
  lexicalState: Record<string, unknown>;
};

export type MessageEditorProps = {
  onSubmit: (payload: MessageEditorSubmitPayload) => void | Promise<void>;
  placeholder?: string;
  maxCharacters?: number;
  className?: string;
  disabled?: boolean;
};

const DEFAULT_MAX_CHARACTERS = 250;

function onError(error: Error) {
  console.error('Lexical MessageEditor:', error);
}

function InnerEditor({
  onSubmit,
  maxCharacters,
  disabled,
}: {
  onSubmit: (payload: MessageEditorSubmitPayload) => void | Promise<void>;
  maxCharacters: number;
  disabled?: boolean;
}) {
  const [editor] = useLexicalComposerContext();

  const handleSubmit = async () => {
    let text = '';
    let hasStructure = false;
    const state = editor.getEditorState();
    state.read(() => {
      const root = $getRoot();
      text = root.getTextContent();
      const children = root.getChildren();
      hasStructure = children.some(node => typeof node.getType === 'function' && node.getType() !== 'paragraph');
    });
    text = text.trim();
    if (!text && !hasStructure) return;
    if (text.length > maxCharacters) return;
    const lexicalState = state.toJSON() as unknown as Record<string, unknown>;
    await Promise.resolve(onSubmit({ text, lexicalState }));
    editor.update(() => {
      $getRoot().clear();
    });
  };

  return (
    <div className="flex items-end gap-2 border-t border-white/10 bg-black/40 p-2">
      <Button
        type="button"
        variant="default"
        size="sm"
        className="shrink-0 ml-auto"
        onClick={handleSubmit}
        disabled={disabled}
        aria-label="Send">
        Відправити
        <SendHorizontalIcon className="size-4" />
      </Button>
    </div>
  );
}

export function MessageEditor({
  onSubmit,
  placeholder = 'Напишіть повідомлення...',
  maxCharacters = DEFAULT_MAX_CHARACTERS,
  className,
  disabled = false,
}: MessageEditorProps) {
  const initialConfig = {
    namespace: 'MessageEditor',
    theme: newMessageAreaTheme,
    onError,
    nodes: [OverflowNode, LinkNode, YouTubeEmbedNode],
  };

  return (
    <div
      className={cn('flex w-full flex-col overflow-hidden rounded-lg border border-white/10 bg-black/40', className)}>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextBehaviorPlugin />
        <LinkPlugin />
        <ToolbarPlugin />
        <div className="relative min-h-[80px] flex-1">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-placeholder={placeholder}
                className="min-h-[80px] w-full resize-none overflow-auto px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                placeholder={null}
              />
            }
            placeholder={
              <div className="pointer-events-none absolute left-3 top-2 text-sm text-zinc-500">{placeholder}</div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <CharacterLimitPlugin
          charset="UTF-16"
          maxLength={maxCharacters}
          renderer={({ remainingCharacters }) => (
            <div
              className={cn(
                'px-2 py-0.5 text-right text-xs',
                remainingCharacters < 0
                  ? 'text-red-400'
                  : remainingCharacters <= 20
                    ? 'text-amber-400'
                    : 'text-zinc-500',
              )}>
              {remainingCharacters < 0 ? `${remainingCharacters}` : `${remainingCharacters} / ${maxCharacters}`}
            </div>
          )}
        />
        <InnerEditor onSubmit={onSubmit} maxCharacters={maxCharacters} disabled={disabled} />
      </LexicalComposer>
    </div>
  );
}
