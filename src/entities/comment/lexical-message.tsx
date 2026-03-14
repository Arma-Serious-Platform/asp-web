'use client';

import type { ReactNode } from 'react';
import type { JSX } from 'react';
import { MissionCommentMessage } from '@/shared/sdk/types';
import { YOUTUBE_EMBED_TYPE } from '@/features/chat/editor/youtube-node';

type SerializedNode = Record<string, unknown> & {
  type?: string;
  children?: SerializedNode[];
  /** Lexical TextNode uses "text"; some formats use "value" */
  text?: string;
  value?: string;
  url?: string;
  videoId?: string;
};

/** Normalize message: parse JSON string, or return as-is */
function normalizeMessage(message: MissionCommentMessage): MissionCommentMessage {
  if (typeof message === 'string') {
    const s = message as string;
    if (s.trim().startsWith('{')) {
      try {
        return JSON.parse(s) as MissionCommentMessage;
      } catch {
        return message;
      }
    }
    return message;
  }
  return message;
}

/** True if message is Lexical editor state (has root) or is the root node itself */
function isLexicalState(
  message: MissionCommentMessage,
): message is { root: SerializedNode } | (SerializedNode & { type: 'root' }) {
  const m = normalizeMessage(message);
  if (typeof m !== 'object' || m === null) return false;
  // Editor state shape: { root: { type: 'root', children: [...] } }
  if (
    'root' in m &&
    typeof (m as { root: unknown }).root === 'object' &&
    (m as { root: SerializedNode }).root !== null
  ) {
    return true;
  }
  // Root node at top level (some APIs return the root directly)
  if ((m as SerializedNode).type === 'root' && Array.isArray((m as SerializedNode).children)) {
    return true;
  }
  return false;
}

function getRootChildren(message: MissionCommentMessage): SerializedNode[] {
  const m = normalizeMessage(message);
  if (typeof m !== 'object' || m === null) return [];
  const root = 'root' in m ? (m as { root: SerializedNode }).root : (m as SerializedNode);
  if (!root || typeof root !== 'object') return [];
  const children = root.children;
  if (!Array.isArray(children)) return [];
  // Filter out key-only entries (Lexical sometimes stores keys as strings; we need node objects)
  return children.filter((c): c is SerializedNode => typeof c === 'object' && c !== null && 'type' in c);
}

/** Only recurse into array items that are serialized node objects (have type), not key strings */
function getNodeChildren(node: SerializedNode): SerializedNode[] {
  const raw = Array.isArray(node.children) ? node.children : [];
  return raw.filter((c): c is SerializedNode => typeof c === 'object' && c !== null && 'type' in c);
}

function renderNode(node: SerializedNode, key: number | string): ReactNode {
  if (!node || typeof node !== 'object') return null;
  const type = node.type as string | undefined;
  const children = getNodeChildren(node);

  switch (type) {
    case 'root':
      return (
        <span key={key} className="contents">
          {children.map((child, i) => renderNode(child, i))}
        </span>
      );
    case 'paragraph':
      return (
        <p key={key} className="mb-1 last:mb-0">
          {children.map((child, i) => renderNode(child, i))}
        </p>
      );
    case 'text': {
      const value = typeof node.text === 'string' ? node.text : typeof node.value === 'string' ? node.value : '';
      return <span key={key}>{value}</span>;
    }
    case 'link':
    case 'autolink': {
      const url = typeof node.url === 'string' ? node.url : '#';
      const safeUrl = url.startsWith('http') ? url : url.startsWith('mailto:') ? url : `https://${url}`;
      return (
        <a
          key={key}
          href={safeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lime-400 underline break-all">
          {children.length ? children.map((child, i) => renderNode(child, i)) : safeUrl}
        </a>
      );
    }
    case YOUTUBE_EMBED_TYPE: {
      const videoId = typeof node.videoId === 'string' ? node.videoId : '';
      if (!videoId) return null;
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      return (
        <div key={key} className="my-2 flex justify-start" data-lexical-decorator>
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
    case 'linebreak':
      return <br key={key} />;
    default:
      return (
        <span key={key} className="contents">
          {children.map((child, i) => renderNode(child, i))}
        </span>
      );
  }
}

export function getMessageText(message: MissionCommentMessage): string {
  const m = normalizeMessage(message);
  if (typeof m === 'object' && m !== null && 'text' in m) {
    return String((m as { text?: string }).text ?? '');
  }
  if (typeof m === 'string') return m;
  if (isLexicalState(m)) {
    const children = getRootChildren(m);
    const collectText = (nodes: SerializedNode[]): string =>
      nodes
        .map(n => {
          if ((n.type as string) === 'text') {
            const t = (n as SerializedNode).text ?? (n as SerializedNode).value;
            return typeof t === 'string' ? t : '';
          }
          const childNodes = getNodeChildren(n);
          if (childNodes.length) return collectText(childNodes);
          return '';
        })
        .join('');
    return collectText(children);
  }
  return '—';
}

export function MessageContent({ message }: { message: MissionCommentMessage }): JSX.Element {
  if (isLexicalState(message)) {
    const children = getRootChildren(message);
    if (children.length === 0) return <span className="text-zinc-500">—</span>;
    return (
      <div className="break-words text-base text-zinc-300 whitespace-pre-wrap [&_p]:whitespace-pre-wrap">
        {children.map((node, i) => renderNode(node as SerializedNode, i))}
      </div>
    );
  }

  const text = getMessageText(message);
  if (!text) return <span className="text-zinc-500">—</span>;

  return <div className="break-words text-base text-zinc-300 whitespace-pre-wrap">{text}</div>;
}
