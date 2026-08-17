'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/organisms/drawer';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useMemo, FC, useState } from 'react';
import { LoaderIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { CreateMissionState, MissionFormData } from '../state/create-mission.state';
import { Select } from '@/shared/ui/atoms/select';
import { islandsApi, usersApi } from '@/shared/sdk';
import {
  Island,
  MissionCommentMessage,
  MissionObjective,
  MissionObjectiveSchema,
  MissionType,
  MissionTypeSchema,
  User,
} from '@/shared/sdk/types';
import { Section } from '@/shared/ui/organisms/section';
import { mapUsersToSelectOptions } from '@/entities/user/ui/user-select-options';
import { session } from '@/entities/session/session.state';
import { MessageEditor } from '@/features/chat/editor';
import { getMessageText } from '@/entities/comment/lexical-message';
import { MissionImageField } from '@/app/missions/ui/mission-image-field';
import { MissionModel } from '@/entities/mission/mission.model';

const missionSchema = z.object({
  name: z.string().min(1, "Назва є обов'язковою"),
  description: z
    .custom<MissionCommentMessage | null>()
    .nullable()
    .refine(value => Boolean(value && getMessageText(value).trim()), {
      message: "Опис є обов'язковим",
    }),
  islandId: z.string().min(1, "Карта є обов'язковою"),
  missionType: MissionTypeSchema,
  missionObjective: MissionObjectiveSchema,
  coauthorIds: z.array(z.string()).default([]),
  image: z.instanceof(File).nullable().default(null),
});

const CreateMissionModal: FC<{
  state: CreateMissionState;
  model?: CreateMissionState;
  onSuccess?: (missionId: string) => void;
}> = observer(({ state: stateProp, model, onSuccess }) => {
  const state = stateProp ?? model!;
  const [croppedPreview, setCroppedPreview] = useState<string>('');
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [islands, setIslands] = useState<Island[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingIslands, setIsLoadingIslands] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const currentUserId = session.user?.data?.id;

  const islandsOptions = islands.map(island => ({
    value: island.id,
    label: island.name,
  }));
  const coauthorOptions = useMemo(
    () => mapUsersToSelectOptions(users.filter(user => user.id !== currentUserId)),
    [currentUserId, users],
  );

  const missionForm = useForm<MissionFormData>({
    mode: 'onChange',
    resolver: zodResolver(missionSchema) as any,
    defaultValues: {
      name: '',
      description: null,
      islandId: '',
      missionType: MissionType.SG,
      missionObjective: MissionObjective.ATTACK_DEFEND,
      image: null,
      coauthorIds: [],
    },
  });

  useEffect(() => {
    if (state.visibility.isOpen) {
      const loadIslands = async () => {
        try {
          setIsLoadingIslands(true);
          const response = await islandsApi.findIslands();
          setIslands(response.data);
        } catch (error) {
          console.error('Failed to load islands:', error);
        } finally {
          setIsLoadingIslands(false);
        }
      };
      const loadUsers = async () => {
        try {
          setIsLoadingUsers(true);
          const response = await usersApi.findUsers({ take: 1000, skip: 0 });
          setUsers(response.data.data);
        } catch (error) {
          console.error('Failed to load users:', error);
        } finally {
          setIsLoadingUsers(false);
        }
      };

      loadIslands();
      loadUsers();
      missionForm.reset({
        name: '',
        description: null,
        islandId: '',
        missionType: MissionType.SG,
        missionObjective: MissionObjective.ATTACK_DEFEND,
        image: null,
        coauthorIds: [],
      });
      setCroppedPreview('');
      setCroppedImageFile(null);
    }
  }, [state.visibility.isOpen]);

  const handleCropped = (file: File, previewUrl: string) => {
    if (croppedPreview) {
      URL.revokeObjectURL(croppedPreview);
    }
    setCroppedImageFile(file);
    setCroppedPreview(previewUrl);
    missionForm.setValue('image', file, { shouldDirty: true, shouldValidate: true });
  };

  const handleSubmit = async (data: MissionFormData) => {
    try {
      let imageFile: File | null = croppedImageFile;

      if (!imageFile && data.image) {
        imageFile = data.image;
      }

      await state.save(data, imageFile, onSuccess);
      if (croppedPreview) {
        URL.revokeObjectURL(croppedPreview);
      }
      setCroppedPreview('');
      setCroppedImageFile(null);
    } catch {
      // Error is handled in the model
    }
  };

  const handleClose = () => {
    state.visibility.close();
    if (croppedPreview) {
      URL.revokeObjectURL(croppedPreview);
    }
    setCroppedPreview('');
    setCroppedImageFile(null);
    missionForm.reset({
      name: '',
      description: null,
      islandId: '',
      missionType: MissionType.SG,
      image: null,
      coauthorIds: [],
    });
  };

  const { isDirty } = missionForm.formState;
  const shouldBlockDismiss = isDirty || Boolean(croppedImageFile);

  return (
    <Drawer
      open={state.visibility.isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
      }}>
      <DrawerContent
        className="w-full max-w-full overflow-hidden sm:w-[60vw] sm:max-w-[60vw]"
        onEscapeKeyDown={event => {
          if (shouldBlockDismiss) event.preventDefault();
        }}>
        <form className="flex min-h-0 flex-1 flex-col gap-4" onSubmit={missionForm.handleSubmit(handleSubmit)}>
          <DrawerHeader>
            <DrawerTitle>Створити місію</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <div className="flex flex-wrap gap-4">
              <div className="min-w-0 flex-1 basis-[280px]">
                <MissionImageField
                  key={state.visibility.isOpen ? 'create-mission-image-open' : 'create-mission-image-closed'}
                  previewUrl={croppedPreview || null}
                  onCropped={handleCropped}
                />
              </div>

              <div className="flex min-w-0 flex-1 basis-[280px] flex-col gap-4">
                <Controller
                  control={missionForm.control}
                  name="name"
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Назва місії"
                      autoFocus
                      error={missionForm.formState.errors.name?.message}
                    />
                  )}
                />

                <Controller
                  control={missionForm.control}
                  name="islandId"
                  render={({ field }) => (
                    <Select
                      label="Карта"
                      localSearch
                      resultsClassName="max-h-[150px] overflow-y-auto"
                      options={islandsOptions}
                      value={field.value || null}
                      onChange={field.onChange}
                      isLoading={isLoadingIslands}
                      error={missionForm.formState.errors.islandId?.message}
                    />
                  )}
                />

                <Controller
                  control={missionForm.control}
                  name="missionType"
                  render={({ field }) => (
                    <Select
                      label="Тип місії"
                      options={[
                        { value: MissionType.SG, label: MissionModel.missionTypeLabels[MissionType.SG] },
                        { value: MissionType.mini, label: MissionModel.missionTypeLabels[MissionType.mini] },
                      ]}
                      value={field.value || null}
                      onChange={field.onChange}
                      error={missionForm.formState.errors.missionType?.message as string | undefined}
                    />
                  )}
                />

                <Controller
                  control={missionForm.control}
                  name="missionObjective"
                  render={({ field }) => (
                    <Select
                      label="Тип бою"
                      options={[
                        {
                          value: MissionObjective.ATTACK_DEFEND,
                          label: MissionModel.missionObjectiveLabels[MissionObjective.ATTACK_DEFEND],
                        },
                        {
                          value: MissionObjective.ENCOUTER_BATTLE,
                          label: MissionModel.missionObjectiveLabels[MissionObjective.ENCOUTER_BATTLE],
                        },
                      ]}
                      value={field.value || null}
                      onChange={field.onChange}
                      error={missionForm.formState.errors.missionObjective?.message as string | undefined}
                    />
                  )}
                />

                <Controller
                  control={missionForm.control}
                  name="coauthorIds"
                  render={({ field }) => (
                    <Select
                      multiple
                      label="Співавтори"
                      resultsClassName="max-h-[150px] overflow-y-auto"
                      localSearch
                      placeholder="Без співавторів"
                      options={coauthorOptions}
                      value={field.value || []}
                      onChange={field.onChange}
                      isLoading={isLoadingUsers}
                    />
                  )}
                />
              </div>

              <div className="flex w-full basis-full flex-col gap-4">
                <Controller
                  control={missionForm.control}
                  name="description"
                  render={({ field }) => (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-zinc-300">Опис місії</label>
                      <MessageEditor
                        key={
                          state.visibility.isOpen
                            ? 'create-mission-description-open'
                            : 'create-mission-description-closed'
                        }
                        initialState={field.value}
                        placeholder="Опишіть місію..."
                        maxCharacters={2000}
                        showSubmit={false}
                        textFormattingOnly
                        onChange={({ lexicalState }) => field.onChange(lexicalState)}
                      />
                      {missionForm.formState.errors.description?.message && (
                        <p className="text-sm text-red-400">{missionForm.formState.errors.description.message}</p>
                      )}
                    </div>
                  )}
                />

                <Section className="text-center p-2 text-sm text-muted">
                  Після створення місії ви зможете додати її першу версію
                </Section>
              </div>
            </div>
          </DrawerBody>

          <DrawerFooter className="border-t border-white/10 pt-4 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={handleClose}>
              Скасувати
            </Button>
            <Button type="submit" disabled={state.loader.isLoading || !missionForm.formState.isValid}>
              {state.loader.isLoading ? (
                <>
                  <LoaderIcon className="size-4 animate-spin" />
                  Створення...
                </>
              ) : (
                'Створити місію'
              )}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
});

export { CreateMissionModal };
