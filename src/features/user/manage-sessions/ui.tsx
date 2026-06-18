'use client';

import dayjs from 'dayjs';
import { LoaderIcon, LogOutIcon, MonitorSmartphoneIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';
import toast from 'react-hot-toast';

import { UserSession } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { manageSessionsModel, ManageSessionsModel } from './model';

const formatDate = (value?: string | null) => (value ? dayjs(value).format('DD.MM.YYYY HH:mm') : '—');

const getSessionLabel = (session: UserSession) => {
  const device = session.device?.trim();
  if (device) return device;

  const userAgent = session.userAgent?.trim();
  if (userAgent) return userAgent;

  return 'Невідомий пристрій';
};

const UserSessionItem: FC<{
  session: UserSession;
  isRevoking: boolean;
  onRevoke: (sessionId: string) => void;
}> = ({ session, isRevoking, onRevoke }) => {
  const isCurrent = Boolean(session.isCurrent);
  const meta = [session.ip && `IP ${session.ip}`, `Активність ${formatDate(session.lastActiveAt ?? session.createdAt)}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2 rounded-md border border-white/10 bg-white/[0.03] p-2.5">
      <div className="min-w-0">
        <div className="flex min-w-0 items-start gap-2">
          <MonitorSmartphoneIcon className="mt-0.5 size-3.5 shrink-0 text-zinc-400" />
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <span className="line-clamp-2 break-words text-sm font-medium text-zinc-100">
                {getSessionLabel(session)}
              </span>
              {isCurrent && (
                <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                  Поточна
                </span>
              )}
            </div>
            {meta && <p className="mt-1 line-clamp-2 break-all text-[11px] text-zinc-500">{meta}</p>}
          </div>
        </div>
      </div>

      {!isCurrent && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 shrink-0 px-2 text-red-300 hover:bg-red-500/10 hover:text-red-200"
          disabled={isRevoking}
          aria-label="Завершити сесію"
          onClick={() => onRevoke(session.id)}>
          {isRevoking ? <LoaderIcon className="size-4 animate-spin" /> : <LogOutIcon className="size-4" />}
        </Button>
      )}
    </div>
  );
};

const ManageSessions: FC<{
  model?: ManageSessionsModel;
}> = observer(({ model = manageSessionsModel }) => {
  useEffect(() => {
    void model.load();
  }, [model]);

  const handleRevoke = async (sessionId: string) => {
    try {
      await model.revoke(sessionId);
      toast.success('Сесію завершено');
    } catch {
      toast.error('Не вдалося завершити сесію');
    }
  };

  if (model.loader.isLoading) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-zinc-400">
        <LoaderIcon className="size-4 animate-spin" />
        Завантаження сесій...
      </div>
    );
  }

  if (model.sessions.length === 0) {
    return <p className="text-sm text-zinc-400">Активних сесій не знайдено</p>;
  }

  return (
    <div className="flex max-h-72 min-w-0 flex-col gap-1.5 overflow-y-auto pr-1">
      {model.sessions.map(session => (
        <UserSessionItem
          key={session.id}
          session={session}
          isRevoking={model.revokingSessionId === session.id}
          onRevoke={handleRevoke}
        />
      ))}
    </div>
  );
});

export { ManageSessions };
