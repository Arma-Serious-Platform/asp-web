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

const ProfilePage = observer(() => {
  const router = useRouter();

  useEffect(() => {
    profile.init();
  }, []);

  useEffect(() => {
    if (!session.isAuthorized) {
      router.push(ROUTES.auth.login);
    }
  }, [session.isAuthorized]);

  return (
    <Layout className=''>
      <Hero />
      <div className='max-w-5xl bg-card/80 w-full mx-auto mt-4'>
        <div className='flex items-center gap-2'>
          <div className='flex flex-col gap-2'>
            <div className='flex gap-2'>
              <div className='flex flex-col'>
                <div className='flex items-center gap-2'>
                  <Image
                    src={profile.user?.avatarUrl || '/images/avatar.jpg'}
                    width={256}
                    height={256}
                    alt='avatar'
                  />
                </div>
                <Button className='justify-start' variant='ghost'>
                  Профіль
                </Button>
                <Button className='justify-start'>Мій загін</Button>
                <Button className='justify-start'>Безпека</Button>
              </div>

              <div className='flex flex-col gap-1 p-4'>
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

                <div className=''>{}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
});

export default ProfilePage;
