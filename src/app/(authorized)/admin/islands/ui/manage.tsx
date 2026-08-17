'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from '@/shared/ui/organisms/dialog';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/ui/organisms/drawer';
import { CreateIslandDto, Island } from '@/shared/sdk/types';
import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ManageIslandState } from '../state/manage-islands.state';

const islandFormSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  code: z.string().min(1, "Код обов'язковий"),
});

const ManageIslandModal: FC<
  PropsWithChildren<{
    state: ManageIslandState;
    onCreateSuccess?: (island: Island) => void;
    onUpdateSuccess?: (island: Island) => void;
    onDeleteSuccess?: () => void;
  }>
> = observer(({ state, children, onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) => {
  const form = useForm<CreateIslandDto>({
    resolver: zodResolver(islandFormSchema),
    defaultValues: { name: '', code: '' },
  });

  const isEdit = Boolean(state.modal.payload?.island?.id);

  const onSubmit = async (data: CreateIslandDto) => {
    if (isEdit && state.modal.payload?.island?.id) {
      await state.updateIsland(state.modal.payload.island.id, data, onUpdateSuccess);
    } else {
      await state.createIsland(data, onCreateSuccess);
    }
  };

  useEffect(() => {
    if (state.modal.isOpen && state.modal.payload?.mode === 'manage') {
      const island = state.modal.payload?.island;
      form.setValue('name', island?.name ?? '');
      form.setValue('code', island?.code ?? '');
    }

    if (!state.modal.isOpen) {
      form.reset({ name: '', code: '' });
    }
  }, [state.modal.isOpen, state.modal.payload?.mode, state.modal.payload?.island]);

  return (
    <>
      <Drawer
        open={state.modal.isOpen && state.modal.payload?.mode === 'manage'}
        onOpenChange={state.modal.switch}>
        {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
        <DrawerContent>
          <form className="flex min-h-0 flex-1 flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <DrawerHeader>
              <DrawerTitle>{isEdit ? 'Редагувати острів' : 'Новий острів'}</DrawerTitle>
            </DrawerHeader>

            <DrawerBody>
              <Controller
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Input {...field} autoFocus label="Назва" error={form.formState.errors.name?.message} />
                )}
              />
              <Controller
                control={form.control}
                name="code"
                render={({ field }) => (
                  <Input {...field} label="Код" error={form.formState.errors.code?.message} />
                )}
              />
            </DrawerBody>

            <DrawerFooter className="border-t border-white/10 pt-4 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" onClick={() => state.modal.close()}>
                Скасувати
              </Button>
              <Button type="submit" disabled={state.loader.isLoading}>
                {isEdit ? 'Зберегти' : 'Створити'}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      <Dialog
        open={state.modal.isOpen && state.modal.payload?.mode === 'delete'}
        onOpenChange={state.modal.switch}>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Видалити острів <span className="text-lime-400">{state.modal.payload?.island?.name}</span>?
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={() => state.modal.close()}>
              Скасувати
            </Button>
            <Button
              variant="destructive"
              disabled={state.loader.isLoading}
              onClick={() => {
                const id = state.modal.payload?.island?.id;
                if (id) void state.deleteIsland(id, onDeleteSuccess);
              }}>
              Видалити
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

export { ManageIslandModal };
