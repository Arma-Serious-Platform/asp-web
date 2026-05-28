'use client';

import { session } from '@/entities/session/model';
import { ROUTES } from '@/shared/config/routes';
import { observer } from 'mobx-react-lite';
import { redirect } from 'next/navigation';

export default observer(function HqTemplate({ children }: { children: React.ReactNode }) {
  if (!session.isAuthorized) return redirect(ROUTES.auth.login);

  if (!session.canAccessHeadquarters) return redirect(ROUTES.home);

  return children;
});
