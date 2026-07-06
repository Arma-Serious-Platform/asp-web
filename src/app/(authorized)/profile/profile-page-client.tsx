'use client';

import { session } from '@/entities/session/model';
import { User } from '@/shared/sdk/types';
import { Hero } from '@/widgets/hero';
import { Layout } from '@/widgets/layout';
import { UserProfile } from '@/widgets/users/profile/ui';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { model } from './model';

const ProfilePageClient = observer(({ initialUser }: { initialUser: User }) => {
  useEffect(() => {
    session.hydrate(initialUser);
  }, [initialUser]);

  return (
    <Layout>
      <Hero />
      <UserProfile model={model.profile} />
    </Layout>
  );
});

export { ProfilePageClient };
