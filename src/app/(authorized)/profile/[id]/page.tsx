'use client';

import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { Hero } from '@/widgets/hero';
import { session } from '@/entities/session/session.state';
import { ROUTES } from '@/shared/config/routes';
import { useRouter, useParams, redirect } from 'next/navigation';
import { UserProfile } from '@/app/(authorized)/profile/ui/user-profile';

import { userProfilePageState } from './state/user-profile-page.state';

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
      userProfilePageState.userProfile.init(userIdOrNickname);
    }
  }, [userIdOrNickname, router]);

  if (!session.isAuthorized || !userIdOrNickname) {
    return null;
  }

  if (userIdOrNickname === session.user?.data?.id || userProfilePageState.userProfile.user?.id === session.user?.data?.id) {
    return redirect(`${ROUTES.user.profile}?tab=profile`);
  }

  return (
    <Layout>
      <Hero />
      <UserProfile userIdOrNickname={userIdOrNickname} model={userProfilePageState.userProfile} />
    </Layout>
  );
});

export default UserProfilePage;
