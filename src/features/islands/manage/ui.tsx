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
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ManageIslandModel } from './model';

const islandFormSchema = yup.object().shape({
  name: yup.string().required("Назва обов'язкова"),
  code: yup.string().required("Код обов'язковий"),
});

const ManageIslandModal: FC<
  PropsWithChildren<{
    model: ManageIslandModel;
    onCreateSuccess?: (island: Island) => void;
    onUpdateSuccess?: (island: Island) => void;
    onDeleteSuccess?: () => void;
  }>
> = observer(({ model, children, onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) => {
  const form = useForm<CreateIslandDto>({
    resolver: yupResolver(islandFormSchema),
    defaultValues: { name: '', code: '' },
  });

  const isEdit = Boolean(model.modal.payload?.island?.id);

  const onSubmit = async (data: CreateIslandDto) => {
    if (isEdit && model.modal.payload?.island?.id) {
      await model.updateIsland(model.modal.payload.island.id, data, onUpdateSuccess);
    } else {
      await model.createIsland(data, onCreateSuccess);
    }
  };

  useEffect(() => {
    if (model.modal.isOpen && model.modal.payload?.mode === 'manage') {
      const island = model.modal.payload?.island;
      form.setValue('name', island?.name ?? '');
      form.setValue('code', island?.code ?? '');
    }

    if (!model.modal.isOpen) {
      form.reset({ name: '', code: '' });
    }
  }, [model.modal.isOpen, model.modal.payload?.mode, model.modal.payload?.island]);

  return (
    <>
      <Dialog
        open={model.modal.isOpen && model.modal.payload?.mode === 'manage'}
        onOpenChange={model.modal.switch}>
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
              <Button type="button" variant="outline" onClick={() => model.modal.close()}>
                Скасувати
              </Button>
              <Button type="submit" disabled={model.loader.isLoading}>
                {isEdit ? 'Зберегти' : 'Створити'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={model.modal.isOpen && model.modal.payload?.mode === 'delete'}
        onOpenChange={model.modal.switch}>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Видалити острів <span className="text-lime-400">{model.modal.payload?.island?.name}</span>?
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={() => model.modal.close()}>
              Скасувати
            </Button>
            <Button
              variant="destructive"
              disabled={model.loader.isLoading}
              onClick={() => {
                const id = model.modal.payload?.island?.id;
                if (id) void model.deleteIsland(id, onDeleteSuccess);
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
