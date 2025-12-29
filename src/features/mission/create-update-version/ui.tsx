'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Input, NumericInput } from '@/shared/ui/atoms/input';
import { Textarea } from '@/shared/ui/atoms/textarea';
import { Select } from '@/shared/ui/atoms/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/organisms/dialog';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect, useRef, FC, PropsWithChildren } from 'react';
import {
  PlusIcon,
  LoaderIcon,
  UploadIcon,
  TrashIcon,
  MinusIcon,
} from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { MissionGameSide, MissionVersion } from '@/shared/sdk/types';
import { CreateUpdateMissionVersionModel, VersionFormData } from './model';

const sideTypeOptions = [
  { label: 'BLUE', value: MissionGameSide.BLUE },
  { label: 'RED', value: MissionGameSide.RED },
  { label: 'GREEN', value: MissionGameSide.GREEN },
];

const createVersionSchema = (missionId: string) =>
  yup.object().shape({
    version: yup.string().required("Обов'язково"),
    missionId: yup.string().required("Обов'язково").default(missionId),
    attackSideType: yup.string().required("Обов'язково"),
    defenseSideType: yup.string().required("Обов'язково"),
    attackSideSlots: yup.number().required("Обов'язково").min(1),
    defenseSideSlots: yup.number().required("Обов'язково").min(1),
    attackSideName: yup.string().required("Обов'язково"),
    defenseSideName: yup.string().required("Обов'язково"),
    file: yup.mixed().nullable(),
    attackWeaponry: yup.array().of(
      yup.object().shape({
        name: yup.string().required("Обов'язково"),
        description: yup.string(),
        count: yup.number().required("Обов'язково").min(1),
        type: yup.string().required(),
      })
    ),
    defenseWeaponry: yup.array().of(
      yup.object().shape({
        name: yup.string().required("Обов'язково"),
        description: yup.string(),
        count: yup.number().required("Обов'язково").min(1),
        type: yup.string().required(),
      })
    ),
  });

const incrementVersion = (version: string, totalVersions: number): string => {
  const match = version.match(/^v?(\d+)\.(\d+)$/i);
  if (match) {
    const major = parseInt(match[1]);
    const minor = parseInt(match[2]);
    return `v${major}.${minor + 1}`;
  }
  // If version format doesn't match, try to extract number and increment
  const numMatch = version.match(/(\d+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1]);
    return `v${num + 1}.0`;
  }
  return `v${totalVersions + 1}.0`;
};

