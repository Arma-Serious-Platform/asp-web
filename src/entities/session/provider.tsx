'use client';

import type { User } from '@/shared/sdk/types';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';

import { session } from './model';

export const SessionProvider = observer(
  ({ children, initialUser }: { children: React.ReactNode; initialUser: User | null }) => {
    const isHydratedRef = useRef(false);

    if (!isHydratedRef.current) {
      session.hydrate(initialUser);
      isHydratedRef.current = true;
    }

    useEffect(() => {
      session.hydrate(initialUser);
    }, [initialUser]);

    useEffect(() => {
      void session.boot();
    }, []);

    return <>{children}</>;
  },
);
