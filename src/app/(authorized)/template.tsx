'use client';
import { session } from '@/entities/session/model';
import { ROUTES } from '@/shared/config/routes';
import { Layout } from '@/widgets/layout';
import { LoaderIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { redirect } from 'next/navigation';

export default observer(function AuthTemplate({ children }: { children: React.ReactNode }) {
  if (session.preloader.isLoading)
    return (
      <Layout className="h-full flex-1 flex items-center justify-center">
        <LoaderIcon className="size-10 animate-spin" />
      </Layout>
    );

  if (!session.isAuthorized) return redirect(ROUTES.home);

  return children;
});
