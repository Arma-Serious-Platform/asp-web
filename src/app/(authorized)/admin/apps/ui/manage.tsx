'use client';

import { CheckIcon, LoaderIcon, TriangleAlertIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { FC, useEffect, useId, useState } from 'react';

import { SSO_SCOPES } from '@/entities/sso/scopes';
import type { SsoAdminClient, SsoScope } from '@/shared/sdk/sso/sso.api';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { Textarea } from '@/shared/ui/atoms/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/organisms/dialog';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/organisms/drawer';
import { ManageAppState } from '../state/manage-app.state';

const SCOPE_OPTIONS: { scope: SsoScope; label: string }[] = [
  { scope: 'profile', label: SSO_SCOPES.profile.title },
  { scope: 'email', label: 'Email-адреса' },
  { scope: 'roles', label: SSO_SCOPES.roles.title },
  { scope: 'squad', label: SSO_SCOPES.squad.title },
  { scope: 'game', label: 'Steam ID і статус доступу до гри' },
  { scope: 'offline_access', label: 'Залишатися в системі (refresh-токен)' },
];

const toLines = (value: string) =>
  value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

type FormState = {
  name: string;
  redirectUris: string;
  postLogoutRedirectUris: string;
  backchannelLogoutUri: string;
  allowedScopes: SsoScope[];
  firstParty: boolean;
  confidential: boolean;
};

const emptyForm: FormState = {
  name: '',
  redirectUris: '',
  postLogoutRedirectUris: '',
  backchannelLogoutUri: '',
  allowedScopes: ['profile', 'roles'],
  firstParty: false,
  confidential: true,
};

const fromApp = (app: SsoAdminClient): FormState => ({
  name: app.name,
  redirectUris: app.redirectUris.join('\n'),
  postLogoutRedirectUris: app.postLogoutRedirectUris.join('\n'),
  backchannelLogoutUri: app.backchannelLogoutUri ?? '',
  allowedScopes: app.allowedScopes,
  firstParty: app.firstParty,
  confidential: app.confidential,
});

const Hint: FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mt-1.5 text-xs text-zinc-400">{children}</p>
);

const CheckboxRow: FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  hint?: string;
}> = ({ checked, onChange, title, hint }) => {
  const id = useId();

  return (
    <div className="flex items-start gap-2.5">
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 accent-lime-700"
        checked={checked}
        onChange={event => onChange(event.target.checked)}
      />
      <label htmlFor={id} className="text-sm text-zinc-100">
        {title}
        {hint && <span className="block text-xs text-zinc-400">{hint}</span>}
      </label>
    </div>
  );
};

const CopyField: FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-zinc-400">{label}</span>
      <div className="flex gap-2">
        <code
          className={`min-w-0 grow rounded-md border bg-black/70 px-2.5 py-2 text-[13px] break-all text-zinc-100 ${
            highlight ? 'border-lime-600' : 'border-neutral-700'
          }`}>
          {value}
        </code>
        <Button variant={highlight ? 'default' : 'secondary'} className="h-auto shrink-0" onClick={() => void copy()}>
          {copied ? <CheckIcon className="size-4" /> : 'Копіювати'}
        </Button>
      </div>
    </div>
  );
};

