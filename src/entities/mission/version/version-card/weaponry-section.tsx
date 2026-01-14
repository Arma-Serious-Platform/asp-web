'use client';

import { cn } from '@/shared/utils/cn';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { MissionWeaponry, MissionGameSide } from '@/shared/sdk/types';
import { sideTypeColors } from '@/entities/mission/lib';
import { FC } from 'react';

type WeaponrySectionProps = {
  weaponry: MissionWeaponry[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  sideType: MissionGameSide;
};

export const WeaponrySection: FC<WeaponrySectionProps> = ({
  weaponry,
  isOpen,
  setIsOpen,
  sideType,
}) => {
  if (weaponry.length === 0) {
    return null;
  }

  return (
    <div className='pt-2 border-t border-white/5'>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-between w-full hover:opacity-80 transition-opacity cursor-pointer'>
        <span className='text-xs font-medium text-zinc-400'>
          Озброєння ({weaponry.length})
        </span>
        {isOpen ? (
          <ChevronUpIcon className='size-4 text-zinc-400' />
        ) : (
          <ChevronDownIcon className='size-4 text-zinc-400' />
        )}
      </button>
      {isOpen && (
        <div className='mt-2 flex flex-col gap-1.5'>
          {weaponry.map((weaponryItem, index) => (
            <div
              key={weaponryItem.id || index}
              className='p-2 rounded bg-black/60 border border-white/5'>
              <div className='flex items-start justify-between gap-2'>
                <div className='flex-1'>
                  <div
                    className={cn('font-medium text-sm', {
                      'text-destructive': sideType === MissionGameSide.RED,
                      'text-green-400': sideType === MissionGameSide.GREEN,
                      'text-blue-400': sideType === MissionGameSide.BLUE,
                    })}>
                    {weaponryItem.name}
                    {weaponryItem.description && (
                      <span className='text-xs text-zinc-400 mt-0.5'>
                        {' '}
                        ({weaponryItem.description})
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={cn('text-sm font-semibold text-zinc-300', {
                    'text-destructive': sideType === MissionGameSide.RED,
                    'text-green-400': sideType === MissionGameSide.GREEN,
                    'text-blue-400': sideType === MissionGameSide.BLUE,
                  })}>
                  x{weaponryItem.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
