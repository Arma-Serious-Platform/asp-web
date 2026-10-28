'use client';

import dayjs from 'dayjs';
import {
  CircleUserIcon,
  FingerprintIcon,
  GamepadIcon,
  HistoryIcon,
  LoaderIcon,
  MailIcon,
  ShieldIcon,
  TriangleAlertIcon,
  UsersIcon,
} from 'lucide-react';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { FC } from 'react';

import { SSO_SCOPES, sortScopes } from '@/entities/sso/scopes';
import type { SsoInteraction, SsoScope } from '@/shared/sdk/sso/sso.api';
import { OauthState } from '../state/oauth.state';
import { AppAndVtgTiles, OauthButton, OauthCard } from './oauth-shell';

const SCOPE_ICONS: Record<SsoScope, typeof ShieldIcon> = {
  profile: CircleUserIcon,
  email: MailIcon,
  roles: ShieldIcon,
  squad: UsersIcon,
  game: GamepadIcon,
  offline_access: HistoryIcon,
};

const initials = (nickname: string) =>
  nickname
    .replace(/[^\p{L}\p{N}]/gu, '')
    .slice(0, 2)
    .toUpperCase() || '?';

const AccountRow: FC<{ user: NonNullable<SsoInteraction['user']>; onSwitch: () => void; disabled: boolean }> = ({
  user,
  onSwitch,
  disabled,
}) => (
  <div className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/4 px-3 py-2.5">
    {user.avatarUrl ? (
      <Image
        src={user.avatarUrl}
        alt=""
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-full object-cover"
      />
    ) : (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-lime-800 text-[15px] font-bold">
        {initials(user.nickname)}
      </div>
    )}
    <div className="flex min-w-0 grow flex-col">
      <span className="truncate text-[15px] font-semibold">{user.nickname}</span>
      <span className="truncate text-[13px] text-zinc-400">{user.email}</span>
    </div>
    <button
      type="button"
      disabled={disabled}
      onClick={onSwitch}
      className="cursor-pointer py-3 text-sm text-lime-400 hover:text-lime-300 disabled:opacity-50">
      Змінити акаунт
    </button>
  </div>
);

/** Screens 3 and 4: a third-party app asks for access. */
export const OauthConsent: FC<{ model: OauthState; interaction: SsoInteraction }> = observer(
  ({ model, interaction }) => {
    const { client, user } = interaction;
    const scopes = sortScopes(interaction.scopes);
    const isTemporarilyBanned = user?.accountState === 'temporarily_banned';

    return (
      <OauthCard wide className="gap-4.5">
        <AppAndVtgTiles client={client} />

        <div className="flex flex-col gap-1.5 text-center">
          <h1 className="text-2xl leading-tight font-bold">{client.name} запитує доступ до вашого акаунта VTG</h1>
          <p className="text-sm text-zinc-400">
            {client.domain && <>{client.domain} · </>}
            {client.firstParty ? 'додаток VTG' : 'сторонній додаток'}
          </p>
        </div>

        {isTemporarilyBanned && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-lg border border-amber-500/55 bg-amber-600/14 p-3.5">
            <TriangleAlertIcon aria-hidden className="mt-px size-5.5 shrink-0 text-amber-400" />
            <div className="flex flex-col gap-1">
              <span className="text-[15px] font-semibold text-amber-200">
                Ви тимчасово заблоковані до {dayjs(user.bannedUntil).format('DD.MM.YYYY, HH:mm')}
              </span>
              <span className="text-sm leading-snug text-stone-200">
                Доступ до ігрового сервера закрито. {client.name} побачить статус блокування і може обмежити частину
                функцій. Після завершення бану доступ відновиться автоматично.
              </span>
            </div>
          </div>
        )}

        {user && <AccountRow user={user} disabled={model.isSubmitting} onSwitch={model.switchAccount} />}

        <div className="flex flex-col gap-1">
          <span className="mb-1 text-[13px] font-semibold tracking-[0.06em] text-zinc-400 uppercase">
            Додаток отримає
          </span>
          <ul className="flex flex-col gap-1">
            {/* Even with no other scope, the app learns which VTG account this is. */}
            {scopes.length === 0 && (
              <li className="flex min-h-10 items-center gap-3">
                <FingerprintIcon aria-hidden className="size-5 shrink-0 text-lime-400" />
                <span className="text-[15px]">Ідентифікатор вашого акаунта VTG</span>
              </li>
            )}
            {scopes.map(scope => {
              const Icon = SCOPE_ICONS[scope];
              const { title, hint } = SSO_SCOPES[scope];

              return (
                <li key={scope} className="flex min-h-10 items-center gap-3">
                  <Icon aria-hidden className="size-5 shrink-0 text-lime-400" />
                  <span className="text-[15px]">
                    {title}
                    {hint && <span className="text-zinc-400"> — {hint}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="text-[13px] leading-snug text-zinc-400">
          {client.name} не отримає ваш пароль і не зможе нічого змінювати на VTG від вашого імені.
          {!client.firstParty && client.domain && <> Переконайтеся, що довіряєте {client.domain}.</>}
        </p>

        <div className="flex flex-wrap gap-3">
          <OauthButton
            variant="secondary"
            className="flex-[1_1_140px]"
            disabled={model.isSubmitting}
            onClick={() => void model.abort()}>
            Скасувати
          </OauthButton>
          <OauthButton className="flex-[1_1_140px]" disabled={model.isSubmitting} onClick={() => void model.confirm()}>
            {model.isSubmitting ? <LoaderIcon className="size-4 animate-spin" /> : 'Дозволити'}
          </OauthButton>
        </div>

        <p className="text-center text-[13px] text-zinc-400">
          Відкликати доступ можна будь-коли: Профіль → Підключені додатки
        </p>
      </OauthCard>
    );
  },
);
