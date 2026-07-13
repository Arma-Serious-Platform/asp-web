'use client';

import { observer } from 'mobx-react-lite';
import { FC, useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { LoaderIcon, CopyIcon, ShieldCheckIcon } from 'lucide-react';

import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/organisms/dialog';
import { manageTwoFactorModel, ManageTwoFactorModel } from './model';
import { getDisableTwoFactorFieldErrors } from '@/shared/lib/two-factor-payload';

const ManageTwoFactor: FC<{
  model?: ManageTwoFactorModel;
  onStatusChange?: (enabled: boolean) => void;
}> = observer(({ model = manageTwoFactorModel, onStatusChange }) => {
  const [enableCode, setEnableCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [disableRecoveryCode, setDisableRecoveryCode] = useState('');
  const [useRecoveryForDisable, setUseRecoveryForDisable] = useState(false);
  const [isRecoveryDialogOpen, setIsRecoveryDialogOpen] = useState(false);
  const [disablePasswordError, setDisablePasswordError] = useState<string | undefined>();
  const [disableCodeError, setDisableCodeError] = useState<string | undefined>();

  useEffect(() => {
    void model.load();
  }, [model]);

  useEffect(() => {
    if (model.recoveryCodes.length > 0) {
      setIsRecoveryDialogOpen(true);
    }
  }, [model.recoveryCodes]);

  const handleStartSetup = async () => {
    try {
      await model.startSetup();
    } catch {
      toast.error('Не вдалося розпочати налаштування 2FA');
    }
  };

  const handleEnable = async () => {
    try {
      await model.enable(enableCode.trim());
      setEnableCode('');
      onStatusChange?.(true);
      toast.success('Двофакторну автентифікацію увімкнено');
    } catch {
      toast.error('Невірний код. Перевірте застосунок і спробуйте ще раз.');
    }
  };

  const handleDisable = async () => {
    const password = disablePassword.trim();
    const code = useRecoveryForDisable ? undefined : disableCode.trim();
    const recoveryCode = useRecoveryForDisable ? disableRecoveryCode.trim() : undefined;

    if (!password) {
      toast.error('Введіть пароль');
      return;
    }

    if (!recoveryCode && (!code || code.length !== 6)) {
      toast.error(useRecoveryForDisable ? 'Введіть код відновлення' : 'Введіть 6-значний код з застосунку');
      return;
    }

    try {
      setDisablePasswordError(undefined);
      setDisableCodeError(undefined);

      await model.disable({
        password,
        code,
        recoveryCode,
      });
      setDisablePassword('');
      setDisableCode('');
      setDisableRecoveryCode('');
      setUseRecoveryForDisable(false);
      onStatusChange?.(false);
      toast.success('Двофакторну автентифікацію вимкнено');
    } catch (error) {
      const fieldErrors = getDisableTwoFactorFieldErrors(error);

      if (fieldErrors.password) {
        setDisablePasswordError(fieldErrors.password);
        toast.error(fieldErrors.password);
        return;
      }

      if (fieldErrors.code) {
        setDisableCodeError(fieldErrors.code);
        toast.error(fieldErrors.code);
        return;
      }

      toast.error('Не вдалося вимкнути 2FA. Перевірте пароль і код.');
    }
  };

  const handleCopyAllRecoveryCodes = async () => {
    if (model.recoveryCodes.length === 0) {
      return;
    }

    try {
      await navigator.clipboard.writeText(model.recoveryCodes.join('\n'));
      toast.success('Усі коди скопійовано');
    } catch {
      toast.error('Не вдалося скопіювати коди');
    }
  };

  const canDisable =
    disablePassword.trim().length > 0 &&
    (useRecoveryForDisable ? disableRecoveryCode.trim().length > 0 : disableCode.length === 6);

  if (model.loader.isLoading) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-zinc-400">
        <LoaderIcon className="size-4 animate-spin" />
        Завантаження...
      </div>
    );
  }

  return (
    <>
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <ShieldCheckIcon className="size-4 text-primary" />
          <span className="text-sm text-zinc-300">
            {model.enabled
              ? 'Двофакторна автентифікація увімкнена'
              : 'Двофакторна автентифікація вимкнена'}
          </span>
          {model.enabled && (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
              Увімкнено
            </span>
          )}
        </div>

        {!model.enabled && !model.setupData && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-zinc-400">
              Підключіть Google Authenticator, Authy або інший TOTP-застосунок для додаткового захисту
              аккаунту.
            </p>
            <Button type="button" onClick={handleStartSetup} disabled={model.actionLoader.isLoading}>
              {model.actionLoader.isLoading ? <LoaderIcon className="size-4 animate-spin" /> : 'Увімкнути 2FA'}
            </Button>
          </div>
        )}

        {!model.enabled && model.setupData && (
          <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm text-zinc-300">
              1. Відскануйте QR-код у Google Authenticator або Authy.
              <br />
              2. Введіть 6-значний код для підтвердження.
            </p>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Image
                src={model.setupData.qrCodeDataUrl}
                alt="QR code for 2FA setup"
                width={180}
                height={180}
                className="rounded-md border border-white/10 bg-white p-2"
              />

              <div className="min-w-0 text-sm text-zinc-400">
                <p className="mb-1">Або введіть секрет вручну:</p>
                <code className="break-all rounded bg-black/40 px-2 py-1 text-xs text-zinc-200">
                  {model.setupData.secret}
                </code>
              </div>
            </div>

            <Input
              label="Код з застосунку"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={enableCode}
              onChange={event => setEnableCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
            />

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleEnable}
                disabled={model.actionLoader.isLoading || enableCode.length !== 6}>
                {model.actionLoader.isLoading ? <LoaderIcon className="size-4 animate-spin" /> : 'Підтвердити'}
              </Button>
              <Button type="button" variant="outline" onClick={() => model.cancelSetup()}>
                Скасувати
              </Button>
            </div>
          </div>
        )}

        {model.enabled && (
          <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm text-zinc-400">
              Для вимкнення 2FA введіть пароль і поточний код з застосунку або код відновлення.
            </p>

            <Input
              label="Пароль"
              type="password"
              value={disablePassword}
              error={disablePasswordError}
              onChange={event => {
                setDisablePassword(event.target.value);
                setDisablePasswordError(undefined);
              }}
            />

            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={useRecoveryForDisable}
                onChange={event => {
                  const checked = event.target.checked;
                  setUseRecoveryForDisable(checked);
                  if (checked) {
                    setDisableCode('');
                  } else {
                    setDisableRecoveryCode('');
                  }
                  setDisableCodeError(undefined);
                }}
              />
              Використати код відновлення
            </label>

            {useRecoveryForDisable ? (
              <Input
                label="Код відновлення"
                value={disableRecoveryCode}
                error={disableCodeError}
                onChange={event => {
                  setDisableRecoveryCode(event.target.value.toUpperCase());
                  setDisableCodeError(undefined);
                }}
                placeholder="A1B2-C3D4"
              />
            ) : (
              <Input
                label="Код з застосунку"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={disableCode}
                error={disableCodeError}
                onChange={event => {
                  setDisableCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                  setDisableCodeError(undefined);
                }}
                placeholder="123456"
              />
            )}

            <Button
              type="button"
              variant="ghost"
              className="self-start text-red-300 hover:bg-red-500/10 hover:text-red-200"
              onClick={handleDisable}
              disabled={model.actionLoader.isLoading || !canDisable}>
              {model.actionLoader.isLoading ? <LoaderIcon className="size-4 animate-spin" /> : 'Вимкнути 2FA'}
            </Button>
          </div>
        )}
      </div>

      <Dialog
        open={isRecoveryDialogOpen}
        onOpenChange={open => {
          setIsRecoveryDialogOpen(open);
          if (!open) {
            model.clearRecoveryCodes();
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Коди відновлення</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-zinc-400">
            Збережіть ці коди в безпечному місці. Кожен код можна використати лише один раз, якщо ви втратите
            доступ до застосунку автентифікації.
          </p>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                {model.recoveryCodes.length} кодів
              </span>
              <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={handleCopyAllRecoveryCodes}>
                <CopyIcon className="size-3.5" />
                Копіювати всі
              </Button>
            </div>

            <ul className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
              {model.recoveryCodes.map((code, index) => (
                <li
                  key={code}
                  className="rounded-md border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-zinc-100">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    #{index + 1}
                  </span>
                  <span className="mt-0.5 block tracking-wide">{code}</span>
                </li>
              ))}
            </ul>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setIsRecoveryDialogOpen(false);
                model.clearRecoveryCodes();
              }}>
              Я зберіг коди
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

export { ManageTwoFactor };
