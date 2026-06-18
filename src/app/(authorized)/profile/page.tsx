import { getSessionUser } from '@/entities/session/server/get-session-user';
import { ROUTES } from '@/shared/config/routes';
import { redirect } from 'next/navigation';

import { ProfilePageClient } from './profile-page-client';

export default async function ProfilePage() {
  const initialUser = await getSessionUser();

  if (!initialUser) {
    redirect(ROUTES.auth.login);
  }

  return <ProfilePageClient initialUser={initialUser} />;
}
