'use client';

import type { EditorConfig, LexicalEditor, SerializedLexicalNode } from 'lexical';
import { DecoratorNode } from 'lexical';
import type { JSX } from 'react';

export const YOUTUBE_EMBED_TYPE = 'youtube-embed';

export type SerializedYouTubeEmbedNode = SerializedLexicalNode & {
  type: typeof YOUTUBE_EMBED_TYPE;
  videoId: string;
};

function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.trim().match(re);
    if (m) return m[1];
  }
  return null;
}

export function extractYouTubeVideoId(urlOrId: string): string | null {
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return getYouTubeVideoId(trimmed);
}

function YouTubeEmbedComponent({ videoId }: { videoId: string; nodeKey: string }) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className="my-2 flex justify-center" contentEditable={false}>
      <iframe
        title="YouTube embed"
        src={embedUrl}
        className="h-[200px] w-full max-w-[360px] rounded-lg border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export class YouTubeEmbedNode extends DecoratorNode<JSX.Element> {
  __videoId: string;

  static getType(): string {
    return YOUTUBE_EMBED_TYPE;
  }

  static clone(node: YouTubeEmbedNode): YouTubeEmbedNode {
    return new YouTubeEmbedNode(node.__videoId, node.__key);
  }

  constructor(videoId: string, key?: string) {
    super(key);
    this.__videoId = videoId;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    return document.createElement('div');
  }

  updateDOM(): boolean {
    return false;
  }

  getVideoId(): string {
    const self = this.getLatest();
    return self.__videoId;
  }

  exportJSON(): SerializedYouTubeEmbedNode {
    return {
      ...super.exportJSON(),
      type: YOUTUBE_EMBED_TYPE,
      videoId: this.__videoId,
    };
  }

  static importJSON(serialized: SerializedYouTubeEmbedNode): YouTubeEmbedNode {
    return $createYouTubeEmbedNode(serialized.videoId);
  }

  isInline(): boolean {
    return false;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): JSX.Element {
    return <YouTubeEmbedComponent videoId={this.__videoId} nodeKey={this.__key} />;
  }
}

export function $createYouTubeEmbedNode(videoId: string): YouTubeEmbedNode {
  return new YouTubeEmbedNode(videoId);
}

export function $isYouTubeEmbedNode(node: unknown): node is YouTubeEmbedNode {
  return node instanceof YouTubeEmbedNode;
}
