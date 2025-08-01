'use client';

import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { profile } from './model';
import { Button } from '@/shared/ui/atoms/button';
import Image from 'next/image';
import { ActivityIcon, MailIcon, ShieldUserIcon, UserIcon } from 'lucide-react';

import {
  UserNicknameText,
  UserRoleText,
  UserStatusText,
} from '@/entities/user/ui/user-text';
import { Hero } from '@/widgets/hero';
import { session } from '@/entities/session/model';
import { ROUTES } from '@/shared/config/routes';
import { useRouter } from 'next/navigation';

import { View } from '@/features/view';
import { parseAsStringEnum, useQueryState } from 'nuqs';
import { UserSquad } from '@/entities/user/ui/user-squad';
import ChangePassword from '@/features/user/change-password/ui';

const ProfilePage = observer(() => {
  const router = useRouter();
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringEnum(['profile', 'squad', 'security'])
  );

  useEffect(() => {
    profile.init();
  }, []);

  useEffect(() => {
    if (!session.isAuthorized) {
      router.push(ROUTES.auth.login);
    }
  }, [session.isAuthorized]);

  return (
    <Layout>
      <Hero />
      <div className='max-w-5xl bg-card/80 w-full mx-auto my-4'>
        <div className='flex items-center gap-2'>
          <div className='flex flex-col gap-2'>
            <div className='flex gap-2'>
              <div className='flex flex-col shrink-0'>
                <div className='flex items-center gap-2'>
                  <Image
                    src={profile.user?.avatarUrl || '/images/avatar.jpg'}
                    width={256}
                    height={256}
                    alt='avatar'
                  />
                </div>
                <div className='flex flex-col w-full gap-0.5'>
                  <Button
                    onClick={() => setTab('profile')}
                    variant={tab === 'profile' ? 'default' : 'ghost'}
                    className='justify-start'>
                    Профіль
                  </Button>
                  <Button
                    onClick={() => setTab('squad')}
                    variant={tab === 'squad' ? 'default' : 'ghost'}
                    className='justify-start'>
                    Мій загін
                  </Button>

                  <Button
                    onClick={() => setTab('security')}
                    variant={tab === 'security' ? 'default' : 'ghost'}
                    className='justify-start'>
                    Безпека
                  </Button>
                </div>
              </div>

              <div className='flex flex-col gap-1 p-4'>
                <View.Condition if={tab === 'profile'}>
                  <div className='flex flex-col gap-4'>
                    <div className='flex items-center gap-2'>
                      <UserIcon className='size-6' />
                      <UserNicknameText user={profile.user} />
                    </div>
                    <div className='flex items-center  gap-2'>
                      <ShieldUserIcon className='size-6' />

                      <UserRoleText role={profile.user?.role} />
                    </div>
                    <div className='flex items-center  gap-2'>
                      <ActivityIcon className='size-6' />
                      <UserStatusText status={profile.user?.status} />
                    </div>

                    <div className='flex items-center  gap-2'>
                      <MailIcon className='size-6' />
                      <span>{profile.user?.email}</span>
                    </div>
                  </div>
                </View.Condition>

                <View.Condition if={tab === 'squad'}>
                  <UserSquad user={profile.user} />
                </View.Condition>

                <View.Condition if={tab === 'security'}>
                  <div className='flex flex-col gap-4'>
                    <div className='text-lg font-bold'>Змінити пароль</div>
                    <ChangePassword user={profile.user} />
                  </div>
                </View.Condition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
});

export default ProfilePage;
