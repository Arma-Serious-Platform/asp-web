import { Button } from '@/shared/ui/atoms/button';
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
import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useEffect } from 'react';
import { manageServerState, ManageServerState } from '../state/manage-server.state';
import { Input, NumericInput } from '@/shared/ui/atoms/input';
import { CreateServerDto, Server, ServerStatus, ServerStatusSchema } from '@/shared/sdk/types';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Switch } from '@/shared/ui/atoms/switch';

const createServerSchema = (existedServers: Server[], editingServerId?: string) =>
  z.object({
    name: z
      .string()
      .min(1, "Назва є обов'язковою")
      .refine(
        name => !existedServers.some(server => server.name === name && server.id !== editingServerId),
        { message: 'Назва сервера вже існує' },
      ),
    ip: z.string().min(1, "IP є обов'язковим"),
    port: z.number({ error: "Порт є обов'язковим" }),
    status: ServerStatusSchema,
  });

const ManageServerModal: FC<
  PropsWithChildren<{
    state?: ManageServerState;
    model?: ManageServerState;
    existedServers?: Server[];
    onCreateSuccess?: (server: Server) => void;
    onUpdateSuccess?: (server: Server) => void;
    onDeleteSuccess?: (server: Server) => void;
  }>
> = observer(
  ({
    state: stateProp,
    model,
    children,
    existedServers = [],
    onCreateSuccess,
    onUpdateSuccess,
    onDeleteSuccess,
  }) => {
    const state = stateProp ?? model ?? manageServerState;
    const editingServerId = state.modal.payload?.server?.id;

    const form = useForm<CreateServerDto>({
      resolver: zodResolver(createServerSchema(existedServers, editingServerId)),
      defaultValues: {
        name: '',
        ip: '',
        port: 2302,
        status: ServerStatus.ACTIVE,
      },
    });

    const isEdit = Boolean(editingServerId);

    const onSubmit = async (data: CreateServerDto) => {
      if (isEdit) {
        state.updateServer(
          {
            ...data,
            id: editingServerId || '',
          },
          onUpdateSuccess,
        );
      } else {
        state.createServer(data, onCreateSuccess);
      }
    };

    useEffect(() => {
      if (state.modal.isOpen) {
        form.setValue('name', state.modal.payload?.server?.name || '');
        form.setValue('ip', state.modal.payload?.server?.ip || '');
        form.setValue('port', state.modal.payload?.server?.port || 2302);
        form.setValue('status', state.modal.payload?.server?.status || ServerStatus.ACTIVE);
      }

      if (!state.modal.isOpen) {
        form.reset();
        state.modal.clearPayload();
      }
    }, [state.modal.isOpen]);

    return (
      <>
        <Drawer open={state.modal.isOpen && state.modal?.payload?.mode !== 'delete'} onOpenChange={state.modal.switch}>
          {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
          <DrawerContent>
            <form className="flex min-h-0 flex-1 flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
              <DrawerHeader>
                <DrawerTitle>{isEdit ? 'Редагувати сервер' : 'Створити сервер'}</DrawerTitle>
              </DrawerHeader>

              <DrawerBody className="gap-6">
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <Input {...field} autoFocus label="Назва сервера" error={form.formState.errors.name?.message} />
                  )}
                />
                <Controller
                  control={form.control}
                  name="ip"
                  render={({ field }) => (
                    <Input {...field} label="IP сервера" error={form.formState.errors.ip?.message} />
                  )}
                />

                <Controller
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <NumericInput
                      {...field}
                      label="Порт сервера"
                      maxLength={4}
                      error={form.formState.errors.port?.message}
                    />
                  )}
                />

                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.value === ServerStatus.ACTIVE}
                        onCheckedChange={checked =>
                          field.onChange(checked ? ServerStatus.ACTIVE : ServerStatus.INACTIVE)
                        }
                      />
                      <span className="text-sm">
                        {field.value === ServerStatus.ACTIVE && <span className="text-green-500">Активний</span>}

                        {field.value === ServerStatus.INACTIVE && <span className="text-red-500">Неактивний</span>}
                      </span>
                    </div>
                  )}
                />
              </DrawerBody>

              <DrawerFooter className="border-t border-white/10 pt-4 sm:flex-row sm:justify-between">
                <Button variant="outline" type="button" onClick={() => state.modal.close()}>
                  Скасувати
                </Button>
                <Button type="submit">{state?.modal?.payload?.server ? 'Зберегти' : 'Створити'}</Button>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>

        <Dialog open={state.modal.isOpen && state.modal?.payload?.mode === 'delete'} onOpenChange={state.modal.switch}>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Видалити сервер <span className="text-green-500">{state.modal?.payload?.server?.name}</span>?
              </DialogTitle>
            </DialogHeader>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => state.modal.close()}>
                Скасувати
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  state.deleteServer(state.modal?.payload?.server?.id || '', onDeleteSuccess);
                }}>
                Видалити
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

export { ManageServerModal };
