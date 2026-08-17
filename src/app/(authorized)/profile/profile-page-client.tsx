'use client';

import { session } from '@/entities/session/session.state';
import { User } from '@/shared/sdk/types';
import { Hero } from '@/widgets/hero';
import { Layout } from '@/widgets/layout';
import { UserProfile } from '@/app/(authorized)/profile/ui/user-profile';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { profilePageState } from './state/profile-page.state';

const ProfilePageClient = observer(({ initialUser }: { initialUser: User }) => {
  useEffect(() => {
    session.hydrate(initialUser);
  }, [initialUser]);

  return (
    <Layout>
      <Hero />
      <UserProfile model={profilePageState.profile} />
    </Layout>
  );
});

export { ProfilePageClient };
