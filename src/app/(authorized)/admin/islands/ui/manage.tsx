'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/organisms/dialog';
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
      <Dialog
        open={state.modal.isOpen && state.modal.payload?.mode === 'manage'}
        onOpenChange={state.modal.switch}>
        <DialogOverlay />
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Редагувати острів' : 'Новий острів'}</DialogTitle>
          </DialogHeader>

          <form className="flex flex-col gap-2" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
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
            </div>

            <div className="mt-4 flex justify-between">
              <Button type="button" variant="outline" onClick={() => state.modal.close()}>
                Скасувати
              </Button>
              <Button type="submit" disabled={state.loader.isLoading}>
                {isEdit ? 'Зберегти' : 'Створити'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
