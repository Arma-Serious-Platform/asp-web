'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Input, NumericInput } from '@/shared/ui/atoms/input';
import { Select } from '@/shared/ui/atoms/select';
import { Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/shared/ui/organisms/drawer';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useRef, useState, FC } from 'react';
import { PlusIcon, LoaderIcon, UploadIcon, TrashIcon, MinusIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { MissionGameSide, MissionType, MissionVersion } from '@/shared/sdk/types';
import { CreateUpdateMissionVersionState, VersionFormData, WeaponryFormItem } from '../state/create-update-version.state';
import { MessageEditor } from '@/features/chat/editor';
import {
  isValidUploadFileSize,
  notifyOversizedUploadFiles,
  rejectOversizedUploadFiles,
  resolveUploadFileFromInput,
  uploadFileSizeLimitMessage,
} from '@/shared/utils/file';
import { MissionModel } from '@/entities/mission/mission.model';

const sideTypeOptions = [
  { label: 'BLUE', value: MissionGameSide.BLUE },
  { label: 'RED', value: MissionGameSide.RED },
  { label: 'GREEN', value: MissionGameSide.GREEN },
];

const fileSizeSchema = z.custom<File>(file => file instanceof File && isValidUploadFileSize(file), {
  message: uploadFileSizeLimitMessage,
});

const weaponryItemSchema = z.object({
  name: z.string().min(1, "Обов'язково"),
  description: z.string().optional().default(''),
  count: z.number().min(1, "Обов'язково"),
  type: z.string().min(1),
});

const createVersionSchema = (missionId: string) =>
  z
    .object({
      version: z.string().min(1, "Обов'язково"),
      missionId: z.string().min(1, "Обов'язково").default(missionId),
      attackSideType: z.string().min(1, "Обов'язково"),
      defenseSideType: z.string().min(1, "Обов'язково"),
      attackSideSlots: z.number().min(1, "Обов'язково"),
      defenseSideSlots: z.number().min(1, "Обов'язково"),
      minSlotsToPlay: z.number().min(1, 'Мінімум 1').nullable().optional(),
      attackSideName: z.string().min(1, "Обов'язково"),
      defenseSideName: z.string().min(1, "Обов'язково"),
      enableFriendlySide: z.boolean().default(false),
      friendlySideType: z.string().nullable().optional(),
      friendlyTo: z.string().nullable().optional(),
      friendlySideName: z.string().nullable().optional(),
      friendlySideSlots: z.number().nullable().optional(),
      friendlyScreenshots: z.array(fileSizeSchema).default([]),
      removeFriendlyScreenshotIds: z.array(z.string()).default([]),
      friendlyWeaponry: z.array(weaponryItemSchema).default([]),
      file: z
        .custom<File | null>(value => !value || (value instanceof File && isValidUploadFileSize(value)), {
          message: uploadFileSizeLimitMessage,
        })
        .nullable()
        .optional(),
      attackScreenshots: z.array(fileSizeSchema).default([]),
      defenseScreenshots: z.array(fileSizeSchema).default([]),
      removeAttackScreenshotIds: z.array(z.string()).default([]),
      removeDefenseScreenshotIds: z.array(z.string()).default([]),
      attackWeaponry: z.array(weaponryItemSchema).default([]),
      defenseWeaponry: z.array(weaponryItemSchema).default([]),
      inGameTime: z.string().default(''),
      weather: z.string().default(''),
      changelog: z.any().nullable().default(null),
    })
    .superRefine((data, ctx) => {
      if (!data.enableFriendlySide) return;
      if (!data.friendlySideName?.trim()) {
        ctx.addIssue({ code: 'custom', message: "Обов'язково", path: ['friendlySideName'] });
      }
      if (data.friendlySideSlots == null || data.friendlySideSlots < 1) {
        ctx.addIssue({ code: 'custom', message: "Обов'язково", path: ['friendlySideSlots'] });
      }
    });

const incrementVersion = (version: string, totalVersions: number): string => {
  return `v${totalVersions + 1}.0`;
};

const downloadFileFromUrl = async (url: string, fileName: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download ${url}`);
  }

  const blob = await response.blob();

  return new File([blob], fileName, { type: blob.type || 'application/octet-stream' });
};

const mapWeaponryByType = (version: MissionVersion, sideType: MissionGameSide): WeaponryFormItem[] =>
  (version.weaponry || [])
    .filter(w => w.type === sideType)
    .map(w => ({
      name: w.name,
      description: w.description || '',
      count: w.count,
      type: w.type,
    }));

const getLatestMissionVersion = (versions: MissionVersion[]) =>
  versions.reduce((latest, version) =>
    new Date(version.createdAt).getTime() > new Date(latest.createdAt).getTime() ? version : latest,
  );

const getTimeInputValue = (value?: string | null) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const LocalScreenshotPreview: FC<{ file: File }> = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [file]);

  if (!previewUrl) {
    return <div className="h-8 w-8 shrink-0 rounded border border-white/10 bg-zinc-800" aria-hidden />;
  }

  return (
    <img src={previewUrl} alt={file.name} className="h-8 w-8 rounded object-cover border border-white/10 shrink-0" />
  );
};

const CreateUpdateMissionVersionModal: FC<{
  state: CreateUpdateMissionVersionState;
  model?: CreateUpdateMissionVersionState;
  onSuccess?: () => void;
}> = observer(({ state: stateProp, model, onSuccess }) => {
  const state = stateProp ?? model!;
  const fileRef = useRef<HTMLInputElement>(null);
  const attackScreenshotsRef = useRef<HTMLInputElement>(null);
  const defenseScreenshotsRef = useRef<HTMLInputElement>(null);
  const friendlyScreenshotsRef = useRef<HTMLInputElement>(null);
  const payload = state.visibility?.payload;
  const missionId = payload?.missionId;
  const mission = payload?.mission;
  const editingVersion = payload?.version;
  const resolvedEditingScreenshots = editingVersion ? MissionModel.resolveUniformScreenshots(editingVersion) : null;
  const sideLabels = MissionModel.getMissionSideRoleLabels(mission?.missionObjective);

  const versionForm = useForm<VersionFormData>({
    mode: 'onChange',
    resolver: zodResolver(createVersionSchema(missionId || '')) as any,
    defaultValues: {
      version: '',
      missionId: missionId || '',
      attackSideType: MissionGameSide.BLUE,
      defenseSideType: MissionGameSide.RED,
      attackSideSlots: 0,
      defenseSideSlots: 0,
      minSlotsToPlay: null,
      attackSideName: '',
      defenseSideName: '',
      enableFriendlySide: false,
      friendlySideType: MissionGameSide.GREEN,
      friendlyTo: MissionGameSide.BLUE,
      friendlySideName: '',
      friendlySideSlots: null,
      file: null,
      attackScreenshots: [],
      defenseScreenshots: [],
      friendlyScreenshots: [],
      removeAttackScreenshotIds: [],
      removeDefenseScreenshotIds: [],
      removeFriendlyScreenshotIds: [],
      attackWeaponry: [],
      defenseWeaponry: [],
      friendlyWeaponry: [],
      inGameTime: '',
      weather: '',
      changelog: null,
    },
  });

  // Watch side types to reset weaponry when they change
  const attackSideType = versionForm.watch('attackSideType');
  const defenseSideType = versionForm.watch('defenseSideType');
  const friendlySideType = versionForm.watch('friendlySideType');
  const prevAttackSideType = useRef(attackSideType);
  const prevDefenseSideType = useRef(defenseSideType);
  const prevFriendlySideType = useRef(friendlySideType);

  useEffect(() => {
    // Reset weaponry arrays when side types change (but not on initial load)
    if (prevAttackSideType.current !== attackSideType && prevAttackSideType.current !== undefined) {
      versionForm.setValue('attackWeaponry', []);
    }
    if (prevDefenseSideType.current !== defenseSideType && prevDefenseSideType.current !== undefined) {
      versionForm.setValue('defenseWeaponry', []);
    }
    if (prevFriendlySideType.current !== friendlySideType && prevFriendlySideType.current !== undefined) {
      versionForm.setValue('friendlyWeaponry', []);
    }

    prevAttackSideType.current = attackSideType;
    prevDefenseSideType.current = defenseSideType;
    prevFriendlySideType.current = friendlySideType;
  }, [attackSideType, defenseSideType, friendlySideType]);

  // Autofill version form when dialog opens
  useEffect(() => {
    if (!state.visibility.isOpen || !missionId || !mission) return;

    if (editingVersion) {
      // Editing existing version
      const attackWeaponry = mapWeaponryByType(editingVersion, editingVersion.attackSideType);
      const defenseWeaponry = mapWeaponryByType(editingVersion, editingVersion.defenseSideType);

      versionForm.reset({
        version: editingVersion.version,
        missionId: missionId,
        attackSideType: editingVersion.attackSideType,
        defenseSideType: editingVersion.defenseSideType,
        attackSideSlots: editingVersion.attackSideSlots,
        defenseSideSlots: editingVersion.defenseSideSlots,
        minSlotsToPlay: editingVersion.minSlotsToPlay ?? null,
        attackSideName: editingVersion.attackSideName,
        defenseSideName: editingVersion.defenseSideName,
        enableFriendlySide: Boolean(editingVersion.friendlySideType),
        friendlySideType: editingVersion.friendlySideType ?? MissionGameSide.GREEN,
        friendlyTo: editingVersion.friendlyTo ?? editingVersion.attackSideType,
        friendlySideName: editingVersion.friendlySideName ?? '',
        friendlySideSlots: editingVersion.friendlySideSlots ?? null,
        file: null,
        attackScreenshots: [],
        defenseScreenshots: [],
        friendlyScreenshots: [],
        removeAttackScreenshotIds: [],
        removeDefenseScreenshotIds: [],
        removeFriendlyScreenshotIds: [],
        attackWeaponry,
        defenseWeaponry,
        friendlyWeaponry: editingVersion.friendlySideType
          ? mapWeaponryByType(editingVersion, editingVersion.friendlySideType)
          : [],
        inGameTime: getTimeInputValue(editingVersion.inGameTime),
        weather: editingVersion.weather ?? '',
        changelog: editingVersion.changelog ?? null,
      });

      // Initialize refs to current values to prevent reset on first render
      prevAttackSideType.current = editingVersion.attackSideType;
      prevDefenseSideType.current = editingVersion.defenseSideType;
      prevFriendlySideType.current = editingVersion.friendlySideType ?? MissionGameSide.GREEN;
    } else if (mission.missionVersions?.length > 0) {
      // Creating new version - autofill from previous
      const previousVersion = getLatestMissionVersion(mission.missionVersions);

      const newVersion = incrementVersion(previousVersion.version, mission.missionVersions.length);
      const attackWeaponry = mapWeaponryByType(previousVersion, previousVersion.attackSideType);
      const defenseWeaponry = mapWeaponryByType(previousVersion, previousVersion.defenseSideType);

      versionForm.reset({
        version: newVersion,
        missionId: missionId,
        attackSideType: previousVersion.attackSideType,
        defenseSideType: previousVersion.defenseSideType,
        attackSideSlots: previousVersion.attackSideSlots,
        defenseSideSlots: previousVersion.defenseSideSlots,
        minSlotsToPlay: previousVersion.minSlotsToPlay ?? null,
                attackSideName: previousVersion.attackSideName,
        defenseSideName: previousVersion.defenseSideName,
        enableFriendlySide: Boolean(previousVersion.friendlySideType),
        friendlySideType: previousVersion.friendlySideType ?? MissionGameSide.GREEN,
        friendlyTo: previousVersion.friendlyTo ?? previousVersion.attackSideType,
        friendlySideName: previousVersion.friendlySideName ?? '',
        friendlySideSlots: previousVersion.friendlySideSlots ?? null,
        file: null,
        attackScreenshots: [],
        defenseScreenshots: [],
        friendlyScreenshots: [],
        removeAttackScreenshotIds: [],
        removeDefenseScreenshotIds: [],
        removeFriendlyScreenshotIds: [],
        attackWeaponry,
        defenseWeaponry,
        friendlyWeaponry: previousVersion.friendlySideType
          ? mapWeaponryByType(previousVersion, previousVersion.friendlySideType)
          : [],
        inGameTime: getTimeInputValue(previousVersion.inGameTime),
        weather: previousVersion.weather ?? '',
        changelog: null,
      });

      prevAttackSideType.current = previousVersion.attackSideType;
      prevDefenseSideType.current = previousVersion.defenseSideType;
      prevFriendlySideType.current = previousVersion.friendlySideType ?? MissionGameSide.GREEN;

      const previousScreenshots = MissionModel.resolveUniformScreenshots(previousVersion);

      Promise.all([
        Promise.all(
          previousScreenshots.attack.map((screenshot, index) =>
            downloadFileFromUrl(screenshot.url, `${newVersion}-attack-uniform-${index + 1}-${screenshot.id}.jpg`),
          ),
        ),
        Promise.all(
          previousScreenshots.defense.map((screenshot, index) =>
            downloadFileFromUrl(screenshot.url, `${newVersion}-defense-uniform-${index + 1}-${screenshot.id}.jpg`),
          ),
        ),
        Promise.all(
          previousScreenshots.friendly.map((screenshot, index) =>
            downloadFileFromUrl(screenshot.url, `${newVersion}-friendly-uniform-${index + 1}-${screenshot.id}.jpg`),
          ),
        ),
      ])
        .then(([attackScreenshots, defenseScreenshots, friendlyScreenshots]) => {
          if (!state.visibility.isOpen || state.visibility.payload?.version) return;

          versionForm.setValue('attackScreenshots', attackScreenshots, { shouldValidate: true });
          versionForm.setValue('defenseScreenshots', defenseScreenshots, { shouldValidate: true });
          versionForm.setValue('friendlyScreenshots', friendlyScreenshots, { shouldValidate: true });
        })
        .catch(error => {
          console.error('Failed to copy previous mission version screenshots:', error);
        });
    } else {
      // Reset to defaults if no previous versions
      versionForm.reset({
        version: 'v1.0',
        missionId: missionId,
        attackSideType: MissionGameSide.BLUE,
        defenseSideType: MissionGameSide.RED,
        attackSideSlots: 0,
        defenseSideSlots: 0,
        minSlotsToPlay: null,
        attackSideName: '',
        defenseSideName: '',
        enableFriendlySide: false,
        friendlySideType: MissionGameSide.GREEN,
        friendlyTo: MissionGameSide.BLUE,
        friendlySideName: '',
        friendlySideSlots: null,
        file: null,
        attackScreenshots: [],
        defenseScreenshots: [],
        friendlyScreenshots: [],
        removeAttackScreenshotIds: [],
        removeDefenseScreenshotIds: [],
        removeFriendlyScreenshotIds: [],
        attackWeaponry: [],
        defenseWeaponry: [],
        friendlyWeaponry: [],
        inGameTime: '',
        weather: '',
        changelog: null,
      });

      // Initialize refs to current values
      prevAttackSideType.current = MissionGameSide.BLUE;
      prevDefenseSideType.current = MissionGameSide.RED;
      prevFriendlySideType.current = MissionGameSide.GREEN;
    }
  }, [state.visibility.isOpen, mission, editingVersion, missionId]);

  const handleSubmit = async (data: VersionFormData) => {
    if (!editingVersion && !data.file) {
      versionForm.setError('file', { message: "Обов'язково" });
      return;
    }

    try {
      await state.save(data, onSuccess);
    } catch (error) {
      // Error is handled in the model
    }
  };

  const handleClose = () => {
    state.visibility.close();
    // Reset refs when closing
    prevAttackSideType.current = undefined as any;
    prevDefenseSideType.current = undefined as any;
    prevFriendlySideType.current = undefined as any;
  };

  if (!missionId || !mission) return null;

  return (
    <Drawer open={state.visibility.isOpen} onOpenChange={state.visibility.switch}>
      <DrawerContent
        className="w-full max-w-full overflow-hidden sm:w-[60vw] sm:max-w-[60vw]"
        onPointerDownOutside={e => e.preventDefault()}
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}>
        <form className="flex min-h-0 flex-1 flex-col gap-4" onSubmit={versionForm.handleSubmit(handleSubmit)}>
          <DrawerHeader>
            <DrawerTitle>{editingVersion ? 'Редагувати версію' : 'Створити нову версію'}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
          <Controller
            control={versionForm.control}
            name="version"
            render={({ field }) => (
              <Input
                {...field}
                label="Версія"
                placeholder="v1.0"
                error={versionForm.formState.errors.version?.message}
              />
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              control={versionForm.control}
              name="inGameTime"
              render={({ field }) => (
                <Input
                  {...field}
                  type="time"
                  label="Ігровий час"
                  value={field.value || ''}
                  placeholder="HH:mm"
                />
              )}
            />
            <Controller
              control={versionForm.control}
              name="weather"
              render={({ field }) => (
                <Input {...field} label="Погода" value={field.value || ''} placeholder="Напр. дощ, туман, ясно" />
              )}
            />
          </div>

          <Controller
            control={versionForm.control}
            name="changelog"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Список змін (опційно)</label>
                <MessageEditor
                    key={
                      state.visibility.isOpen
                        ? `mission-version-changelog-${editingVersion?.id ?? 'new'}-${editingVersion?.updatedAt ?? ''}`
                        : 'mission-version-changelog-closed'
                    }
                  initialState={field.value}
                  placeholder="Що змінилось у цій версії..."
                  maxCharacters={2000}
                  showSubmit={false}
                  textFormattingOnly
                  allowLists
                  onChange={({ text, lexicalState }) => field.onChange(text ? lexicalState : null)}
                />
              </div>
            )}
          />

          {/* Sides and Weaponry in 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attack Side Column */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-white">{sideLabels.attackTitle}</h3>
              <Controller
                control={versionForm.control}
                name="attackSideType"
                render={({ field }) => (
                  <Select
                    label={sideLabels.attackTypeLabel}
                    options={sideTypeOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={versionForm.formState.errors.attackSideType?.message}
                  />
                )}
              />
              <Controller
                control={versionForm.control}
                name="attackSideName"
                render={({ field }) => (
                  <Input
                    {...field}
                    label={sideLabels.attackNameLabel}
                    error={versionForm.formState.errors.attackSideName?.message}
                  />
                )}
              />
              <Controller
                control={versionForm.control}
                name="attackSideSlots"
                render={({ field }) => (
                  <NumericInput
                    {...field}
                    label={sideLabels.attackSlotsLabel}
                    value={field.value || ''}
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                    error={versionForm.formState.errors.attackSideSlots?.message}
                  />
                )}
              />

              {/* Attack Side Weaponry */}
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-zinc-300">
                    Озброєння ({versionForm.watch('attackSideType')})
                  </h4>
                </div>
                {versionForm.watch('attackWeaponry').map((weaponry, index) => (
                  <div key={index} className="flex flex-col gap-2 p-3 rounded-lg border border-white/10 bg-black/40">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Controller
                            control={versionForm.control}
                            name={`attackWeaponry.${index}.name`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                label="Назва"
                                placeholder="Назва озброєння"
                                error={versionForm.formState.errors.attackWeaponry?.[index]?.name?.message}
                              />
                            )}
                          />
                          <Controller
                            control={versionForm.control}
                            name={`attackWeaponry.${index}.description`}
                            render={({ field }) => (
                              <Input {...field} label="Опис (опційно)" placeholder="Опис озброєння" />
                            )}
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <Controller
                            control={versionForm.control}
                            name={`attackWeaponry.${index}.count`}
                            render={({ field }) => (
                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-zinc-400">Кількість</label>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-9 w-9 p-0"
                                    onClick={() => {
                                      const current = field.value || 1;
                                      field.onChange(Math.max(1, current - 1));
                                    }}>
                                    <MinusIcon className="size-3" />
                                  </Button>
                                  <NumericInput
                                    {...field}
                                    value={field.value || ''}
                                    onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                                    className="w-20"
                                    min={1}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-9 w-9 p-0"
                                    onClick={() => {
                                      const current = field.value || 1;
                                      field.onChange(current + 1);
                                    }}>
                                    <PlusIcon className="size-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 mt-5 ml-auto"
                            onClick={() => {
                              const current = versionForm.getValues('attackWeaponry');
                              versionForm.setValue(
                                'attackWeaponry',
                                current.filter((_, i) => i !== index),
                              );
                            }}>
                            <TrashIcon className="size-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
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
                  <PlusIcon className="size-3" />
                  Додати
                </Button>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-semibold text-zinc-300">{sideLabels.attackScreenshotsLabel}</label>
                <Button type="button" variant="outline" size="sm" onClick={() => attackScreenshotsRef.current?.click()}>
                  <UploadIcon className="size-4" />
                  Завантажити скріншоти
                </Button>
                <input
                  ref={attackScreenshotsRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => {
                    const { accepted, rejected } = rejectOversizedUploadFiles(Array.from(e.target.files || []));
                    notifyOversizedUploadFiles(rejected);
                    if (!accepted.length) {
                      e.currentTarget.value = '';
                      return;
                    }
                    const current = versionForm.getValues('attackScreenshots');
                    versionForm.setValue('attackScreenshots', [...current, ...accepted], { shouldValidate: true });
                    e.currentTarget.value = '';
                  }}
                  className="invisible"
                />

                {resolvedEditingScreenshots?.attack
                  ?.filter(s => !versionForm.watch('removeAttackScreenshotIds').includes(s.id))
                  .map(screenshot => (
                    <div
                      key={screenshot.id}
                      className="flex items-center justify-between rounded border border-white/10 p-2">
                      <a
                        href={screenshot.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 min-w-0 text-xs underline">
                        <img
                          src={screenshot.url}
                          alt="Існуючий скріншот уніформи"
                          className="h-8 w-8 rounded object-cover border border-white/10 shrink-0"
                        />
                        <span className="truncate">Існуючий скріншот</span>
                      </a>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          versionForm.setValue(
                            'removeAttackScreenshotIds',
                            [...versionForm.getValues('removeAttackScreenshotIds'), screenshot.id],
                            { shouldValidate: true },
                          )
                        }>
                        <TrashIcon className="size-4 text-red-400" />
                      </Button>
                    </div>
                  ))}

                {versionForm.watch('attackScreenshots').map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded border border-white/10 p-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <LocalScreenshotPreview file={file} />
                      <span className="text-xs text-zinc-300 truncate">{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const current = versionForm.getValues('attackScreenshots');
                        versionForm.setValue(
                          'attackScreenshots',
                          current.filter((_, i) => i !== index),
                          { shouldValidate: true },
                        );
                      }}>
                      <TrashIcon className="size-4 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Defense Side Column */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-white">{sideLabels.defenseTitle}</h3>
              <Controller
                control={versionForm.control}
                name="defenseSideType"
                render={({ field }) => (
                  <Select
                    label={sideLabels.defenseTypeLabel}
                    options={sideTypeOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={versionForm.formState.errors.defenseSideType?.message}
                  />
                )}
              />
              <Controller
                control={versionForm.control}
                name="defenseSideName"
                render={({ field }) => (
                  <Input
                    {...field}
                    label={sideLabels.defenseNameLabel}
                    error={versionForm.formState.errors.defenseSideName?.message}
                  />
                )}
              />
              <Controller
                control={versionForm.control}
                name="defenseSideSlots"
                render={({ field }) => (
                  <NumericInput
                    {...field}
                    label={sideLabels.defenseSlotsLabel}
                    value={field.value || ''}
                    error={versionForm.formState.errors.defenseSideSlots?.message}
                  />
                )}
              />

              {/* Defense Side Weaponry */}
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-zinc-300">
                    Озброєння ({versionForm.watch('defenseSideType')})
                  </h4>
                </div>
                {versionForm.watch('defenseWeaponry').map((weaponry, index) => (
                  <div key={index} className="flex flex-col gap-2 p-3 rounded-lg border border-white/10 bg-black/40">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Controller
                            control={versionForm.control}
                            name={`defenseWeaponry.${index}.name`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                label="Назва"
                                placeholder="Назва озброєння"
                                error={versionForm.formState.errors.defenseWeaponry?.[index]?.name?.message}
                              />
                            )}
                          />
                          <Controller
                            control={versionForm.control}
                            name={`defenseWeaponry.${index}.description`}
                            render={({ field }) => (
                              <Input {...field} label="Опис (опційно)" placeholder="Опис озброєння" />
                            )}
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <Controller
                            control={versionForm.control}
                            name={`defenseWeaponry.${index}.count`}
                            render={({ field }) => (
                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-zinc-400">Кількість</label>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-9 w-9 p-0"
                                    onClick={() => {
                                      const current = field.value || 1;
                                      field.onChange(Math.max(1, current - 1));
                                    }}>
                                    <MinusIcon className="size-3" />
                                  </Button>
                                  <NumericInput
                                    {...field}
                                    value={field.value || ''}
                                    onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                                    className="w-20"
                                    min={1}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-9 w-9 p-0"
                                    onClick={() => {
                                      const current = field.value || 1;
                                      field.onChange(current + 1);
                                    }}>
                                    <PlusIcon className="size-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 mt-5 ml-auto"
                            onClick={() => {
                              const current = versionForm.getValues('defenseWeaponry');
                              versionForm.setValue(
                                'defenseWeaponry',
                                current.filter((_, i) => i !== index),
                              );
                            }}>
                            <TrashIcon className="size-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
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
                  <PlusIcon className="size-3" />
                  Додати
                </Button>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-semibold text-zinc-300">{sideLabels.defenseScreenshotsLabel}</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => defenseScreenshotsRef.current?.click()}>
                  <UploadIcon className="size-4" />
                  Завантажити скріншоти
                </Button>
                <input
                  ref={defenseScreenshotsRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => {
                    const { accepted, rejected } = rejectOversizedUploadFiles(Array.from(e.target.files || []));
                    notifyOversizedUploadFiles(rejected);
                    if (!accepted.length) {
                      e.currentTarget.value = '';
                      return;
                    }
                    const current = versionForm.getValues('defenseScreenshots');
                    versionForm.setValue('defenseScreenshots', [...current, ...accepted], { shouldValidate: true });
                    e.currentTarget.value = '';
                  }}
                  className="invisible"
                />

                {resolvedEditingScreenshots?.defense
                  ?.filter(s => !versionForm.watch('removeDefenseScreenshotIds').includes(s.id))
                  .map(screenshot => (
                    <div
                      key={screenshot.id}
                      className="flex items-center justify-between rounded border border-white/10 p-2">
                      <a
                        href={screenshot.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 min-w-0 text-xs underline">
                        <img
                          src={screenshot.url}
                          alt="Існуючий скріншот уніформи"
                          className="h-8 w-8 rounded object-cover border border-white/10 shrink-0"
                        />
                        <span className="truncate">Існуючий скріншот</span>
                      </a>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          versionForm.setValue(
                            'removeDefenseScreenshotIds',
                            [...versionForm.getValues('removeDefenseScreenshotIds'), screenshot.id],
                            { shouldValidate: true },
                          )
                        }>
                        <TrashIcon className="size-4 text-red-400" />
                      </Button>
                    </div>
                  ))}

                {versionForm.watch('defenseScreenshots').map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded border border-white/10 p-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <LocalScreenshotPreview file={file} />
                      <span className="text-xs text-zinc-300 truncate">{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const current = versionForm.getValues('defenseScreenshots');
                        versionForm.setValue(
                          'defenseScreenshots',
                          current.filter((_, i) => i !== index),
                          { shouldValidate: true },
                        );
                      }}>
                      <TrashIcon className="size-4 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Третя (союзна) сторона</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const enabled = !versionForm.getValues('enableFriendlySide');
                  versionForm.setValue('enableFriendlySide', enabled);
                  if (!enabled) {
                    versionForm.setValue('friendlySideName', '');
                    versionForm.setValue('friendlySideSlots', null);
                    versionForm.setValue('friendlyWeaponry', []);
                    versionForm.setValue('friendlyScreenshots', []);
                    versionForm.setValue('removeFriendlyScreenshotIds', []);
                  } else {
                    versionForm.setValue('friendlyTo', versionForm.getValues('attackSideType'));
                  }
                }}>
                {versionForm.watch('enableFriendlySide') ? 'Прибрати' : 'Додати сторону'}
              </Button>
            </div>

            {versionForm.watch('enableFriendlySide') && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Controller
                    control={versionForm.control}
                    name="friendlySideType"
                    render={({ field }) => (
                      <Select
                        label="Тип союзної сторони"
                        options={sideTypeOptions}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    control={versionForm.control}
                    name="friendlyTo"
                    render={({ field }) => (
                      <Select
                        label="Союзник до"
                        options={[
                          {
                            value: versionForm.watch('attackSideType'),
                            label: `${sideLabels.attack} (${versionForm.watch('attackSideType')})`,
                          },
                          {
                            value: versionForm.watch('defenseSideType'),
                            label: `${sideLabels.defense} (${versionForm.watch('defenseSideType')})`,
                          },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    control={versionForm.control}
                    name="friendlySideName"
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Назва союзної сторони"
                        error={versionForm.formState.errors.friendlySideName?.message}
                      />
                    )}
                  />
                  <Controller
                    control={versionForm.control}
                    name="friendlySideSlots"
                    render={({ field }) => (
                      <NumericInput
                        {...field}
                        label="Слоти союзної сторони"
                        value={field.value || ''}
                        error={versionForm.formState.errors.friendlySideSlots?.message}
                      />
                    )}
                  />
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-zinc-300">
                      Озброєння ({versionForm.watch('friendlySideType')})
                    </h4>
                  </div>
                  {versionForm.watch('friendlyWeaponry').map((weaponry, index) => (
                    <div key={index} className="flex flex-col gap-2 p-3 rounded-lg border border-white/10 bg-black/40">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Controller
                              control={versionForm.control}
                              name={`friendlyWeaponry.${index}.name`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  label="Назва"
                                  placeholder="Назва озброєння"
                                  error={versionForm.formState.errors.friendlyWeaponry?.[index]?.name?.message}
                                />
                              )}
                            />
                            <Controller
                              control={versionForm.control}
                              name={`friendlyWeaponry.${index}.description`}
                              render={({ field }) => (
                                <Input {...field} label="Опис (опційно)" placeholder="Опис озброєння" />
                              )}
                            />
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <Controller
                              control={versionForm.control}
                              name={`friendlyWeaponry.${index}.count`}
                              render={({ field }) => (
                                <div className="flex flex-col gap-1">
                                  <label className="text-xs font-semibold text-zinc-400">Кількість</label>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-9 w-9 p-0"
                                      onClick={() => {
                                        const current = field.value || 1;
                                        field.onChange(Math.max(1, current - 1));
                                      }}>
                                      <MinusIcon className="size-3" />
                                    </Button>
                                    <NumericInput
                                      {...field}
                                      value={field.value || ''}
                                      onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                                      className="w-20"
                                      min={1}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-9 w-9 p-0"
                                      onClick={() => {
                                        const current = field.value || 1;
                                        field.onChange(current + 1);
                                      }}>
                                      <PlusIcon className="size-3" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 mt-5 ml-auto"
                              onClick={() => {
                                const current = versionForm.getValues('friendlyWeaponry');
                                versionForm.setValue(
                                  'friendlyWeaponry',
                                  current.filter((_, i) => i !== index),
                                );
                              }}>
                              <TrashIcon className="size-4 text-red-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = versionForm.getValues('friendlyWeaponry');
                      versionForm.setValue('friendlyWeaponry', [
                        ...current,
                        {
                          name: '',
                          description: '',
                          count: 1,
                          type: versionForm.getValues('friendlySideType') || MissionGameSide.GREEN,
                        },
                      ]);
                    }}>
                    <PlusIcon className="size-3" />
                    Додати
                  </Button>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-sm font-semibold text-zinc-300">Скріншоти уніформи (союзник)</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => friendlyScreenshotsRef.current?.click()}>
                    <UploadIcon className="size-4" />
                    Завантажити скріншоти
                  </Button>
                  <input
                    ref={friendlyScreenshotsRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => {
                      const { accepted, rejected } = rejectOversizedUploadFiles(Array.from(e.target.files || []));
                      notifyOversizedUploadFiles(rejected);
                      if (!accepted.length) {
                        e.currentTarget.value = '';
                        return;
                      }
                      const current = versionForm.getValues('friendlyScreenshots');
                      versionForm.setValue('friendlyScreenshots', [...current, ...accepted], { shouldValidate: true });
                      e.currentTarget.value = '';
                    }}
                    className="invisible"
                  />

                  {resolvedEditingScreenshots?.friendly
                    ?.filter(s => !versionForm.watch('removeFriendlyScreenshotIds').includes(s.id))
                    .map(screenshot => (
                      <div
                        key={screenshot.id}
                        className="flex items-center justify-between rounded border border-white/10 p-2">
                        <a
                          href={screenshot.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 min-w-0 text-xs underline">
                          <img
                            src={screenshot.url}
                            alt="Існуючий скріншот уніформи"
                            className="h-8 w-8 rounded object-cover border border-white/10 shrink-0"
                          />
                          <span className="truncate">Існуючий скріншот</span>
                        </a>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            versionForm.setValue(
                              'removeFriendlyScreenshotIds',
                              [...versionForm.getValues('removeFriendlyScreenshotIds'), screenshot.id],
                              { shouldValidate: true },
                            )
                          }>
                          <TrashIcon className="size-4 text-red-400" />
                        </Button>
                      </div>
                    ))}

                  {versionForm.watch('friendlyScreenshots').map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between rounded border border-white/10 p-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <LocalScreenshotPreview file={file} />
                        <span className="text-xs text-zinc-300 truncate">{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const current = versionForm.getValues('friendlyScreenshots');
                          versionForm.setValue(
                            'friendlyScreenshots',
                            current.filter((_, i) => i !== index),
                            { shouldValidate: true },
                          );
                        }}>
                        <TrashIcon className="size-4 text-red-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {mission.missionType === MissionType.mini && (
            <Controller
              control={versionForm.control}
              name="minSlotsToPlay"
              render={({ field }) => (
                <NumericInput
                  label="Мін. слотів для гри (опційно)"
                  value={field.value ?? ''}
                  onChange={e => {
                    const value = e.target.value;
                    field.onChange(value === '' ? null : parseInt(value, 10) || null);
                  }}
                  error={versionForm.formState.errors.minSlotsToPlay?.message}
                />
              )}
            />
          )}

          <Controller
            control={versionForm.control}
            name="file"
            render={({ field: { onChange, value, ...field } }) => (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">
                  Файл місії {editingVersion && '(залиште порожнім, щоб не змінювати)'}
                </label>
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={e => {
                    e.preventDefault();
                    fileRef.current?.click();
                  }}>
                  <UploadIcon className="size-4" />
                  {value ? 'Змінити файл' : 'Обрати файл'}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pbo,.p3d"
                  onChange={e => onChange(resolveUploadFileFromInput(e.target.files?.[0], e.currentTarget))}
                  className="invisible"
                />
                {versionForm.formState.errors.file && (
                  <p className="text-sm text-red-400">{versionForm.formState.errors.file.message}</p>
                )}
              </div>
            )}
          />
          </DrawerBody>

          <DrawerFooter className="border-t border-white/10 pt-4 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={handleClose}>
              Скасувати
            </Button>
            <Button type="submit" disabled={state.loader.isLoading || !versionForm.formState.isValid}>
              {state.loader.isLoading ? (
                <>
                  <LoaderIcon className="size-4 animate-spin" />
                  {editingVersion ? 'Збереження...' : 'Створення...'}
                </>
              ) : editingVersion ? (
                'Зберегти зміни'
              ) : (
                'Створити версію'
              )}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
});

export { CreateUpdateMissionVersionModal };
