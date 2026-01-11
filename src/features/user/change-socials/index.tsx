'use client';

import { FC, useMemo, useState } from 'react';
import Image from 'next/image';
import { PencilIcon, CheckIcon, XIcon } from 'lucide-react';

import { User, UpdateUserDto } from '@/shared/sdk/types';
import { Input } from '@/shared/ui/atoms/input';
import { Button } from '@/shared/ui/atoms/button';
import { cn } from '@/shared/utils/cn';
import { SocialKeys } from './lib';
import { socialsConfig } from './data';
import { Preloader } from '@/shared/ui/atoms/preloader';

type ChangeSocialsProps = {
  user: User | null;
  className?: string;
  isLoading?: boolean;
  readonly?: boolean;
  onChange: (
    changes: Partial<Pick<UpdateUserDto, SocialKeys>>
  ) => Promise<void> | void;
};

const ChangeSocials: FC<ChangeSocialsProps> = ({
  user,
  className,
  isLoading,
  readonly = false,
  onChange,
}) => {
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = useMemo<Record<SocialKeys, string>>(
    () => ({
      telegramUrl: user?.telegramUrl ?? '',
      discordUrl: user?.discordUrl ?? '',
      twitchUrl: user?.twitchUrl ?? '',
      youtubeUrl: user?.youtubeUrl ?? '',
    }),
    [user?.telegramUrl, user?.discordUrl, user?.twitchUrl, user?.youtubeUrl]
  );

  const [values, setValues] =
    useState<Record<SocialKeys, string>>(initialValues);

  // Sync local state when user data changes
  // (e.g. after successful update & refetch)
  if (
    values.telegramUrl !== initialValues.telegramUrl ||
    values.discordUrl !== initialValues.discordUrl ||
    values.twitchUrl !== initialValues.twitchUrl ||
    values.youtubeUrl !== initialValues.youtubeUrl
  ) {
    // Do not sync while editing; only sync when not in edit mode
    if (!isEdit && !isSubmitting) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      setValues(initialValues);
    }
  }

  if (!user) return null;

  const handleSave = async () => {
    const changes: Partial<Pick<UpdateUserDto, SocialKeys>> = {};

    (Object.keys(values) as SocialKeys[]).forEach((key) => {
      if (values[key] !== initialValues[key]) {
        changes[key] = values[key];
      }
    });

    if (Object.keys(changes).length === 0) {
      setIsEdit(false);
      return;
    }

    try {
      setIsSubmitting(true);
      await onChange(changes);
      setIsEdit(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setValues(initialValues);
    setIsEdit(false);
  };

  const hasAnySocial = Object.values(initialValues).some(Boolean);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex flex-wrap items-center gap-3'>
          {socialsConfig.map((social) => {
            const url = initialValues[social.key];

            if (!url && !isEdit) return null;

            if (!url && isEdit) {
              return (
                <div
                  key={social.key}
                  className='flex items-center gap-1 rounded-full border border-dashed border-white/10 px-3 py-1 text-xs text-zinc-400'>
                  <Image
                    src={social.icon}
                    alt={social.label}
                    width={18}
                    height={18}
                    className='opacity-70'
                  />
                  <span>{social.label}</span>
                </div>
              );
            }

            return (
              <a
                key={social.key}
                href={url}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-100 transition-colors hover:bg-white/10'>
                <Image
                  src={social.icon}
                  alt={social.label}
                  width={18}
                  height={18}
                />
                <span className='max-w-[140px] truncate'>{social.label}</span>
              </a>
            );
          })}

          {!hasAnySocial && !isEdit && (
            <span className='text-xs text-zinc-500'>
              Соціальні мережі ще не вказані
            </span>
          )}
        </div>

        {!isEdit && !readonly && (
          <Button
            type='button'
            size='icon'
            variant='ghost'
            className='size-7 rounded-full'
            onClick={() => setIsEdit(true)}>
            <PencilIcon className='size-4 text-zinc-300' />
          </Button>
        )}
      </div>

      {isEdit && (
        <Preloader isLoading={isLoading || isSubmitting}>
          <div className='mt-1 flex flex-col gap-5'>
            {socialsConfig.map((social) => (
              <div key={social.key} className='flex items-center gap-2'>
                <Image
                  src={social.icon}
                  alt={social.label}
                  width={20}
                  height={20}
                  className='shrink-0'
                />
                <Input
                  value={values[social.key]}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [social.key]: e.target.value,
                    }))
                  }
                  placeholder={social.placeholder}
                  label={social.label}
                  className='flex-1'
                  disabled={isSubmitting || isLoading}
                />
              </div>
            ))}

            <div className='mt-1 flex items-center justify-end gap-2'>
              <Button
                type='button'
                size='sm'
                variant='secondary'
                onClick={handleCancel}
                disabled={isSubmitting || isLoading}>
                Скасувати
              </Button>
              <Button
                type='button'
                size='sm'
                onClick={handleSave}
                disabled={isSubmitting || isLoading}>
                Зберегти
              </Button>
            </div>
          </div>
        </Preloader>
      )}
    </div>
  );
};

export { ChangeSocials };
