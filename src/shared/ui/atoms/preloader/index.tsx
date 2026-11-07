import { FC, PropsWithChildren } from 'react';
import { LoaderIcon } from 'react-hot-toast';

export const Preloader: FC<
  PropsWithChildren<{
    isLoading: boolean;
  }>
> = ({ isLoading, children }) => {
  // Keep the same element while idle: dropping it would remount `children` whenever loading changes.
  return (
    <div className={isLoading ? 'relative mx-auto w-full' : 'contents'}>
      {isLoading && (
        <LoaderIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin size-4" />
      )}
      {children}
    </div>
  );
};
