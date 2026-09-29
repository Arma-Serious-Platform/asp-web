'use client';

import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { CheckIcon, CopyIcon, LoaderIcon } from 'lucide-react';

import { ManageApiKeysState } from '../state/manage-api-keys.state';
import { ApiKey } from '@/shared/sdk/api-keys/api-keys.schemas';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
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

type ManageApiKeysModalProps = {
  state: ManageApiKeysState;
  onCreateSuccess?: (apiKey: ApiKey) => void;
  onUpdateSuccess?: (apiKey: ApiKey) => void;
  onDeleteSuccess?: () => void;
};

export const ManageApiKeysModal: FC<ManageApiKeysModalProps> = observer(
  ({ state, onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) => {
    const apiKey = state.modal.payload?.apiKey;
    const isEdit = Boolean(apiKey?.id) && state.modal.payload?.mode === 'manage';
    const [name, setName] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
      if (state.modal.isOpen && state.modal.payload?.mode === 'manage') {
        setName(apiKey?.name ?? '');
      }
      if (!state.modal.isOpen) {
        setName('');
        setCopied(false);
        state.clearCreatedKey();
      }
    }, [state.modal.isOpen, state.modal.payload?.mode, apiKey]);

    const handleSubmit = async () => {
      if (!name.trim()) return;

      if (isEdit && apiKey?.id) {
        await state.update(apiKey.id, name.trim(), onUpdateSuccess);
        return;
      }

      await state.create(name.trim(), onCreateSuccess);
    };

    const handleCopy = async () => {
      if (!state.createdKey) return;
      await navigator.clipboard.writeText(state.createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <>
        <Drawer
          open={state.modal.isOpen && state.modal.payload?.mode === 'manage'}
          onOpenChange={open => !open && state.modal.close()}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{isEdit ? 'Редагувати API ключ' : 'Створити API ключ'}</DrawerTitle>
            </DrawerHeader>
            <DrawerBody className="flex flex-col gap-4">
              <Input
                label="Назва"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Назва інтеграції"
              />
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
          open={state.modal.isOpen && state.modal.payload?.mode === 'created'}
          onOpenChange={open => !open && state.modal.close()}>
          <DialogContent showCloseButton>
            <DialogHeader>
              <DialogTitle>API ключ створено</DialogTitle>
              <DialogDescription>
                Скопіюйте ключ зараз. Після закриття вікна повний ключ більше не буде доступний.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/40 p-3">
              <code className="flex-1 break-all text-sm text-lime-400">{state.createdKey}</code>
              <Button size="icon" variant="secondary" onClick={() => void handleCopy()}>
                {copied ? <CheckIcon className="size-4 text-lime-400" /> : <CopyIcon className="size-4" />}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => state.modal.close()}>Зрозуміло</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={state.modal.isOpen && state.modal.payload?.mode === 'delete'}
          onOpenChange={open => !open && state.modal.close()}>
          <DialogContent showCloseButton>
            <DialogHeader>
              <DialogTitle>Видалити API ключ</DialogTitle>
              <DialogDescription>
                Ви впевнені, що хочете видалити «{apiKey?.name}»? Інтеграції з цим ключем перестануть
                працювати.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => state.modal.close()}>
                Скасувати
              </Button>
              <Button
                variant="destructive"
                disabled={state.loader.isLoading}
                onClick={() => apiKey?.id && void state.delete(apiKey.id, onDeleteSuccess)}>
                Видалити
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);
