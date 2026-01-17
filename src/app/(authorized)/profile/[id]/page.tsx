'use client';

import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { Hero } from '@/widgets/hero';
import { session } from '@/entities/session/model';
import { ROUTES } from '@/shared/config/routes';
import { useRouter, useParams, redirect } from 'next/navigation';
import { UserProfile } from '@/widgets/users/profile/ui';

import { model } from './model';

const UserProfilePage = observer(() => {
  const router = useRouter();
  const params = useParams();
  const userIdOrNickname = params?.id as string;

  useEffect(() => {
    if (!session.isAuthorized) {
      router.push(ROUTES.auth.login);
      return;
    }

    if (userIdOrNickname) {
      model.userProfile.init(userIdOrNickname);
    }
  }, [userIdOrNickname, model, router]);

  if (!session.isAuthorized || !userIdOrNickname) {
    return null;
  }

  if (userIdOrNickname === session?.user?.user?.id || model.userProfile.user?.id === session.user?.user?.id) {
    return redirect(`${ROUTES.user.profile}?tab=profile`);
  }

  return (
    <Layout>
      <Hero />
      <UserProfile userIdOrNickname={userIdOrNickname} model={model.userProfile} />
    </Layout>
  );
});

export default UserProfilePage;
