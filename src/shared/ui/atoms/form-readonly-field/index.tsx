import { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

type FormReadonlyFieldProps = {
  value?: ReactNode;
  emptyValue?: ReactNode;
  className?: string;
};

const isEmptyValue = (value: ReactNode) => value === null || value === undefined || (typeof value === 'string' && !value.trim());

function FormReadonlyField({ value, emptyValue = '—', className }: FormReadonlyFieldProps) {
  const isEmpty = isEmptyValue(value);

  return (
    <div
      className={cn(
        'flex min-h-9 w-full items-center px-2 py-1 text-sm text-zinc-100 whitespace-pre-wrap wrap-break-word',
        isEmpty && 'text-zinc-500',
        className,
      )}>
      {isEmpty ? emptyValue : value}
    </div>
  );
}

export { FormReadonlyField };
