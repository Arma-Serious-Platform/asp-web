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
import { ChangeAvatarModal } from '@/features/user/change-avatar/ui';

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
      <ChangeAvatarModal model={profile.avatar} autoInputClick />
      <div className='paper max-w-5xl w-full mx-auto my-4'>
        <div className='flex items-center gap-2'>
          <div className='flex flex-col gap-2'>
            <div className='flex gap-2'>
              <div className='flex flex-col shrink-0'>
                <div className='relative flex items-center gap-2 group'>
                  <div className='absolute top-0 left-0 w-full h-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                  <Button
                    onClick={() => profile.avatar.modal.open()}
                    size='lg'
                    variant='outline'
                    className='absolute flex items-center justify-center z-10 top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    Змінити
                  </Button>
                  <Image
                    className='rounded-lg'
                    src={profile.user?.avatar?.url || '/images/avatar.jpg'}
                    width={256}
                    height={256}
                    alt='avatar'
                  />
                </div>
                <div className='flex flex-col w-full gap-0.5'>
                  <Button
                    size='sm'
                    onClick={() => setTab('profile')}
                    variant={tab === 'profile' ? 'default' : 'ghost'}
                    className='justify-start'>
                    Профіль
                  </Button>
                  <Button
                    size='sm'
                    onClick={() => setTab('squad')}
                    variant={tab === 'squad' ? 'default' : 'ghost'}
                    className='justify-start'>
                    Мій загін
                  </Button>

                  <Button
                    size='sm'
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
                      <UserNicknameText
                        user={profile.user}
                        sideType={profile?.user?.squad?.side?.type}
                      />
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
