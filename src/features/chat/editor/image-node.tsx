'use client';

import type { EditorConfig, LexicalEditor, SerializedLexicalNode } from 'lexical';
import { DecoratorNode } from 'lexical';
import type { JSX } from 'react';

export const IMAGE_EMBED_TYPE = 'image-embed';

export type SerializedImageEmbedNode = SerializedLexicalNode & {
  type: typeof IMAGE_EMBED_TYPE;
  src: string;
  alt?: string;
  fileId?: string;
};

function ImageEmbedComponent({ src, alt }: { src: string; alt?: string; nodeKey: string }) {
  return (
    <div className="my-2 flex justify-center" contentEditable={false}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || 'Зображення'}
        className="max-h-[480px] w-full max-w-full rounded-lg border border-white/10 object-contain"
      />
    </div>
  );
}

export class ImageEmbedNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __alt?: string;
  __fileId?: string;

  static getType(): string {
    return IMAGE_EMBED_TYPE;
  }

  static clone(node: ImageEmbedNode): ImageEmbedNode {
    return new ImageEmbedNode(node.__src, node.__alt, node.__fileId, node.__key);
  }

  constructor(src: string, alt?: string, fileId?: string, key?: string) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__fileId = fileId;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    return document.createElement('div');
  }

  updateDOM(): boolean {
    return false;
  }

  getSrc(): string {
    return this.getLatest().__src;
  }

  getAlt(): string | undefined {
    return this.getLatest().__alt;
  }

  getFileId(): string | undefined {
    return this.getLatest().__fileId;
  }

  exportJSON(): SerializedImageEmbedNode {
    return {
      ...super.exportJSON(),
      type: IMAGE_EMBED_TYPE,
      src: this.__src,
      ...(this.__alt ? { alt: this.__alt } : {}),
      ...(this.__fileId ? { fileId: this.__fileId } : {}),
    };
  }

  static importJSON(serialized: SerializedImageEmbedNode): ImageEmbedNode {
    return $createImageEmbedNode(serialized.src, serialized.alt, serialized.fileId);
  }

  isInline(): boolean {
    return false;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): JSX.Element {
    return <ImageEmbedComponent src={this.__src} alt={this.__alt} nodeKey={this.__key} />;
  }
}

export function $createImageEmbedNode(src: string, alt?: string, fileId?: string): ImageEmbedNode {
  return new ImageEmbedNode(src, alt, fileId);
}

export function $isImageEmbedNode(node: unknown): node is ImageEmbedNode {
  return node instanceof ImageEmbedNode;
}
