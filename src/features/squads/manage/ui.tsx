import { Button } from '@/shared/ui/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/organisms/dialog';
import { Observer, observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, RefObject, useEffect, useRef, useState } from 'react';
import { ManageSquadModel } from './model';
import { Input } from '@/shared/ui/atoms/input';
import { CreateSquadDto, Squad, UpdateSquadDto } from '@/shared/sdk/types';

import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Select } from '@/shared/ui/atoms/select';
import { CropperRef, FixedCropper, FixedCropperRef, ImageRestriction } from 'react-advanced-cropper';
import Image from 'next/image';
import { Preloader } from '@/shared/ui/atoms/preloader';

const ManageSquadModal: FC<
  PropsWithChildren<{
    model: ManageSquadModel;
    existedSquads?: Squad[];
    onCreateSuccess?: (squad: Squad) => void;
    onUpdateSuccess?: (squad: Squad) => void;
    onDeleteSuccess?: (squad: Squad) => void;
  }>
> = observer(({ model, children, existedSquads = [], onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) => {
  const form = useForm<CreateSquadDto>({
    mode: 'onChange',
    resolver: yupResolver(
      yup.object().shape({
        name: yup
          .string()
          .required("Назва є обов'язковою")
          .when('$existedSquads', {
            is: (existedSquads: Squad[], value: string) => {
              return existedSquads.some(squad => squad.name === value);
            },
            then: schema => {
              return schema.required('Назва загону вже зайнята');
            },
            otherwise: schema => schema,
          }),
        tag: yup
          .string()
          .required("Тег є обов'язковим")
          .when('$existedSquads', {
            is: (existedSquads: Squad[], value: string) => {
              return existedSquads.some(squad => squad.tag === value);
            },
            then: schema => {
              return schema.required('Тег вже зайнятий');
            },
            otherwise: schema => schema,
          }),
        description: yup.string().required("Опис є обов'язковим"),
        leaderId: yup.string().required("Лідер є обов'язковим"),
        sideId: yup.string().required("Сторона є обов'язковою"),
      }),
    ),
    context: {
      existedSquads,
    },
    defaultValues: {
      name: '',
      tag: '',
      description: '',
      leaderId: '',
      sideId: '',
    },
  });

  const imageRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<CropperRef>(null);
  const isEdit = Boolean(model.modal.payload?.squad?.id);
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState('');

  const { tag, sideId } = form.watch();
  const { isValid } = form.formState;

  const onSubmit = async (data: CreateSquadDto) => {
    if (isEdit) {
      const dto: UpdateSquadDto = {
        id: model.modal.payload?.squad?.id || '',
      };

      if (data.activeCount !== model.modal.payload?.squad?.activeCount) {
        dto.activeCount = data.activeCount;
      }

      if (data.name !== model.modal.payload?.squad?.name) {
        dto.name = data.name;
      }

      if (data.tag !== model.modal.payload?.squad?.tag) {
        dto.tag = data.tag;
      }

      if (data.description !== model.modal.payload?.squad?.description) {
        dto.description = data.description;
      }

      if (data.leaderId !== model.modal.payload?.squad?.leader?.id) {
        dto.leaderId = data.leaderId;
      }

      if (data.sideId !== model.modal.payload?.squad?.side?.id) {
        dto.sideId = data.sideId;
      }

      if (file) {
        dto.logo = file;
      }

      model.updateSquad(dto, onUpdateSuccess);
    } else {
      model.createSquad({ ...data, logo: file || undefined }, onCreateSuccess);
    }
  };

  useEffect(() => {
    if (file) {
      setImage(URL.createObjectURL(file));
    } else {
      setImage('');
    }
  }, [file]);

  useEffect(() => {
    if (model.modal.isOpen) {
      model.init();

      form.setValue('name', model.modal.payload?.squad?.name || '');
      form.setValue('tag', model.modal.payload?.squad?.tag || '');
      form.setValue('description', model.modal.payload?.squad?.description || '');
      form.setValue('leaderId', model.modal.payload?.squad?.leader?.id || '');
      form.setValue('sideId', model.modal.payload?.squad?.side?.id || '');
      form.setValue('activeCount', model.modal.payload?.squad?.activeCount || 0);
    }

    if (!model.modal.isOpen) {
      form.reset();
      model.reset();
      setFile(null);
      setImage('');
    }
  }, [model.modal.isOpen]);

  const oldLogo = model.modal.payload?.squad?.logo?.url || '';

  return (
    <>
      <Dialog open={model.modal.isOpen && model.modal?.payload?.mode !== 'delete'} onOpenChange={model.modal.switch}>
        <DialogOverlay />
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Редагувати загін' : 'Створити загін'}</DialogTitle>
          </DialogHeader>

          <Preloader
            isLoading={
              model.loader.isLoading ||
              model.users.pagination.preloader.isLoading ||
              model.sides.pagination.preloader.isLoading
            }>
            <form className="flex flex-col gap-2 overflow-hidden" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-2 ">
                <input
                  ref={imageRef}
                  className="hidden"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                  disabled={model.loader.isLoading}
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />

                {Boolean(image) && (
                  <FixedCropper
                    ref={cropperRef as RefObject<FixedCropperRef>}
                    className="h-64 rounded-sm"
                    src={image}
                    imageRestriction={ImageRestriction.stencil}
                    stencilProps={{
                      handlers: false,
                      lines: true,
                      movable: false,
                      resizable: false,
                    }}
                    defaultSize={{
                      height: 256,
                      width: 256,
                    }}
                    stencilSize={{
                      height: 256,
                      width: 256,
                    }}
                  />
                )}

                {oldLogo && (
                  <Image
                    className="size-64 mx-auto object-cover rounded-sm"
                    src={oldLogo}
                    alt="Old logo"
                    width={256}
                    height={256}
                  />
                )}

                {!image && !oldLogo && <div className="size-64 mx-auto bg-black/80 rounded-sm" />}
                <Button
                  type="button"
                  className="w-64 mx-auto"
                  variant={file ? 'outline' : 'default'}
                  disabled={model.loader.isLoading}
                  onClick={() => imageRef.current?.click()}>
                  {file || oldLogo ? 'Змінити лого' : 'Обрати лого'}
                </Button>
              </div>

              <div className="flex flex-col gap-4">
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <Input {...field} label="Назва загону" error={form.formState.errors.name?.message} />
                  )}
                />

                <Controller
                  control={form.control}
                  name="tag"
                  render={({ field }) => (
                    <div className="flex flex-col gap-1">
                      <Input {...field} label="Тег загону" error={form.formState.errors.tag?.message} />

                      <span className="text-sm text-neutral-500">Тег буде виглядати так: [{tag}]</span>
                    </div>
                  )}
                />

                <Controller
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <Input {...field} label="Опис загону" error={form.formState.errors.description?.message} />
                  )}
                />

                <Controller
                  control={form.control}
                  name="sideId"
                  render={({ field }) => (
                    <Observer>
                      {() => (
                        <Select
                          {...field}
                          label="Сторона загону"
                          options={model.sides.options}
                          error={form.formState.errors.sideId?.message}
                        />
                      )}
                    </Observer>
                  )}
                />

                <Controller
                  control={form.control}
                  name="leaderId"
                  disabled={!sideId}
                  render={({ field }) => (
                    <Observer>
                      {() => (
                        <Select
                          {...field}
                          onSearch={search => {
                            model.users.pagination.init({
                              search,
                              skip: 0,
                              take: 100,
                            });
                          }}
                          isLoading={model.users.pagination.preloader.isLoading}
                          label="Лідер загону"
                          options={model.users.options}
                          error={form.formState.errors.sideId?.message}
                        />
                      )}
                    </Observer>
                  )}
                />
              </div>

              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => model.modal.close()}>
                  Скасувати
                </Button>
                <Button type="submit" disabled={!isValid}>
                  {model?.modal?.payload?.squad ? 'Зберегти' : 'Створити'}
                </Button>
              </div>
            </form>
          </Preloader>
        </DialogContent>
      </Dialog>

      <Dialog open={model.modal.isOpen && model.modal?.payload?.mode === 'delete'} onOpenChange={model.modal.switch}>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Видалити загін <span className="text-green-500">{model.modal?.payload?.squad?.name}</span>?
            </DialogTitle>
          </DialogHeader>

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => model.modal.close()}>
              Скасувати
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                model.deleteSquad(model.modal?.payload?.squad?.id || '', onDeleteSuccess);
              }}>
              Видалити
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

export { ManageSquadModal };
