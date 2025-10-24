'use client';

import { cn } from '@/shared/utils/cn';
import { CopyIcon } from 'lucide-react';
import { FC } from 'react';
import toast from 'react-hot-toast';

const CodeCopy: FC<{
  string: string;
  className?: string;
  successMessage?: string;
}> = ({ string, className, successMessage = 'Скопійовано' }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(string);

    toast.success(successMessage);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 relative h-8 w-fit bg-black text-sm p-2 truncate',
        className
      )}>
      <code className='text-primary'>{string}</code>
      <CopyIcon
        className='size-4 cursor-pointer shrink-0 hover:text-primary'
        onClick={handleCopy}
      />
    </div>
  );
};

export { CodeCopy };
