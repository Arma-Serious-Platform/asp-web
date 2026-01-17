import { FC, PropsWithChildren } from 'react';
import { LoaderIcon } from 'react-hot-toast';

export const Preloader: FC<
  PropsWithChildren<{
    isLoading: boolean;
  }>
> = ({ isLoading, children }) => {
  if (!isLoading) return children;

  return (
    <div className="relative mx-auto w-full">
      <LoaderIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin size-4" />
      {children}
    </div>
  );
};
