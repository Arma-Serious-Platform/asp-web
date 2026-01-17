'use client';

import { session } from './model';

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

export const SessionProvider = observer(({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    session.boot();
  }, []);

  return <>{children}</>;
});
