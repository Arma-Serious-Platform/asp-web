'use client';
import { session } from '@/entities/session/model';
import { ROUTES } from '@/shared/config/routes';
import { LoaderIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { redirect } from 'next/navigation';

export default observer(function AuthTemplate({ children }: { children: React.ReactNode }) {
  if (session.preloader.isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderIcon className="size-10 animate-spin" />
      </div>
    );

  if (!session.isAuthorized) return redirect(ROUTES.home);

  return children;
});
