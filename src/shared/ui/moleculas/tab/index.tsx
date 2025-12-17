import { FC } from 'react';
import classNames from 'classnames';

export type TabProps = {
  title: string;
  index: number;
  isActive: boolean;
  onClick: () => void;
  isLast: boolean;
};

export const Tab: FC<TabProps> = ({
  title,
  index,
  isActive,
  onClick,
  isLast,
}) => (
  <div className='relative flex'>
    <button
      onClick={onClick}
      className={classNames(
        'px-4 py-2 text-sm font-medium transition-colors border-b-2 relative z-10 cursor-pointer',
        {
          'bg-lime-700 text-white border-lime-600': isActive,
          'bg-neutral-800 text-white border-transparent hover:bg-neutral-700':
            !isActive,
        }
      )}>
      {index + 1}. {title}
    </button>
    {isActive && !isLast && (
      <div className='absolute right-0 top-0 bottom-0 w-[1px] bg-lime-600 z-20' />
    )}
  </div>
);

