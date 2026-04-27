'use client';

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { FC } from 'react';
import { MissionVersionScreenshot } from '@/shared/sdk/types';

type UniformSectionProps = {
  screenshots: MissionVersionScreenshot[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onPreview: (screenshots: MissionVersionScreenshot[], startIndex: number) => void;
};

export const UniformSection: FC<UniformSectionProps> = ({ screenshots, isOpen, setIsOpen, onPreview }) => {
  if (screenshots.length === 0) {
    return null;
  }

  return (
    <div className="pt-2 border-t border-white/5">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full hover:opacity-80 transition-opacity cursor-pointer">
        <span className="text-xs font-medium text-zinc-400">Уніформа ({screenshots.length})</span>
        {isOpen ? (
          <ChevronUpIcon className="size-4 text-zinc-400" />
        ) : (
          <ChevronDownIcon className="size-4 text-zinc-400" />
        )}
      </button>
      {isOpen && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {screenshots.map((screenshot, index) => (
            <button
              key={screenshot.id}
              type="button"
              onClick={() => onPreview(screenshots, index)}
              className="group relative overflow-hidden rounded border border-white/10 bg-black/60 focus:outline-none focus:ring-2 focus:ring-lime-500/70 cursor-zoom-in">
              <img
                src={screenshot.url}
                alt="Скріншот уніформи"
                className="w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
