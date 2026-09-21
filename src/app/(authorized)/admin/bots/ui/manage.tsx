'use client';

import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { LoaderIcon } from 'lucide-react';

import { ManageBotNotificationState } from '../state/manage-bots.state';
import { BotNotification, BotNotificationType } from '@/shared/sdk/bot-notifications/bot-notifications.schemas';
import { State } from '@/shared/sdk/api-model';
import { BOT_NOTIFICATION_TYPE_LABELS } from '@/entities/bot-notification';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { Select } from '@/shared/ui/atoms/select';
import { Switch } from '@/shared/ui/atoms/switch';
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

type ManageBotsModalProps = {
  state: ManageBotNotificationState;
  onCreateSuccess?: (bot: BotNotification) => void;
  onUpdateSuccess?: (bot: BotNotification) => void;
  onDeleteSuccess?: () => void;
  onSendSuccess?: () => void;
};

const typeOptions = Object.values(BotNotificationType).map(value => ({
  label: BOT_NOTIFICATION_TYPE_LABELS[value],
  value,
}));

export const ManageBotsModal: FC<ManageBotsModalProps> = observer(
  ({ state, onCreateSuccess, onUpdateSuccess, onDeleteSuccess, onSendSuccess }) => {
    const bot = state.modal.payload?.bot;
    const isEdit = Boolean(bot?.id);

    const [name, setName] = useState('');
    const [type, setType] = useState<BotNotificationType>(BotNotificationType.MANUAL);
    const [status, setStatus] = useState(true);
    const [url, setUrl] = useState('');
    const [telegramToken, setTelegramToken] = useState('');
    const [telegramChannelId, setTelegramChannelId] = useState('');
    const [discordToken, setDiscordToken] = useState('');
    const [discordChannelId, setDiscordChannelId] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
      if (state.modal.isOpen && state.modal.payload?.mode === 'manage') {
        setName(bot?.name ?? '');
        setType(bot?.type ?? BotNotificationType.MANUAL);
        setStatus(bot?.status !== State.ARCHIVED);
        setUrl(bot?.url ?? '');
        setTelegramToken(bot?.telegramToken ?? '');
        setTelegramChannelId(bot?.telegramChannelId ?? '');
        setDiscordToken(bot?.discordToken ?? '');
        setDiscordChannelId(bot?.discordChannelId ?? '');
      }

      if (state.modal.isOpen && state.modal.payload?.mode === 'send') {
        setMessage('');
      }

      if (!state.modal.isOpen) {
        setName('');
        setType(BotNotificationType.MANUAL);
        setStatus(true);
        setUrl('');
        setTelegramToken('');
        setTelegramChannelId('');
        setDiscordToken('');
        setDiscordChannelId('');
        setMessage('');
      }
    }, [state.modal.isOpen, state.modal.payload?.mode, bot]);

    const handleSubmit = async () => {
      if (!name.trim()) return;

      const payload = {
        name: name.trim(),
        type,
        status: status ? State.ACTIVE : State.ARCHIVED,
        url: url.trim() || null,
        telegramToken: telegramToken.trim() || null,
        telegramChannelId: telegramChannelId.trim() || null,
        discordToken: discordToken.trim() || null,
        discordChannelId: discordChannelId.trim() || null,
      };

      if (isEdit && bot?.id) {
        await state.update({ id: bot.id, ...payload }, onUpdateSuccess);
        return;
      }

      await state.create(payload, onCreateSuccess);
    };

    return (
      <>
        <Drawer
          open={state.modal.isOpen && state.modal.payload?.mode === 'manage'}
          onOpenChange={open => !open && state.modal.close()}>
          <DrawerContent className="max-w-xl sm:max-w-xl">
            <DrawerHeader>
              <DrawerTitle>{isEdit ? 'Редагувати бота' : 'Новий бот'}</DrawerTitle>
            </DrawerHeader>
            <DrawerBody className="gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Назва</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Назва конфігурації" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Тип</label>
                <Select
                  options={typeOptions}
                  value={type}
                  onChange={value => setType((value as BotNotificationType) || BotNotificationType.MANUAL)}
                />
              </div>

              <label className="flex items-center gap-3 text-sm text-zinc-200">
                <span>Увімкнено</span>
                <Switch checked={status} onCheckedChange={setStatus} />
              </label>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">URL</label>
                <Input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder={
                    type === BotNotificationType.NEWS ? 'https://vtg.in.ua/news/:id' : 'https://vtg.in.ua/weekends'
                  }
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-300">Telegram token</label>
                  <Input
                    value={telegramToken}
                    onChange={e => setTelegramToken(e.target.value)}
                    placeholder="Bot token"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-300">Telegram channel</label>
                  <Input
                    value={telegramChannelId}
                    onChange={e => setTelegramChannelId(e.target.value)}
                    placeholder="@channel"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-300">Discord token</label>
                  <Input value={discordToken} onChange={e => setDiscordToken(e.target.value)} placeholder="Bot token" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-300">Discord channel id</label>
                  <Input
                    value={discordChannelId}
                    onChange={e => setDiscordChannelId(e.target.value)}
                    placeholder="Channel snowflake"
                  />
                </div>
              </div>
            </DrawerBody>
            <DrawerFooter className="border-t border-white/10 pt-4">
              <Button variant="outline" onClick={() => state.modal.close()} disabled={state.loader.isLoading}>
                Скасувати
              </Button>
              <Button onClick={() => void handleSubmit()} disabled={state.loader.isLoading || !name.trim()}>
                {state.loader.isLoading && <LoaderIcon className="size-4 animate-spin" />}
                {isEdit ? 'Зберегти' : 'Створити'}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Dialog
          open={state.modal.isOpen && state.modal.payload?.mode === 'send'}
          onOpenChange={open => !open && state.modal.close()}>
          <DialogContent showCloseButton>
            <DialogHeader>
              <DialogTitle>Створити повідомлення</DialogTitle>
              <DialogDescription>
                Надіслати повідомлення через «{bot?.name}» у підключені Telegram/Discord канали.
              </DialogDescription>
            </DialogHeader>
            <textarea
              className="min-h-32 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-lime-600"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Текст повідомлення..."
            />
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => state.modal.close()}>
                Скасувати
              </Button>
              <Button
                disabled={state.sendLoader.isLoading || !message.trim() || !bot?.id}
                onClick={() => bot?.id && void state.send(bot.id, message.trim(), onSendSuccess)}>
                {state.sendLoader.isLoading && <LoaderIcon className="size-4 animate-spin" />}
                Надіслати
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={state.modal.isOpen && state.modal.payload?.mode === 'delete'}
          onOpenChange={open => !open && state.modal.close()}>
          <DialogContent showCloseButton>
            <DialogHeader>
              <DialogTitle>Видалити бота</DialogTitle>
              <DialogDescription>
                Ви впевнені, що хочете видалити «{bot?.name}»? Цю дію не можна скасувати.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => state.modal.close()}>
                Скасувати
              </Button>
              <Button
                variant="destructive"
                disabled={state.loader.isLoading}
                onClick={() => bot?.id && void state.delete(bot.id, onDeleteSuccess)}>
                Видалити
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);