/** А2: create or edit an app. */
const AppFormDrawer: FC<{ state: ManageAppState; onSaved: () => void }> = observer(({ state, onSaved }) => {
  const app = state.modal.payload?.app;
  const isOpen = state.modal.isOpen && state.modal.payload?.mode === 'manage';
  const isEdit = Boolean(app);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (isOpen) setForm(app ? fromApp(app) : emptyForm);
  }, [isOpen, app]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleScope = (scope: SsoScope, checked: boolean) =>
    set('allowedScopes', checked ? [...form.allowedScopes, scope] : form.allowedScopes.filter(item => item !== scope));

  const canSubmit = form.name.trim().length > 0 && toLines(form.redirectUris).length > 0;

  const submit = async () => {
    const common = {
      name: form.name.trim(),
      redirectUris: toLines(form.redirectUris),
      postLogoutRedirectUris: toLines(form.postLogoutRedirectUris),
      allowedScopes: form.allowedScopes,
      firstParty: form.firstParty,
    };

    if (app) {
      await state.update(
        app.id,
        { ...common, backchannelLogoutUri: form.backchannelLogoutUri.trim() || null },
        onSaved,
      );
      return;
    }

    await state.create(
      {
        ...common,
        backchannelLogoutUri: form.backchannelLogoutUri.trim() || undefined,
        confidential: form.confidential,
      },
      onSaved,
    );
  };

  return (
    <Drawer open={isOpen} onOpenChange={open => !open && state.modal.close()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{isEdit ? `Редагувати «${app?.name}»` : 'Новий додаток'}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-5">
          <div>
            <Input label="Назва" value={form.name} onChange={event => set('name', event.target.value)} />
            <Hint>Бачать користувачі на екрані дозволу.</Hint>
          </div>

          <div>
            <Textarea
              label="Адреси повернення (redirect URI)"
              rows={2}
              className="font-mono text-[13px]"
              placeholder="https://app.example.com/callback"
              value={form.redirectUris}
              onChange={event => set('redirectUris', event.target.value)}
            />
            <Hint>По одній на рядок. Тільки https і точний збіг; http — лише для localhost.</Hint>
          </div>

          <Textarea
            label="Адреси після виходу"
            rows={1}
            className="font-mono text-[13px]"
            placeholder="https://app.example.com/"
            value={form.postLogoutRedirectUris}
            onChange={event => set('postLogoutRedirectUris', event.target.value)}
          />

          <div>
            <Input
              label="Back-channel logout URL"
              className="font-mono text-[13px]"
              placeholder="https://app.example.com/backchannel-logout"
              value={form.backchannelLogoutUri}
              onChange={event => set('backchannelLogoutUri', event.target.value)}
            />
            <Hint>Сюди VTG повідомляє, що користувача треба розлогінити: вихід, бан, відкликання доступу.</Hint>
          </div>

          <fieldset className="relative flex flex-col gap-2.5 rounded-md border border-neutral-700 px-3 pt-4 pb-3">
            <legend className="absolute top-0 left-2 -translate-y-1/2 rounded-md border border-white/10 bg-neutral-800 px-2 text-xs font-medium text-zinc-100">
              Доступи, які може запитати додаток
            </legend>
            {SCOPE_OPTIONS.map(({ scope, label }) => (
              <CheckboxRow
                key={scope}
                title={label}
                checked={form.allowedScopes.includes(scope)}
                onChange={checked => toggleScope(scope, checked)}
              />
            ))}
          </fieldset>

          <div className="flex flex-col gap-3">
            <CheckboxRow
              title="Офіційний додаток VTG"
              hint="Без екрана дозволу, вихід без підтвердження. Лише для наших власних сайтів."
              checked={form.firstParty}
              onChange={checked => set('firstParty', checked)}
            />
            {!isEdit && (
              <CheckboxRow
                title="Серверний додаток (із секретом)"
                hint="Вимкніть для браузерних і мобільних додатків — вони входять лише з PKCE."
                checked={form.confidential}
                onChange={checked => set('confidential', checked)}
              />
            )}
          </div>
        </DrawerBody>
        <DrawerFooter className="border-t border-white/10 pt-4">
          <Button variant="outline" onClick={() => state.modal.close()} disabled={state.loader.isLoading}>
            Скасувати
          </Button>
          <Button onClick={() => void submit()} disabled={state.loader.isLoading || !canSubmit}>
            {state.loader.isLoading && <LoaderIcon className="size-4 animate-spin" />}
            {isEdit ? 'Зберегти' : 'Створити'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
});

/** А3: the client ID and the secret, shown once. */
const IssuedDrawer: FC<{ state: ManageAppState }> = observer(({ state }) => {
  const issued = state.issued;
  const isOpen = state.modal.isOpen && state.modal.payload?.mode === 'issued';

  return (
    <Drawer open={isOpen} onOpenChange={open => !open && state.modal.close()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            Додаток «{issued?.name}» {issued?.clientSecret ? 'готовий' : 'створено'}
          </DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-4.5">
          {issued?.clientSecret && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-lg border border-amber-500/55 bg-amber-600/14 p-3">
              <TriangleAlertIcon aria-hidden className="mt-px size-5 shrink-0 text-amber-400" />
              <p className="text-[13px] leading-snug text-amber-200">
                Секрет показується лише зараз. Скопіюйте його й передайте розробникам додатка захищеним каналом. Пізніше
                можна лише згенерувати новий.
              </p>
            </div>
          )}

          {issued && <CopyField label="Client ID" value={issued.clientId} />}
          {issued?.clientSecret && <CopyField label="Client secret" value={issued.clientSecret} highlight />}
          {issued?.discoveryUrl && (
            <CopyField
              label="Discovery URL — усе інше бібліотека розробника візьме звідси"
              value={issued.discoveryUrl}
            />
          )}

          <div className="rounded-lg border border-white/8 bg-white/4 p-3 text-[13px] leading-normal text-zinc-400">
            <b className="text-zinc-200">Нагадайте розробникам:</b> вхід з PKCE; користувача впізнавати лише за{' '}
            <code className="text-zinc-200">sub</code>; ролі й нікнейм брати з userinfo; обробляти back-channel logout.
          </div>
        </DrawerBody>
        <DrawerFooter className="justify-end border-t border-white/10 pt-4">
          <Button onClick={() => state.modal.close()}>
            {issued?.clientSecret ? 'Готово, секрет збережено' : 'Готово'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
});

const ConfirmDialog: FC<{
  state: ManageAppState;
  mode: 'rotate' | 'toggle' | 'delete';
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: (app: SsoAdminClient) => void;
}> = observer(({ state, mode, title, description, confirmLabel, destructive, onConfirm }) => {
  const app = state.modal.payload?.app;

  return (
    <Dialog
      open={state.modal.isOpen && state.modal.payload?.mode === mode}
      onOpenChange={open => !open && state.modal.close()}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => state.modal.close()}>
            Скасувати
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            disabled={state.loader.isLoading}
            onClick={() => app && onConfirm(app)}>
            {state.loader.isLoading && <LoaderIcon className="size-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export const ManageAppModals: FC<{ state: ManageAppState; onChange: () => void }> = observer(({ state, onChange }) => {
  const app = state.modal.payload?.app;

  useEffect(() => {
    if (!state.modal.isOpen) state.clearIssued();
  }, [state, state.modal.isOpen]);

  return (
    <>
      <AppFormDrawer state={state} onSaved={onChange} />
      <IssuedDrawer state={state} />

      <ConfirmDialog
        state={state}
        mode="rotate"
        title="Згенерувати новий секрет?"
        description={`Старий секрет «${app?.name}» перестане працювати одразу: додаток не зможе впускати людей, доки розробники не підставлять новий.`}
        confirmLabel="Згенерувати"
        onConfirm={target => void state.rotateSecret(target.id, onChange)}
      />

      <ConfirmDialog
        state={state}
        mode="toggle"
        title={app?.disabled ? `Увімкнути «${app?.name}»?` : `Вимкнути «${app?.name}»?`}
        description={
          app?.disabled
            ? 'Користувачі знову зможуть входити в цей додаток через VTG.'
            : 'Усіх користувачів одразу буде розлогінено з цього додатка, а нові входи через VTG припиняться, доки його не увімкнуть.'
        }
        confirmLabel={app?.disabled ? 'Увімкнути' : 'Вимкнути'}
        destructive={!app?.disabled}
        onConfirm={target => void state.toggleDisabled(target, onChange)}
      />

      <ConfirmDialog
        state={state}
        mode="delete"
        title={`Видалити «${app?.name}»?`}
        description="Усіх користувачів буде розлогінено, збережені дозволи зникнуть, а client ID перестане існувати. Це не можна скасувати."
        confirmLabel="Видалити"
        destructive
        onConfirm={target => void state.delete(target.id, onChange)}
      />
    </>
  );
});
