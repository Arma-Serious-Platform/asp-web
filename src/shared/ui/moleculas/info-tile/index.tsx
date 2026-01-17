import { FC, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

type InfoTileProps = {
  title: ReactNode;
  description: ReactNode;
  icon?: ReactNode;
  className?: string;
};

const InfoTile: FC<InfoTileProps> = ({ title, description, icon, className }) => {
  return (
    <div className={cn('flex items-center gap-2 rounded-md bg-black/40 px-3 py-2 text-sm text-zinc-200', className)}>
      {icon && <div className="flex items-center justify-center text-zinc-400">{icon}</div>}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">{title}</span>
        <div className="text-sm text-zinc-200">{description}</div>
      </div>
    </div>
  );
};

export { InfoTile };
