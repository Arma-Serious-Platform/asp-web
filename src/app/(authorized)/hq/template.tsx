'use client';

import { session } from '@/entities/session/model';
import { ROUTES } from '@/shared/config/routes';
import { SideType } from '@/shared/sdk/types';
import { observer } from 'mobx-react-lite';
import { redirect } from 'next/navigation';

export default observer(function HqTemplate({ children }: { children: React.ReactNode }) {
  if (!session.isAuthorized) return redirect(ROUTES.auth.login);

  const sideType = session.user?.user?.squad?.side?.type;
  const canAccessHq = Boolean(session.user?.user?.squad && [SideType.BLUE, SideType.RED].includes(sideType as SideType));

  if (!canAccessHq) return redirect(ROUTES.home);

  return children;
});
