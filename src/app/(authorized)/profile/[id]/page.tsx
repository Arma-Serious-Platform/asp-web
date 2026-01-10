'use client';

import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { Hero } from '@/widgets/hero';
import { session } from '@/entities/session/model';
import { ROUTES } from '@/shared/config/routes';
import { useRouter, useParams } from 'next/navigation';
import { UserProfile } from '@/widgets/users/profile/ui';
import { UserProfileModel } from '@/widgets/users/profile/model';

const UserProfilePage = observer(() => {
  const router = useRouter();
  const params = useParams();
  const model = useMemo(() => new UserProfileModel(), []);
  const userIdOrNickname = params?.id as string;

  useEffect(() => {
    if (!session.isAuthorized) {
      router.push(ROUTES.auth.login);
      return;
    }

    if (userIdOrNickname) {
      model.init(userIdOrNickname);
    }
  }, [userIdOrNickname, model, router]);

  if (!session.isAuthorized || !userIdOrNickname) {
    return null;
  }

  return (
    <Layout>
      <Hero />
      <UserProfile userIdOrNickname={userIdOrNickname} model={model} />
    </Layout>
  );
});

export default UserProfilePage;

