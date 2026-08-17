'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/shared/ui/organisms/drawer';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useMemo, FC, PropsWithChildren, useState } from 'react';
import { LoaderIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { UpdateMissionState, MissionFormData } from '../state/update-mission.state';
import { Select } from '@/shared/ui/atoms/select';
import { islandsApi, usersApi } from '@/shared/sdk';
import { Island, MissionCommentMessage, MissionObjective, MissionObjectiveSchema, MissionType, MissionTypeSchema, User } from '@/shared/sdk/types';
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

const UpdateMissionModal: FC<
  PropsWithChildren<{
    state: UpdateMissionState;
    model?: UpdateMissionState;
    onSuccess?: () => void;
  }>
> = observer(({ state: stateProp, model, children, onSuccess }) => {
  const state = stateProp ?? model!;
  const [croppedPreview, setCroppedPreview] = useState<string>('');
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [islands, setIslands] = useState<Island[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingIslands, setIsLoadingIslands] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const payload = state.visibility?.payload;
  const mission = payload?.mission;
  const currentUserId = session.user?.data?.id;
  const isCurrentUserCoauthor = Boolean(
    currentUserId && mission?.coauthors?.some(coauthor => coauthor.id === currentUserId),
  );
  const canUpdateCoauthors = !isCurrentUserCoauthor;

  const islandsOptions = islands.map(island => ({
    value: island.id,
    label: island.name,
  }));
  const coauthorOptions = useMemo(() => {
    const usersById = new Map<string, User>();

    [...users, ...(mission?.coauthors ?? [])].forEach(user => {
      usersById.set(user.id, user);
    });

    return mapUsersToSelectOptions([...usersById.values()].filter(user => user.id !== mission?.authorId));
  }, [users, mission]);

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

      if (mission) {
        missionForm.reset({
          name: mission.name,
          description: mission.description,
          islandId: mission?.island?.id || '',
          missionType: mission.missionType || MissionType.SG,
          missionObjective: mission.missionObjective || MissionObjective.ATTACK_DEFEND,
          image: null,
          coauthorIds: mission.coauthors?.map(coauthor => coauthor.id) ?? [],
        });
        if (croppedPreview) {
          URL.revokeObjectURL(croppedPreview);
        }
        setCroppedPreview('');
        setCroppedImageFile(null);
      }
    }
  }, [state.visibility.isOpen, mission]);

  const handleCropped = (file: File, previewUrl: string) => {
    if (croppedPreview) {
      URL.revokeObjectURL(croppedPreview);
    }
    setCroppedImageFile(file);
    setCroppedPreview(previewUrl);
    missionForm.setValue('image', null);
  };

  const handleSubmit = async (data: MissionFormData) => {
    if (!mission) return;

    try {
      let imageFile: File | null = croppedImageFile;

      if (!imageFile && data.image) {
        imageFile = data.image;
      }

      await state.save(data, imageFile, canUpdateCoauthors, onSuccess);
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
    if (mission) {
      missionForm.reset({
        name: mission.name,
        description: mission.description,
        islandId: mission?.island?.id || '',
        missionType: mission.missionType || MissionType.SG,
        image: null,
        coauthorIds: mission.coauthors?.map(coauthor => coauthor.id) ?? [],
      });
    }
  };

  if (!mission) return null;

  return (
    <Drawer
      open={state.visibility.isOpen}
      onOpenChange={open => {
        if (!open) handleClose();
      }}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerContent className="w-full max-w-full overflow-hidden sm:w-[60vw] sm:max-w-[60vw]">
        <form className="flex min-h-0 flex-1 flex-col gap-4" onSubmit={missionForm.handleSubmit(handleSubmit)}>
          <DrawerHeader>
            <DrawerTitle>Редагувати місію</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <div className="flex flex-wrap gap-4">
              <div className="min-w-0 flex-1 basis-[280px]">
                <MissionImageField
                  key={
                    state.visibility.isOpen
                      ? `update-mission-image-${mission.id}-${mission.updatedAt}`
                      : 'update-mission-image-closed'
                  }
                  previewUrl={croppedPreview || null}
                  existingUrl={mission.image?.url}
                  onCropped={handleCropped}
                />
              </div>

              <div className="flex min-w-0 flex-1 basis-[280px] flex-col gap-4">
                <Controller
                  control={missionForm.control}
                  name="name"
                  render={({ field }) => (
                    <Input {...field} label="Назва місії" error={missionForm.formState.errors.name?.message} />
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
                    <div className="flex flex-col gap-2">
                      <Select
                        multiple
                        label="Співавтори"
                        localSearch
                        resultsClassName="max-h-[150px] overflow-y-auto"
                        placeholder="Без співавторів"
                        options={coauthorOptions}
                        value={field.value || []}
                        onChange={field.onChange}
                        isLoading={isLoadingUsers}
                        disabled={!canUpdateCoauthors}
                      />
                      {!canUpdateCoauthors && (
                        <p className="text-xs text-zinc-500">Співавтор не може змінювати список співавторів місії.</p>
                      )}
                    </div>
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
                            ? `update-mission-description-${mission.id}-${mission.updatedAt}`
                            : 'update-mission-description-closed'
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
                  Збереження...
                </>
              ) : (
                'Зберегти зміни'
              )}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
});

export { UpdateMissionModal };
