'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getRoot,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  $createTextNode,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useCallback, useEffect, useState } from 'react';
import { BoldIcon, ItalicIcon, UnderlineIcon, LinkIcon, SmileIcon, VideoIcon } from 'lucide-react';
import { Button } from '@/shared/ui/atoms/button';
import { cn } from '@/shared/utils/cn';
import { Popover } from '@/shared/ui/moleculas/popover';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/organisms/dialog';
import { $createYouTubeEmbedNode, extractYouTubeVideoId } from './youtube-node';

type Format = 'bold' | 'italic' | 'underline';

const EMOJI_GRID = [
  '😀',
  '😂',
  '❤️',
  '😍',
  '👍',
  '👎',
  '🙏',
  '🎉',
  '🔥',
  '✨',
  '😢',
  '😅',
  '😎',
  '🤔',
  '👋',
  '💯',
  '✅',
  '❌',
  '⭐',
  '💪',
];

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState<Set<Format>>(new Set());
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const updateFormats = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        setActiveFormats(new Set());
        return;
      }
      const set = new Set<Format>();
      if (selection.hasFormat('bold')) set.add('bold');
      if (selection.hasFormat('italic')) set.add('italic');
      if (selection.hasFormat('underline')) set.add('underline');
      setActiveFormats(set);
    });
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      updateFormats();
    });
  }, [editor, updateFormats]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateFormats();
        return false;
      },
      1,
    );
  }, [editor, updateFormats]);

  const applyFormat = (format: Format) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const insertEmoji = (emoji: string) => {
    editor.focus();
    editor.update(() => {
      let selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        $getRoot().selectEnd();
        selection = $getSelection();
      }
      if ($isRangeSelection(selection)) {
        $insertNodes([$createTextNode(emoji)]);
      }
    });
    setEmojiOpen(false);
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      setLinkOpen(false);
      return;
    }
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, normalized);
    setLinkUrl('');
    setLinkOpen(false);
  };

  const insertYouTube = () => {
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      setYoutubeUrl('');
      return;
    }
    editor.update(() => {
      const node = $createYouTubeEmbedNode(videoId);
      const paragraph = $createParagraphNode();
      $insertNodes([node, paragraph]);
    });
    setYoutubeUrl('');
    setYoutubeOpen(false);
  };

  return (
    <div className="flex items-center gap-0.5 border-b border-white/10 bg-black/40 px-2 py-1">
      <FormatButton
        format="bold"
        active={activeFormats.has('bold')}
        onPress={() => applyFormat('bold')}
        icon={<BoldIcon className="size-4" />}
      />
      <FormatButton
        format="italic"
        active={activeFormats.has('italic')}
        onPress={() => applyFormat('italic')}
        icon={<ItalicIcon className="size-4" />}
      />
      <FormatButton
        format="underline"
        active={activeFormats.has('underline')}
        onPress={() => applyFormat('underline')}
        icon={<UnderlineIcon className="size-4" />}
      />

      <div className="mx-1 w-px self-stretch bg-white/10" aria-hidden />

      <Popover
        open={linkOpen}
        onChange={setLinkOpen}
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label="Insert link"
            title="Insert link">
            <LinkIcon className="size-4" />
          </Button>
        }
        className="w-64">
        <label className="text-muted-foreground mb-1 block text-xs">URL</label>
        <input
          type="url"
          value={linkUrl}
          onChange={e => setLinkUrl(e.target.value)}
          placeholder="https://..."
          className="border-border bg-background placeholder:text-muted-foreground w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-lime-500"
          onKeyDown={e => e.key === 'Enter' && applyLink()}
        />
        <p className="text-muted-foreground mt-1 text-xs">Select text first, then add link.</p>
        <Button type="button" size="sm" className="mt-2 w-full" onClick={applyLink}>
          Apply link
        </Button>
      </Popover>

      <Popover
        open={emojiOpen}
        onChange={setEmojiOpen}
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label="Insert emoji"
            title="Insert emoji">
            <SmileIcon className="size-4" />
          </Button>
        }
        className="w-56 p-1">
        <div className="grid grid-cols-5 gap-0.5">
          {EMOJI_GRID.map(emoji => (
            <button
              key={emoji}
              type="button"
              className="hover:bg-white/10 rounded p-1 text-lg leading-none transition-colors"
              onClick={() => insertEmoji(emoji)}
              aria-label={`Insert ${emoji}`}>
              {emoji}
            </button>
          ))}
        </div>
      </Popover>

      <Dialog open={youtubeOpen} onOpenChange={setYoutubeOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label="Insert YouTube video"
            title="Insert YouTube video">
            <VideoIcon className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert YouTube video</DialogTitle>
          </DialogHeader>
          <div>
            <label className="text-muted-foreground mb-1 block text-sm">Video URL</label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="border-border bg-background placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setYoutubeOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={insertYouTube} disabled={!extractYouTubeVideoId(youtubeUrl)}>
              Insert video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FormatButton({
  format,
  active,
  onPress,
  icon,
}: {
  format: string;
  active: boolean;
  onPress: () => void;
  icon: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('size-8 shrink-0', active && 'bg-white/10 text-lime-400')}
      onClick={e => {
        e.preventDefault();
        onPress();
      }}
      aria-label={format}
      title={format}>
      {icon}
    </Button>
  );
}
