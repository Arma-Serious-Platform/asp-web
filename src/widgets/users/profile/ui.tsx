'use client';

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Button } from '@/shared/ui/atoms/button';
import Image from 'next/image';
import {
  ActivityIcon,
  LockKeyholeIcon,
  MailIcon,
  SendIcon,
  ShieldUserIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';

import {
  UserNicknameText,
  UserRoleText,
  UserStatusText,
} from '@/entities/user/ui/user-text';
import { View } from '@/features/view';
import { parseAsStringEnum, useQueryState } from 'nuqs';
import { UserSquad } from '@/widgets/user/user-squad';
import ChangePassword from '@/features/user/change-password/ui';
import { ChangeAvatarModal } from '@/features/user/change-avatar/ui';
import { InfoTile } from '@/shared/ui/moleculas/info-tile';
import { ChangeSocials } from '@/features/user/change-socials';
import { UserProfileModel } from './model';
import { Preloader } from '@/shared/ui/atoms/preloader';

type UserProfileProps = {
  userIdOrNickname: string;
  model: UserProfileModel;
};

const UserProfile = observer(({ userIdOrNickname, model }: UserProfileProps) => {
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringEnum(['profile', 'squad', 'security'])
  );

  useEffect(() => {
    model.init(userIdOrNickname);
  }, [userIdOrNickname, model]);

  const isOwnProfile = model.isOwnProfile;

  return (
    <>
      <ChangeAvatarModal model={model.avatar} autoInputClick />

      <div className='container mx-auto my-6 w-full px-4'>
        <Preloader isLoading={model.loader.isLoading}>
          <div className='paper mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-xl border px-5 py-5 shadow-xl lg:flex-row lg:px-7 lg:py-6'>
            {/* Left column: avatar + tabs */}
            <div className='flex w-full flex-col gap-4 lg:w-64'>
              <div className='group relative w-full overflow-hidden rounded-lg border border-white/10 bg-black/70 shadow-lg'>
                <Image
                  className='h-full w-full object-cover'
                  src={model.user?.avatar?.url || '/images/avatar.jpg'}
                  width={256}
                  height={256}
                  alt='avatar'
                />
                <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70' />
                {isOwnProfile && (
                  <Button
                    onClick={() => model.avatar.modal.open()}
                    size='sm'
                    variant='secondary'
                    className='absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/20 bg-black/80 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-100 hover:bg-black'>
                    Змінити аватар
                  </Button>
                )}
              </div>

              <div className='flex flex-col gap-1 rounded-md border border-white/10 bg-black/60 p-1 text-xs'>
                <div className='px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-zinc-500'>
                  Профіль
                </div>
                <div className='flex flex-col gap-1'>
                  <Button
                    size='sm'
                    onClick={() => setTab('profile')}
                    variant={tab === 'profile' ? 'default' : 'ghost'}
                    className='flex w-full items-center justify-start gap-2 text-xs'>
                    <UserIcon className='size-4' />
                    <span>Основна інформація</span>
                  </Button>
                  {isOwnProfile && (
                    <>
                      <Button
                        size='sm'
                        onClick={() => setTab('squad')}
                        variant={tab === 'squad' ? 'default' : 'ghost'}
                        className='flex w-full items-center justify-start gap-2 text-xs'>
                        <UsersIcon className='size-4' />
                        <span>Мій загін</span>
                      </Button>
                      <Button
                        size='sm'
                        onClick={() => setTab('security')}
                        variant={tab === 'security' ? 'default' : 'ghost'}
                        className='flex w-full items-center justify-start gap-2 text-xs'>
                        <LockKeyholeIcon className='size-4' />
                        <span>Безпека</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right column: tab content */}
            <div className='flex w-full flex-col gap-4 border-t border-white/10 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0'>
              <View.Condition if={tab === 'profile'}>
                <div className='flex flex-col gap-5'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500'>
                      Основна інформація
                    </span>
                    <div className='flex items-center gap-2 text-lg font-semibold text-white'>
                      <UserIcon className='size-5 text-primary' />
                      <UserNicknameText
                        user={model.user}
                        sideType={model?.user?.squad?.side?.type}
                      />
                    </div>
                  </div>

                  <div className='grid gap-3 text-sm text-zinc-200 sm:grid-cols-2'>
                    <InfoTile
                      icon={<ShieldUserIcon className='size-4' />}
                      title='Роль'
                      description={<UserRoleText role={model.user?.role} />}
                    />
                    <InfoTile
                      icon={<ActivityIcon className='size-4' />}
                      title='Статус'
                      description={
                        <UserStatusText status={model.user?.status} />
                      }
                    />
                    {isOwnProfile && (
                      <InfoTile
                        className='sm:col-span-2'
                        icon={<MailIcon className='size-4' />}
                        title='Електронна пошта'
                        description={model.user?.email}
                      />
                    )}
                    {isOwnProfile && (
                      <InfoTile
                        className='sm:col-span-2'
                        icon={<SendIcon className='size-4' />}
                        title='Соціальні мережі'
                        description={
                          <ChangeSocials
                            className='mt-1'
                            user={model.user}
                            isLoading={model.socialsLoader.isLoading}
                            onChange={(changes) => {
                              if (Object.keys(changes).length === 0) return;

                              model.updateUser(changes);
                            }}
                          />
                        }
                      />
                    )}
                  </div>
                </div>
              </View.Condition>

              {isOwnProfile && (
                <>
                  <View.Condition if={tab === 'squad'}>
                    <div className='flex flex-col gap-3'>
                      <span className='text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500'>
                        Мій загін
                      </span>
                      <UserSquad user={model.user} />
                    </div>
                  </View.Condition>

                  <View.Condition if={tab === 'security'}>
                    <div className='flex flex-col gap-4'>
                      <div className='flex flex-col gap-1'>
                        <span className='text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500'>
                          Безпека облікового запису
                        </span>
                        <div className='text-lg font-bold text-white'>
                          Змінити пароль
                        </div>
                      </div>
                      <ChangePassword user={model.user} />
                    </div>
                  </View.Condition>
                </>
              )}
            </div>
          </div>
        </Preloader>
      </div>
    </>
  );
});

export { UserProfile };

