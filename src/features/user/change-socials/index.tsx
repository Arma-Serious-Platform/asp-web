'use client';

import { FC, useMemo, useState } from 'react';
import Image from 'next/image';
import { PencilIcon } from 'lucide-react';

import { Input } from '@/shared/ui/atoms/input';
import { Button } from '@/shared/ui/atoms/button';
import { cn } from '@/shared/utils/cn';
import { buildSocialUrl, getSocialProfileValue, SocialKeys, validateSocialProfileValue } from './lib';
import { socialsConfig } from './data';
import { Preloader } from '@/shared/ui/atoms/preloader';

type SocialValues = Partial<Record<SocialKeys, string | null>>;

type ChangeSocialsProps = {
  socials?: SocialValues | null;
  user?: SocialValues | null;
  className?: string;
  isLoading?: boolean;
  readonly?: boolean;
  onChange: (changes: Partial<Record<SocialKeys, string>>) => Promise<void> | void;
};

const ChangeSocials: FC<ChangeSocialsProps> = ({ socials, user, className, isLoading, readonly = false, onChange }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const socialValues = socials ?? user ?? null;

  const initialValues = useMemo<Record<SocialKeys, string>>(
    () => ({
      telegramUrl: getSocialProfileValue('telegramUrl', socialValues?.telegramUrl),
      discordUrl: getSocialProfileValue('discordUrl', socialValues?.discordUrl),
      twitchUrl: getSocialProfileValue('twitchUrl', socialValues?.twitchUrl),
      youtubeUrl: getSocialProfileValue('youtubeUrl', socialValues?.youtubeUrl),
      tiktokUrl: getSocialProfileValue('tiktokUrl', socialValues?.tiktokUrl),
    }),
    [
      socialValues?.telegramUrl,
      socialValues?.discordUrl,
      socialValues?.twitchUrl,
      socialValues?.youtubeUrl,
      socialValues?.tiktokUrl,
    ],
  );

  const [values, setValues] = useState<Record<SocialKeys, string>>(initialValues);

  const fieldErrors = useMemo(() => {
    const out: Partial<Record<SocialKeys, string>> = {};
    (Object.keys(values) as SocialKeys[]).forEach(key => {
      const msg = validateSocialProfileValue(key, values[key]);
      if (msg) out[key] = msg;
    });
    return out;
  }, [values]);

  const hasValidationErrors = Object.keys(fieldErrors).length > 0;

  // Sync local state when user data changes
  // (e.g. after successful update & refetch)
  if (socialsConfig.some(social => values[social.key] !== initialValues[social.key])) {
    // Do not sync while editing; only sync when not in edit mode
    if (!isEdit && !isSubmitting) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      setValues(initialValues);
    }
  }

  if (!socialValues) return null;

  const handleSave = async () => {
    if (hasValidationErrors) {
      return;
    }

    const changes: Partial<Record<SocialKeys, string>> = {};

    (Object.keys(values) as SocialKeys[]).forEach(key => {
      const trimmed = values[key].trim();
      if (trimmed !== (initialValues[key] ?? '').trim()) {
        changes[key] = buildSocialUrl(key, trimmed);
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

  const hasAnySocial = socialsConfig.some(social => Boolean(socialValues[social.key]));

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          {socialsConfig.map(social => {
            const url = socialValues[social.key];

            if (!url && !isEdit) return null;

            if (!url && isEdit) {
              return (
                <div
                  key={social.key}
                  className="flex items-center gap-1 rounded-full border border-dashed border-white/10 px-3 py-1 text-xs text-zinc-400">
                  <Image src={social.icon} alt={social.label} width={18} height={18} className="opacity-70" />
                  <span>{social.label}</span>
                </div>
              );
            }

            return (
              <a
                key={social.key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-100 transition-colors hover:bg-white/10">
                <Image src={social.icon} alt={social.label} width={18} height={18} />
                <span className="max-w-[140px] truncate">{social.label}</span>
              </a>
            );
          })}

          {!hasAnySocial && !isEdit && <span className="text-xs text-zinc-500">Соціальні мережі ще не вказані</span>}
        </div>

        {!isEdit && !readonly && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-7 rounded-full"
            onClick={() => setIsEdit(true)}>
            <PencilIcon className="size-4 text-zinc-300" />
          </Button>
        )}
      </div>

      {isEdit && (
        <Preloader isLoading={isLoading || isSubmitting}>
          <div className="mt-1 flex flex-col gap-5">
            {socialsConfig.map(social => (
              <div key={social.key} className="flex items-center gap-2">
                <Image src={social.icon} alt={social.label} width={20} height={20} className="shrink-0" />
                <Input
                  value={values[social.key]}
                  onChange={e =>
                    setValues(prev => ({
                      ...prev,
                      [social.key]: e.target.value,
                    }))
                  }
                  placeholder={social.placeholder}
                  label={social.label}
                  className="flex-1"
                  disabled={isSubmitting || isLoading}
                  error={fieldErrors[social.key]}
                />
              </div>
            ))}

            <div className="mt-1 flex items-center justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleCancel}
                disabled={isSubmitting || isLoading}>
                Скасувати
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSubmitting || isLoading || hasValidationErrors}>
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