const CreateUpdateMissionVersionModal: FC<{
  model: CreateUpdateMissionVersionModel;
  onSuccess?: () => void;
}> = observer(({ model, onSuccess }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const payload = model.visibility?.payload;
  const missionId = payload?.missionId;
  const mission = payload?.mission;
  const editingVersion = payload?.version;

  const versionForm = useForm<VersionFormData>({
    mode: 'onChange',
    resolver: yupResolver(createVersionSchema(missionId || '')) as any,
    defaultValues: {
      version: '',
      missionId: missionId || '',
      attackSideType: MissionGameSide.BLUE,
      defenseSideType: MissionGameSide.RED,
      attackSideSlots: 0,
      defenseSideSlots: 0,
      attackSideName: '',
      defenseSideName: '',
      file: null,
      attackWeaponry: [],
      defenseWeaponry: [],
    },
  });

  // Watch side types to reset weaponry when they change
  const attackSideType = versionForm.watch('attackSideType');
  const defenseSideType = versionForm.watch('defenseSideType');
  const prevAttackSideType = useRef(attackSideType);
  const prevDefenseSideType = useRef(defenseSideType);

  useEffect(() => {
    // Reset weaponry arrays when side types change (but not on initial load)
    if (
      prevAttackSideType.current !== attackSideType &&
      prevAttackSideType.current !== undefined
    ) {
      versionForm.setValue('attackWeaponry', []);
    }
    if (
      prevDefenseSideType.current !== defenseSideType &&
      prevDefenseSideType.current !== undefined
    ) {
      versionForm.setValue('defenseWeaponry', []);
    }

    prevAttackSideType.current = attackSideType;
    prevDefenseSideType.current = defenseSideType;
  }, [attackSideType, defenseSideType]);

  // Autofill version form when dialog opens
  useEffect(() => {
    if (!model.visibility.isOpen || !missionId || !mission) return;

    if (editingVersion) {
      // Editing existing version
      const attackWeaponry = (editingVersion.weaponry || [])
        .filter((w) => w.type === editingVersion.attackSideType)
        .map((w) => ({
          name: w.name,
          description: w.description || '',
          count: w.count,
          type: w.type,
        }));

      const defenseWeaponry = (editingVersion.weaponry || [])
        .filter((w) => w.type === editingVersion.defenseSideType)
        .map((w) => ({
          name: w.name,
          description: w.description || '',
          count: w.count,
          type: w.type,
        }));

      versionForm.reset({
        version: editingVersion.version,
        missionId: missionId,
        attackSideType: editingVersion.attackSideType,
        defenseSideType: editingVersion.defenseSideType,
        attackSideSlots: editingVersion.attackSideSlots,
        defenseSideSlots: editingVersion.defenseSideSlots,
        attackSideName: editingVersion.attackSideName,
        defenseSideName: editingVersion.defenseSideName,
        file: null,
        attackWeaponry,
        defenseWeaponry,
      });

      // Initialize refs to current values to prevent reset on first render
      prevAttackSideType.current = editingVersion.attackSideType;
      prevDefenseSideType.current = editingVersion.defenseSideType;
    } else if (mission.missionVersions?.length > 0) {
      // Creating new version - autofill from previous
      const previousVersion =
        mission.missionVersions[mission.missionVersions.length - 1];

      const newVersion = incrementVersion(
        previousVersion.version,
        mission.missionVersions.length
      );

      versionForm.reset({
        version: newVersion,
        missionId: missionId,
        attackSideType: previousVersion.attackSideType,
        defenseSideType: previousVersion.defenseSideType,
        attackSideSlots: previousVersion.attackSideSlots,
        defenseSideSlots: previousVersion.defenseSideSlots,
        attackSideName: previousVersion.attackSideName,
        defenseSideName: previousVersion.defenseSideName,
        file: null,
        attackWeaponry: [],
        defenseWeaponry: [],
      });

      prevAttackSideType.current = previousVersion.attackSideType;
      prevDefenseSideType.current = previousVersion.defenseSideType;
    } else {
      // Reset to defaults if no previous versions
      versionForm.reset({
        version: 'v1.0',
        missionId: missionId,
        attackSideType: MissionGameSide.BLUE,
        defenseSideType: MissionGameSide.RED,
        attackSideSlots: 0,
        defenseSideSlots: 0,
        attackSideName: '',
        defenseSideName: '',
        file: null,
        attackWeaponry: [],
        defenseWeaponry: [],
      });

      // Initialize refs to current values
      prevAttackSideType.current = MissionGameSide.BLUE;
      prevDefenseSideType.current = MissionGameSide.RED;
    }
  }, [model.visibility.isOpen, mission, editingVersion, missionId]);

  const handleSubmit = async (data: VersionFormData) => {
    if (!editingVersion && !data.file) {
      versionForm.setError('file', { message: "Обов'язково" });
      return;
    }

    try {
      await model.save(data, onSuccess);
    } catch (error) {
      // Error is handled in the model
    }
  };

  const handleClose = () => {
    model.visibility.close();
    // Reset refs when closing
    prevAttackSideType.current = undefined as any;
    prevDefenseSideType.current = undefined as any;
  };

  if (!missionId || !mission) return null;

  return (
    <Dialog
      open={model.visibility.isOpen}
      onOpenChange={model.visibility.switch}>
      <DialogOverlay />
      <DialogContent className='min-w-[95vw] max-w-none max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {editingVersion ? 'Редагувати версію' : 'Створити нову версію'}
          </DialogTitle>
        </DialogHeader>
        <form
          className='flex flex-col gap-4'
          onSubmit={versionForm.handleSubmit(handleSubmit)}>
          <Controller
            control={versionForm.control}
            name='version'
            render={({ field }) => (
              <Input
                {...field}
                label='Версія'
                placeholder='v1.0'
                error={versionForm.formState.errors.version?.message}
              />
            )}
          />

          {/* Sides and Weaponry in 2 columns */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Attack Side Column */}
            <div className='flex flex-col gap-4'>
              <h3 className='text-lg font-semibold text-white'>
                Атакуюча сторона
              </h3>
              <Controller
                control={versionForm.control}
                name='attackSideType'
                render={({ field }) => (
                  <Select
                    label='Тип атакуючої сторони'
                    options={sideTypeOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={versionForm.formState.errors.attackSideType?.message}
                  />
                )}
              />
              <Controller
                control={versionForm.control}
                name='attackSideName'
                render={({ field }) => (
                  <Input
                    {...field}
                    label='Назва атакуючої сторони'
                    error={versionForm.formState.errors.attackSideName?.message}
                  />
                )}
              />
              <Controller
                control={versionForm.control}
                name='attackSideSlots'
                render={({ field }) => (
                  <NumericInput
                    {...field}
                    label='Слоти атакуючої сторони'
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                    error={versionForm.formState.errors.attackSideSlots?.message}
                  />
                )}
              />

              {/* Attack Side Weaponry */}
              <div className='flex flex-col gap-3 mt-2'>
                <div className='flex items-center justify-between'>
                  <h4 className='text-sm font-semibold text-zinc-300'>
                    Озброєння ({versionForm.watch('attackSideType')})
                  </h4>
                  
                </div>
                {versionForm.watch('attackWeaponry').map((weaponry, index) => (
                  <div
                    key={index}
                    className='flex flex-col gap-2 p-3 rounded-lg border border-white/10 bg-black/40'>
                    <div className='flex items-start gap-2'>
                      <div className='flex-1 flex flex-col gap-2'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                          <Controller
                            control={versionForm.control}
                            name={`attackWeaponry.${index}.name`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                label='Назва'
                                placeholder='Назва озброєння'
                                error={
                                  versionForm.formState.errors.attackWeaponry?.[
                                    index
                                  ]?.name?.message
                                }
                              />
                            )}
                          />
                          <Controller
                            control={versionForm.control}
                            name={`attackWeaponry.${index}.description`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                label='Опис (необовʼязково)'
                                placeholder='Опис озброєння'
                              />
                            )}
                          />
                        </div>
                        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
                          <Controller
                            control={versionForm.control}
                            name={`attackWeaponry.${index}.count`}
                            render={({ field }) => (
                              <div className='flex flex-col gap-1'>
                                <label className='text-xs font-semibold text-zinc-400'>
                                  Кількість
                                </label>
                                <div className='flex items-center gap-2'>
                                  <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    className='h-9 w-9 p-0'
                                    onClick={() => {
                                      const current = field.value || 1;
                                      field.onChange(Math.max(1, current - 1));
                                    }}>
                                    <MinusIcon className='size-3' />
                                  </Button>
                                  <NumericInput
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className='w-20'
                                    min={1}
                                  />
                                  <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    className='h-9 w-9 p-0'
                                    onClick={() => {
                                      const current = field.value || 1;
                                      field.onChange(current + 1);
                                    }}>
                                    <PlusIcon className='size-3' />
                                  </Button>
                                </div>
                              </div>
                            )}
                          />
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='h-9 w-9 p-0 mt-5 ml-auto'
                            onClick={() => {
                              const current =
                                versionForm.getValues('attackWeaponry');
                              versionForm.setValue(
                                'attackWeaponry',
                                current.filter((_, i) => i !== index)
                              );
                            }}>
                            <TrashIcon className='size-4 text-red-400' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    const current = versionForm.getValues('attackWeaponry');
                    versionForm.setValue('attackWeaponry', [
                      ...current,
                      {
                        name: '',
                        description: '',
                        count: 1,
                        type: versionForm.getValues('attackSideType'),
                      },
                    ]);
                  }}>
                  <PlusIcon className='size-3' />
                  Додати
                </Button>
              </div>
            </div>

            {/* Defense Side Column */}
            <div className='flex flex-col gap-4'>
              <h3 className='text-lg font-semibold text-white'>
                Оборонна сторона
              </h3>
              <Controller
                control={versionForm.control}
                name='defenseSideType'
                render={({ field }) => (
                  <Select
                    label='Тип оборонної сторони'
                    options={sideTypeOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={versionForm.formState.errors.defenseSideType?.message}
                  />
                )}
              />
              <Controller
                control={versionForm.control}
                name='defenseSideName'
                render={({ field }) => (
                  <Input
                    {...field}
                    label='Назва оборонної сторони'
                    error={versionForm.formState.errors.defenseSideName?.message}
                  />
                )}
              />
              <Controller
                control={versionForm.control}
                name='defenseSideSlots'
                render={({ field }) => (
                  <NumericInput
                    {...field}
                    label='Слоти оборонної сторони'
                    value={field.value || ''}
                    error={versionForm.formState.errors.defenseSideSlots?.message}
                  />
                )}
              />

              {/* Defense Side Weaponry */}
              <div className='flex flex-col gap-3 mt-2'>
                <div className='flex items-center justify-between'>
                  <h4 className='text-sm font-semibold text-zinc-300'>
                    Озброєння ({versionForm.watch('defenseSideType')})
                  </h4>
                </div>
                {versionForm.watch('defenseWeaponry').map((weaponry, index) => (
                  <div
                    key={index}
                    className='flex flex-col gap-2 p-3 rounded-lg border border-white/10 bg-black/40'>
                    <div className='flex items-start gap-2'>
                      <div className='flex-1 flex flex-col gap-2'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                          <Controller
                            control={versionForm.control}
                            name={`defenseWeaponry.${index}.name`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                label='Назва'
                                placeholder='Назва озброєння'
                                error={
                                  versionForm.formState.errors.defenseWeaponry?.[
                                    index
                                  ]?.name?.message
                                }
                              />
                            )}
                          />
                          <Controller
                            control={versionForm.control}
                            name={`defenseWeaponry.${index}.description`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                label='Опис (необовʼязково)'
                                placeholder='Опис озброєння'
                              />
                            )}
                          />
                        </div>
                        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
                          <Controller
                            control={versionForm.control}
                            name={`defenseWeaponry.${index}.count`}
                            render={({ field }) => (
                              <div className='flex flex-col gap-1'>
                                <label className='text-xs font-semibold text-zinc-400'>
                                  Кількість
                                </label>
                                <div className='flex items-center gap-2'>
                                  <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    className='h-9 w-9 p-0'
                                    onClick={() => {
                                      const current = field.value || 1;
                                      field.onChange(Math.max(1, current - 1));
                                    }}>
                                    <MinusIcon className='size-3' />
                                  </Button>
                                  <NumericInput
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className='w-20'
                                    min={1}
                                  />
                                  <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    className='h-9 w-9 p-0'
                                    onClick={() => {
                                      const current = field.value || 1;
                                      field.onChange(current + 1);
                                    }}>
                                    <PlusIcon className='size-3' />
                                  </Button>
                                </div>
                              </div>
                            )}
                          />
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='h-9 w-9 p-0 mt-5 ml-auto'
                            onClick={() => {
                              const current =
                                versionForm.getValues('defenseWeaponry');
                              versionForm.setValue(
                                'defenseWeaponry',
                                current.filter((_, i) => i !== index)
                              );
                            }}>
                            <TrashIcon className='size-4 text-red-400' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    const current = versionForm.getValues('defenseWeaponry');
                    versionForm.setValue('defenseWeaponry', [
                      ...current,
                      {
                        name: '',
                        description: '',
                        count: 1,
                        type: versionForm.getValues('defenseSideType'),
                      },
                    ]);
                  }}>
                  <PlusIcon className='size-3' />
                  Додати
                </Button>
              </div>
            </div>
          </div>

          <Controller
            control={versionForm.control}
            name='file'
            render={({ field: { onChange, value, ...field } }) => (
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-semibold text-zinc-300'>
                  Файл місії{' '}
                  {editingVersion && '(залиште порожнім, щоб не змінювати)'}
                </label>
                <Button
                  variant='outline'
                  className='w-full'
                  type='button'
                  onClick={(e) => {
                    e.preventDefault();
                    fileRef.current?.click();
                  }}>
                  <UploadIcon className='size-4' />
                  {value ? 'Змінити файл' : 'Обрати файл'}
                </Button>
                <input
                  ref={fileRef}
                  type='file'
                  accept='.pbo,.p3d'
                  onChange={(e) => onChange(e.target.files?.[0] || null)}
                  className='invisible'
                />
                {versionForm.formState.errors.file && (
                  <p className='text-sm text-red-400'>
                    {versionForm.formState.errors.file.message}
                  </p>
                )}
              </div>
            )}
          />

          <div className='flex justify-between pt-4'>
            <Button type='button' variant='outline' onClick={handleClose}>
              Скасувати
            </Button>
            <Button
              type='submit'
              disabled={
                model.loader.isLoading || !versionForm.formState.isValid
              }>
              {model.loader.isLoading ? (
                <>
                  <LoaderIcon className='size-4 animate-spin' />
                  {editingVersion ? 'Збереження...' : 'Створення...'}
                </>
              ) : editingVersion ? (
                'Зберегти зміни'
              ) : (
                'Створити версію'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

export { CreateUpdateMissionVersionModal };
