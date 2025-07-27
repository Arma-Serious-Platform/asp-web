'use client';

import { session } from './model';
import { LoginResponse } from '@/shared/sdk/types';
import { observer } from 'mobx-react-lite';

export const SessionProvider = observer(
  ({
    children,
    initialData,
  }: {
    children: React.ReactNode;
    initialData: LoginResponse | null;
  }) => {
    if (initialData) {
      session.boot(initialData);
    }

    return <>{children}</>;
  }
);
