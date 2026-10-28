import { BanIcon, LoaderIcon, TriangleAlertIcon } from 'lucide-react';
import { FC } from 'react';

import { ROUTES } from '@/shared/config/routes';
import { OauthButton, OauthCard } from './oauth-shell';

export const OauthLoading: FC<{ label: string }> = ({ label }) => (
  <OauthCard className="items-center py-10 text-center">
    <LoaderIcon aria-hidden className="size-6 animate-spin text-lime-400" />
    <p className="text-[15px] text-zinc-300">{label}</p>
  </OauthCard>
);

/** Screen 5: a permanently banned account counts as deleted. */
export const OauthBlocked: FC<{ appName?: string; disabled: boolean; onReturn: () => void }> = ({
  appName,
  disabled,
  onReturn,
}) => (
  <OauthCard className="items-center text-center">
    <div className="flex size-14 items-center justify-center rounded-full border border-red-400/60 bg-red-600/16">
      <BanIcon aria-hidden className="size-6.5 text-red-300" />
    </div>
    <h1 className="text-[26px] font-bold">Вхід неможливий</h1>
    <p className="text-[15px] leading-normal text-zinc-300">
      Цей акаунт заблоковано назавжди і він вважається видаленим. Вхід на VTG і в підключені додатки недоступний.
    </p>
    {appName && <p className="text-sm text-zinc-400">{appName} не отримає жодних даних про акаунт.</p>}
    {appName && (
      <OauthButton variant="secondary" className="w-full" disabled={disabled} onClick={onReturn}>
        Повернутися до {appName}
      </OauthButton>
    )}
  </OauthCard>
);

/** Screen 6: the login request is unknown or has expired. */
export const OauthError: FC<{ code: string }> = ({ code }) => (
  <OauthCard className="items-center text-center">
    <div className="flex size-14 items-center justify-center rounded-full border border-amber-500/55 bg-amber-600/14">
      <TriangleAlertIcon aria-hidden className="size-6.5 text-amber-400" />
    </div>
    <h1 className="text-[26px] font-bold">Не вдалося обробити запит на вхід</h1>
    <p className="text-[15px] leading-normal text-zinc-300">
      Посилання для входу недійсне або застаріло. Поверніться на сайт, з якого прийшли, і спробуйте ще раз.
    </p>
    <p className="text-sm text-zinc-400">Якщо помилка повторюється, повідомте адміністрацію цього сайту.</p>
    <div className="w-full rounded-md border border-white/8 bg-black/50 px-3 py-2.5 text-left font-mono text-[13px] text-zinc-400">
      Код помилки: {code}
    </div>
    <a
      href={ROUTES.home}
      className="inline-flex h-11 w-full items-center justify-center rounded-md border border-lime-600 bg-lime-700 text-base font-semibold text-white hover:bg-lime-600 hover:text-white">
      На головну VTG
    </a>
  </OauthCard>
);
