import { Button } from '@/shared/ui/atoms/button';
import { Textarea } from '@/shared/ui/atoms/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/organisms/dialog';
import { UserPunishment, UserPunishmentType, UserWarning } from '@/shared/sdk/types';
import dayjs from 'dayjs';
import { LoaderIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { PunishmentHistoryModel, punishmentHistoryModel } from './model';

const punishmentTypeLabels: Record<UserPunishmentType, string> = {
  [UserPunishmentType.WARNING]: 'Попередження',
  [UserPunishmentType.WARNING_REMOVED]: 'Попередження знято',
  [UserPunishmentType.TEMP_BAN]: 'Тимчасовий бан',
  [UserPunishmentType.PERMANENT_BAN]: 'Перманентний бан',
  [UserPunishmentType.UNBAN]: 'Розбан',
};

const formatDate = (date?: string | null) => (date ? dayjs(date).format('DD.MM.YYYY HH:mm') : 'Назавжди');

const PunishmentHistoryItem: FC<{ item: UserPunishment }> = ({ item }) => (
  <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="font-medium text-zinc-100">{punishmentTypeLabels[item.type]}</span>
      <span className="text-xs text-zinc-400">{formatDate(item.createdAt)}</span>
    </div>
    <div className="mt-1 text-xs text-zinc-400">
      Адмін: <span className="text-zinc-200">{item.admin?.nickname ?? 'Невідомо'}</span>
      {item.bannedUntil && <> · до {formatDate(item.bannedUntil)}</>}
    </div>
    {item.reason && <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{item.reason}</div>}
  </div>
);

const ActiveWarningItem: FC<{
  warning: UserWarning;
  disabled: boolean;
  onRemove: (warningId: string, reason: string) => void;
}> = ({ warning, disabled, onRemove }) => {
  const [removeReason, setRemoveReason] = useState('');

  return (
    <div className="rounded-md border border-amber-400/20 bg-amber-400/[0.04] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-amber-100">Активне попередження</span>
        <span className="text-xs text-zinc-400">{formatDate(warning.createdAt)}</span>
      </div>
      <div className="mt-1 text-xs text-zinc-400">
        Видав: <span className="text-zinc-200">{warning.admin?.nickname ?? 'Невідомо'}</span>
      </div>
      <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{warning.reason}</div>
      <div className="mt-3 flex flex-col gap-2">
        <Textarea
          label="Причина зняття"
          value={removeReason}
          disabled={disabled}
          onChange={event => setRemoveReason(event.target.value)}
          placeholder="Можна залишити порожнім"
        />
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => onRemove(warning.id, removeReason.trim())}>
          Зняти попередження
        </Button>
      </div>
    </div>
  );
};

const PunishmentHistoryModal: FC<
  PropsWithChildren<{
    model?: PunishmentHistoryModel;
    onWarningRemoved?: (warning: UserWarning) => void;
  }>
> = observer(({ model = punishmentHistoryModel, children, onWarningRemoved }) => {
  const user = model.visibility.payload?.user;

  useEffect(() => {
    if (model.visibility.isOpen) {
      model.load();
    }
  }, [model, model.visibility.isOpen]);

  return (
    <Dialog open={model.visibility.isOpen} onOpenChange={model.visibility.switch}>
      <DialogOverlay />
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Історія покарань <span className="text-primary">{user?.nickname}</span>
          </DialogTitle>
        </DialogHeader>

        {model.loader.isLoading ? (
          <div className="flex min-h-40 items-center justify-center">
            <LoaderIcon className="size-5 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Активні попередження</h3>
              {model.warnings.length ? (
                model.warnings.map(warning => (
                  <ActiveWarningItem
                    key={warning.id}
                    warning={warning}
                    disabled={model.removeLoader.isLoading}
                    onRemove={(warningId, reason) => model.removeWarning(warningId, reason, onWarningRemoved)}
                  />
                ))
              ) : (
                <div className="rounded-md border border-white/10 p-3 text-sm text-zinc-400">
                  Активних попереджень немає
                </div>
              )}
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Уся історія</h3>
              {model.history.length ? (
                model.history.map(item => <PunishmentHistoryItem key={item.id} item={item} />)
              ) : (
                <div className="rounded-md border border-white/10 p-3 text-sm text-zinc-400">
                  Історія покарань порожня
                </div>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

export { PunishmentHistoryModal };
