'use client';

import dayjs from 'dayjs';
import { LoaderIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';
import toast from 'react-hot-toast';

import { SSO_SCOPES, sortScopes } from '@/entities/sso/scopes';
import { AppTile } from '@/entities/sso/ui/app-tile';
import type { ConnectedApp } from '@/shared/sdk/sso/sso.api';
import { Button } from '@/shared/ui/atoms/button';
import { connectedAppsState, ConnectedAppsState } from '../state/connected-apps.state';

const formatDate = (value: string) => dayjs(value).format('DD.MM.YYYY HH:mm');

const ConnectedAppItem: FC<{
  app: ConnectedApp;
  isRevoking: boolean;
  onRevoke: (app: ConnectedApp) => void;
}> = ({ app, isRevoking, onRevoke }) => {
  const meta = [app.domain, `останній вхід ${formatDate(app.lastUsedAt)}`, `дозволено ${formatDate(app.grantedAt)}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3">
      <AppTile name={app.name} vtg={app.firstParty} size="md" />

      <div className="flex min-w-0 flex-[999_1_240px] flex-col gap-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="truncate text-sm font-medium text-zinc-100">{app.name}</span>
          {app.firstParty ? (
            <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-primary uppercase">
              Офіційний
            </span>
          ) : (
            <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-zinc-300 uppercase">
              Сторонній
            </span>
          )}
        </div>
        <p className="break-all text-[11px] text-zinc-400">{meta}</p>
        {app.scopes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sortScopes(app.scopes).map(scope => (
              <span key={scope} className="rounded bg-white/6 px-1.5 py-0.5 text-[11px] text-zinc-300">
                {SSO_SCOPES[scope].short}
              </span>
            ))}
          </div>
        )}
      </div>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="shrink-0 text-red-300 hover:bg-red-500/10 hover:text-red-200"
        disabled={isRevoking}
        onClick={() => onRevoke(app)}>
        {isRevoking ? <LoaderIcon className="size-4 animate-spin" /> : 'Відкликати доступ'}
      </Button>
    </div>
  );
};

/** Apps the user signed in to through VTG. */
const ConnectedApps: FC<{
  model?: ConnectedAppsState;
}> = observer(({ model = connectedAppsState }) => {
  useEffect(() => {
    void model.load();
  }, [model]);

  const handleRevoke = async (app: ConnectedApp) => {
    try {
      await model.revoke(app.clientId);
      toast.success(`Доступ для ${app.name} відкликано`);
    } catch {
      toast.error('Не вдалося відкликати доступ');
    }
  };

  if (model.loader.isLoading) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-zinc-400">
        <LoaderIcon className="size-4 animate-spin" />
        Завантаження додатків...
      </div>
    );
  }

  if (model.apps.length === 0) {
    return <p className="text-sm text-zinc-400">Ви ще не входили в жоден додаток через VTG</p>;
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {model.apps.map(app => (
        <ConnectedAppItem
          key={app.clientId}
          app={app}
          isRevoking={model.revokingClientId === app.clientId}
          onRevoke={handleRevoke}
        />
      ))}
    </div>
  );
});

export { ConnectedApps };
