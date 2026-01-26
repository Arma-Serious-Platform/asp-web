'use client';

import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { Hero } from '@/widgets/hero';
import { session } from '@/entities/session/model';
import { ROUTES } from '@/shared/config/routes';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/widgets/users/profile/ui';

import { model } from './model';

const ProfilePage = observer(() => {
  const router = useRouter();

  useEffect(() => {
    if (!session.isAuthorized) {
      router.push(ROUTES.auth.login);

      return;
    }
  }, [session.isAuthorized, router]);

  if (!session.isAuthorized) {
    return null;
  }

  return (
    <Layout>
      <Hero />
      <UserProfile model={model.profile} />
    </Layout>
  );
});

export default ProfilePage;
