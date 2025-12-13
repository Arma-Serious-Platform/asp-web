import { Button } from '@/shared/ui/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/organisms/dialog';
import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useEffect } from 'react';
import { manageServerModel, ManageServerModel } from './model';
import { Input, NumericInput } from '@/shared/ui/atoms/input';
import { CreateServerDto, Server, ServerStatus } from '@/shared/sdk/types';

import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Switch } from '@/shared/ui/atoms/switch';

const ManageServerModal: FC<
  PropsWithChildren<{
    model?: ManageServerModel;
    existedServers?: Server[];
    onCreateSuccess?: (server: Server) => void;
    onUpdateSuccess?: (server: Server) => void;
    onDeleteSuccess?: (server: Server) => void;
  }>
> = observer(
  ({
    model = manageServerModel,
    children,
    existedServers = [],
    onCreateSuccess,
    onUpdateSuccess,
    onDeleteSuccess,
  }) => {
    const form = useForm<CreateServerDto>({
      resolver: yupResolver(
        yup.object().shape({
          name: yup
            .string()
            .required("Назва є обов'язковою")
            .when('$existedServers', {
              is: (existedServers: Server[], value: string) => {
                return existedServers.some((server) => server.name === value);
              },
              then: (schema) => {
                return schema.required('Назва сервера вже існує');
              },
              otherwise: (schema) => schema,
            }),
          ip: yup.string().required("IP є обов'язковим"),
          port: yup.number().required("Порт є обов'язковим"),
          status: yup.string<ServerStatus>().required("Стан є обов'язковим"),
        })
      ),
      context: {
        existedServers,
      },
      defaultValues: {
        name: '',
        ip: '',
        port: 2302,
        status: ServerStatus.ACTIVE,
      },
    });

    const isEdit = Boolean(model.modal.payload?.server?.id);

    const onSubmit = async (data: CreateServerDto) => {
      if (isEdit) {
        model.updateServer(
          {
            ...data,
            id: model.modal.payload?.server?.id || '',
          },
          onUpdateSuccess
        );
      } else {
        model.createServer(data, onCreateSuccess);
      }
    };

    useEffect(() => {
      if (model.modal.isOpen) {
        form.setValue('name', model.modal.payload?.server?.name || '');
        form.setValue('ip', model.modal.payload?.server?.ip || '');
        form.setValue('port', model.modal.payload?.server?.port || 2302);
        form.setValue(
          'status',
          model.modal.payload?.server?.status || ServerStatus.ACTIVE
        );
      }

      if (!model.modal.isOpen) {
        form.reset();
        model.modal.clearPayload();
      }
    }, [model.modal.isOpen]);

    return (
      <>
        <Dialog
          open={model.modal.isOpen && model.modal?.payload?.mode !== 'delete'}
          onOpenChange={model.modal.switch}>
          <DialogOverlay />
          {children && <DialogTrigger asChild>{children}</DialogTrigger>}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEdit ? 'Редагувати сервер' : 'Створити сервер'}
              </DialogTitle>
            </DialogHeader>

            <form
              className='flex flex-col gap-2'
              onSubmit={form.handleSubmit(onSubmit)}>
              <div className='flex flex-col gap-2'>
                <Controller
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <Input
                      {...field}
                      autoFocus
                      label='Назва сервера'
                      error={form.formState.errors.name?.message}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name='ip'
                  render={({ field }) => (
                    <Input
                      {...field}
                      label='IP сервера'
                      error={form.formState.errors.ip?.message}
                    />
                  )}
                />

                <Controller
                  control={form.control}
                  name='port'
                  render={({ field }) => (
                    <NumericInput
                      {...field}
                      label='Порт сервера'
                      maxLength={4}
                      error={form.formState.errors.port?.message}
                    />
                  )}
                />

                <Controller
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <div className='flex items-center gap-2'>
                      <Switch
                        checked={field.value === ServerStatus.ACTIVE}
                        onCheckedChange={(checked) =>
                          field.onChange(
                            checked
                              ? ServerStatus.ACTIVE
                              : ServerStatus.INACTIVE
                          )
                        }
                      />
                      <span className='text-sm'>
                        {field.value === ServerStatus.ACTIVE && (
                          <span className='text-green-500'>Активний</span>
                        )}

                        {field.value === ServerStatus.INACTIVE && (
                          <span className='text-red-500'>Неактивний</span>
                        )}
                      </span>
                    </div>
                  )}
                />
              </div>

              <div className='flex justify-between mt-4'>
                <Button variant='outline' onClick={() => model.modal.close()}>
                  Скасувати
                </Button>
                <Button type='submit'>
                  {model?.modal?.payload?.server ? 'Зберегти' : 'Створити'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={model.modal.isOpen && model.modal?.payload?.mode === 'delete'}
          onOpenChange={model.modal.switch}>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Видалити сервер{' '}
                <span className='text-green-500'>
                  {model.modal?.payload?.server?.name}
                </span>
                ?
              </DialogTitle>
            </DialogHeader>

            <div className='flex justify-between mt-4'>
              <Button variant='outline' onClick={() => model.modal.close()}>
                Скасувати
              </Button>
              <Button
                variant='destructive'
                onClick={() => {
                  model.deleteServer(
                    model.modal?.payload?.server?.id || '',
                    onDeleteSuccess
                  );
                }}>
                Видалити
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

export { ManageServerModal };
