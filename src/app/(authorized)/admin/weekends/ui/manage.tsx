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
import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { manageWeekendState, ManageWeekendState } from '../state/manage-weekends.state';
import { DateInput, Input } from '@/shared/ui/atoms/input';
import { Select } from '@/shared/ui/atoms/select';
import { CreateWeekendDto, CreateGameDto, Weekend } from '@/shared/sdk/types';
import { missionsApi, weekendsApi } from '@/shared/sdk';
import { MissionVersion } from '@/shared/sdk/types';
import { Controller, Resolver, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Switch } from '@/shared/ui/atoms/switch';
import { mapUsersToSelectOptions } from '@/entities/user/ui/user-select-options';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon, GripVerticalIcon } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import dayjs from 'dayjs';
import { UserModel } from '@/entities/user/user.model';
import { MissionModel } from '@/entities/mission/mission.model';

const defaultGame: CreateGameDto = {
  date: '',
  position: 0,
  missionId: '',
  missionVersionId: '',
  attackSideId: '',
  defenseSideId: '',
  adminId: null,
  attackHqSquadId: '',
  defenseHqSquadId: '',
};

const gameSchema = z
  .object({
    date: z.string().min(1, "Дата є обов'язковою"),
    position: z.number().min(0),
    missionId: z.string().min(1, "Місія є обов'язковою"),
    missionVersionId: z.string().min(1, "Версія місії є обов'язковою"),
    attackSideId: z.string().min(1, "Сторона атаки є обов'язковою"),
    defenseSideId: z.string().min(1, "Сторона оборони є обов'язковою"),
    adminId: z.string().nullable(),
    attackHqSquadId: z.string().min(1, "Штабний загін атаки є обов'язковим"),
    defenseHqSquadId: z.string().min(1, "Штабний загін оборони є обов'язковим"),
  })
  .refine(data => !data.defenseSideId || !data.attackSideId || data.defenseSideId !== data.attackSideId, {
    message: 'Сторона оборони не може співпадати зі стороною атаки',
    path: ['defenseSideId'],
  });

const schema = z.object({
  name: z.string().min(1, "Назва є обов'язковою"),
  description: z.string().optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().nullable(),
  games: z.array(gameSchema).min(1, 'Додайте щонайменше одну гру'),
});

type GameFormItem = CreateGameDto & { id?: string };

type WeekendFormValues = {
  name: string;
  description?: string;
  published: boolean;
  publishedAt: string;
  games: GameFormItem[];
};

type SortableGameItemProps = {
  id: string;
  index: number;
  form: any;
  missionOptions: Array<{ label: string; value: string }>;
  sideOptions: Array<{ label: string; value: string }>;
  userOptions: Array<{ label: string; value: string }>;
  getVersionOptionsForMission: (missionId: string) => Array<{ label: string; value: string }>;
  getMissionVersion: (missionId: string, versionId: string) => MissionVersion | undefined;
  getSquadOptionsForSide: (sideId: string) => Array<{ label: string; value: string }>;
  fetchMissionVersions: (missionId: string) => Promise<MissionVersion[]>;
  onRemove: () => void;
  canRemove: boolean;
};

const SortableGameItem: FC<SortableGameItemProps> = ({
  id,
  index,
  form,
  missionOptions,
  sideOptions,
  userOptions,
  getVersionOptionsForMission,
  getMissionVersion,
  getSquadOptionsForSide,
  fetchMissionVersions,
  onRemove,
  canRemove,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const missionId = form.watch(`games.${index}.missionId`) as string;
  const missionVersionId = form.watch(`games.${index}.missionVersionId`) as string;
  const sideAssignmentLabels = MissionModel.getMissionVersionSideAssignmentLabels(
    getMissionVersion(missionId ?? '', missionVersionId ?? ''),
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-neutral-700 p-3 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-200">
            <GripVerticalIcon className="w-5 h-5" />
          </button>
          <span className="text-xs text-muted-foreground">Гра {index + 1}</span>
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-red-500"
          onClick={onRemove}
          disabled={!canRemove}>
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-col gap-6">
        <Controller
          control={form.control}
          name={`games.${index}.date`}
          render={({ field: f }) => (
            <DateInput {...f} mode="date" label="Дата" error={form.formState.errors.games?.[index]?.date?.message} />
          )}
        />
        <div className="flex gap-2">
          <Controller
            control={form.control}
            name={`games.${index}.missionId`}
            render={({ field: f }) => (
              <Select
                label="Місія"
                localSearch
                options={missionOptions}
                value={f.value || null}
                onChange={async v => {
                  f.onChange(v ?? '');
                  form.setValue(`games.${index}.missionVersionId`, '');
                  if (!v) return;

                  const versions = await fetchMissionVersions(v);
                  const latestVersion = [...versions].sort(
                    (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf(),
                  )[0];

                  if (latestVersion?.id) {
                    form.setValue(`games.${index}.missionVersionId`, latestVersion.id);
                  }
                }}
                error={form.formState.errors.games?.[index]?.missionId?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name={`games.${index}.missionVersionId`}
            render={({ field: f }) => {
              const missionId = form.watch(`games.${index}.missionId`) as string;
              const versionOptions = getVersionOptionsForMission(missionId ?? '');

              return (
                <Select
                  label="Версія місії"
                  options={versionOptions}
                  value={f.value || null}
                  disabled={!missionId}
                  onChange={v => f.onChange(v ?? '')}
                  error={form.formState.errors.games?.[index]?.missionVersionId?.message}
                />
              );
            }}
          />
        </div>

        <div className="flex gap-2">
          <Controller
            control={form.control}
            name={`games.${index}.attackSideId`}
            render={({ field: f }) => (
              <Select
                label={sideAssignmentLabels.attack}
                options={sideOptions}
                value={f.value || null}
                onChange={v => {
                  f.onChange(v ?? '');
                  form.setValue(`games.${index}.attackHqSquadId`, '');
                }}
                error={form.formState.errors.games?.[index]?.attackSideId?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name={`games.${index}.defenseSideId`}
            render={({ field: f }) => (
              <Select
                label={sideAssignmentLabels.defense}
                options={sideOptions}
                value={f.value || null}
                onChange={v => {
                  f.onChange(v ?? '');
                  form.setValue(`games.${index}.defenseHqSquadId`, '');
                }}
                error={form.formState.errors.games?.[index]?.defenseSideId?.message}
              />
            )}
          />
        </div>
        <div className="flex gap-2">
          <Controller
            control={form.control}
            name={`games.${index}.attackHqSquadId`}
            render={({ field: f }) => {
              const attackSideId = form.watch(`games.${index}.attackSideId`) as string;
              const squadOptions = getSquadOptionsForSide(attackSideId ?? '');

              return (
                <Select
                  label={`Штабний загін (${sideAssignmentLabels.attack})`}
                  localSearch
                  options={squadOptions}
                  value={f.value || null}
                  disabled={!attackSideId}
                  onChange={v => f.onChange(v ?? '')}
                  error={form.formState.errors.games?.[index]?.attackHqSquadId?.message}
                />
              );
            }}
          />
          <Controller
            control={form.control}
            name={`games.${index}.defenseHqSquadId`}
            render={({ field: f }) => {
              const defenseSideId = form.watch(`games.${index}.defenseSideId`) as string;
              const squadOptions = getSquadOptionsForSide(defenseSideId ?? '');

              return (
                <Select
                  label={`Штабний загін (${sideAssignmentLabels.defense})`}
                  localSearch
                  options={squadOptions}
                  value={f.value || null}
                  disabled={!defenseSideId}
                  onChange={v => f.onChange(v ?? '')}
                  error={form.formState.errors.games?.[index]?.defenseHqSquadId?.message}
                />
              );
            }}
          />
        </div>
        <Controller
          control={form.control}
          name={`games.${index}.adminId`}
          render={({ field: f }) => (
            <Select
              label="Ігровий адміністратор (опційно)"
              localSearch
              placeholder="Оберіть користувача"
              options={[{ label: '— Не обрано', value: '' }, ...userOptions]}
              value={f.value || ''}
              onChange={v => f.onChange(v === '' ? null : v)}
              error={form.formState.errors.games?.[index]?.adminId?.message}
            />
          )}
        />
      </div>
    </div>
  );
};

const ManageWeekendModal: FC<
  PropsWithChildren<{
    state?: ManageWeekendState;
    onCreateSuccess?: (weekend: Weekend) => void;
    onUpdateSuccess?: (weekend: Weekend) => void;
    onDeleteSuccess?: (weekend: Weekend) => void;
  }>
> = observer(({ state = manageWeekendState, children, onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) => {
  const [missionVersionsCache, setMissionVersionsCache] = useState<Record<string, MissionVersion[]>>({});

  const form = useForm<WeekendFormValues>({
    resolver: zodResolver(schema) as Resolver<WeekendFormValues>,
    defaultValues: {
      name: `Анонс ігор VTG ${dayjs(new Date()).format('DD.MM.YYYY')}`,
      description: '',
      published: false,
      publishedAt: '',
      games: [{ ...defaultGame }],
    },
  });

  const { isDirty } = form.formState;

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'games',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex(field => field.id === active.id);
      const newIndex = fields.findIndex(field => field.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  const fetchMissionVersions = useCallback(async (missionId: string) => {
    if (!missionId) return [];

    try {
      const { data } = await missionsApi.findMissionById(missionId);
      const versions = data?.missionVersions ?? [];
      setMissionVersionsCache(prev => ({ ...prev, [missionId]: versions }));
      return versions;
    } catch {
      setMissionVersionsCache(prev => ({ ...prev, [missionId]: [] }));
      return [];
    }
  }, []);

  const isEdit = Boolean(state.modal.payload?.weekend?.id);

  const onSubmit = async (data: WeekendFormValues) => {
    const weekendId = state.modal.payload?.weekend?.id;

    if (isEdit && weekendId) {
      try {
        state.loader.start();
        await weekendsApi.updateWeekend(weekendId, {
          name: data.name,
          description: data.description,
          published: data.published,
          publishedAt: data.publishedAt || null,
        });

        const originalGames = state.modal.payload?.weekend?.games ?? [];
        const currentIds = data.games.filter(g => g.id).map(g => g.id as string);
        const toDelete = originalGames.filter(g => !currentIds.includes(g.id));

        // Process games in order to maintain correct positions
        // Position is based on the index in the data.games array (which reflects drag-and-drop order)
        for (let index = 0; index < data.games.length; index++) {
          const g = data.games[index];

          if (g.id) {
            // Update existing game
            await weekendsApi.updateGame(weekendId, g.id, {
              date: g.date,
              position: index,
              missionId: g.missionId,
              missionVersionId: g.missionVersionId,
              attackSideId: g.attackSideId,
              defenseSideId: g.defenseSideId,
              adminId: g.adminId ?? null,
              attackHqSquadId: g.attackHqSquadId || null,
              defenseHqSquadId: g.defenseHqSquadId || null,
            });
          } else {
            // Create new game
            await weekendsApi.createGame(weekendId, {
              date: g.date,
              position: index,
              missionId: g.missionId,
              missionVersionId: g.missionVersionId,
              attackSideId: g.attackSideId,
              defenseSideId: g.defenseSideId,
              adminId: g.adminId ?? null,
              attackHqSquadId: g.attackHqSquadId || null,
              defenseHqSquadId: g.defenseHqSquadId || null,
            });
          }
        }

        // Delete removed games
        for (const g of toDelete) {
          await weekendsApi.deleteGame(weekendId, g.id);
        }

        toast.success('Анонс успішно оновлений');
        state.modal.close();
        onUpdateSuccess?.(await weekendsApi.findWeekendById(weekendId).then(r => r.data));
      } catch {
        toast.error('Не вдалося оновити анонс');
      } finally {
        state.loader.stop();
      }
    } else {
      const createDto: CreateWeekendDto = {
        name: data.name,
        description: data.description,
        games: data.games.map((g, index) => ({
          date: g.date,
          position: index,
          missionId: g.missionId,
          missionVersionId: g.missionVersionId,
          attackSideId: g.attackSideId,
          defenseSideId: g.defenseSideId,
          adminId: g.adminId ?? null,
          attackHqSquadId: g.attackHqSquadId || null,
          defenseHqSquadId: g.defenseHqSquadId || null,
        })),
        published: data.published,
        publishedAt: data.publishedAt || null,
      };
      state.createWeekend(createDto, onCreateSuccess);
    }
  };

  useEffect(() => {
    if (state.modal.isOpen) {
      state.init();
      if (state.modal.payload?.weekend) {
        const w = state.modal.payload.weekend;
        const games: GameFormItem[] = (w.games ?? []).length
          ? (w.games ?? [])
              .sort((a, b) => a.position - b.position)
              .map(g => ({
                id: g.id,
                date: g.date,
                position: g.position,
                missionId: g.missionId,
                missionVersionId: g.missionVersionId,
                attackSideId: g.attackSideId,
                defenseSideId: g.defenseSideId,
                adminId: g.adminId ?? null,
                attackHqSquadId: g.attackHqSquadId ?? '',
                defenseHqSquadId: g.defenseHqSquadId ?? '',
              }))
          : [{ ...defaultGame }];
        games.forEach(g => g.missionId && fetchMissionVersions(g.missionId));
        form.reset({
          name: w.name ?? '',
          description: w.description ?? '',
          published: w.published ?? false,
          publishedAt: w.publishedAt ? w.publishedAt.slice(0, 16) : '',
          games,
        });
      } else {
        form.reset({
          name: `Анонс ігор VTG ${dayjs(new Date()).format('DD.MM.YYYY')}`,
          description: '',
          published: false,
          publishedAt: '',
          games: [{ ...defaultGame }],
        });
      }
    } else {
      form.reset({
        name: `Анонс ігор VTG ${dayjs(new Date()).format('DD.MM.YYYY')}`,
        description: '',
        published: false,
        publishedAt: '',
        games: [{ ...defaultGame }],
      });
      state.modal.clearPayload();
    }
  }, [state.modal.isOpen, state.modal.payload?.weekend]);

  const missionOptions = state.missions.options;
  const sideOptions = state.sides.options.filter(s => s.label !== 'Unassigned');
  const userOptions = mapUsersToSelectOptions(
    state.users.pagination.data.filter(user => UserModel.canAdminMission(user.data)),
  );

  const getVersionOptionsForMission = (missionId: string) =>
    [...(missionVersionsCache[missionId] ?? [])]
      .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
      .map(v => ({ label: v.version, value: v.id }));

  const getMissionVersion = (missionId: string, versionId: string) =>
    (missionVersionsCache[missionId] ?? []).find(version => version.id === versionId);

  const getSquadOptionsForSide = (sideId: string) =>
    state.squads.pagination.data
      .filter(squad => squad.data.sideId === sideId || squad.data.side?.id === sideId)
      .map(squad => ({
        label: squad.data.tag,
        value: squad.id,
      }));

  return (
    <>
      <Drawer open={state.modal.isOpen && state.modal?.payload?.mode !== 'delete'} onOpenChange={state.modal.switch}>
        {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
        <DrawerContent
          className="w-full max-w-full overflow-hidden sm:w-[60vw] sm:max-w-[60vw]"
          onPointerDownOutside={event => {
            if (isDirty) event.preventDefault();
          }}
          onInteractOutside={event => {
            if (isDirty) event.preventDefault();
          }}
          onEscapeKeyDown={event => {
            if (isDirty) event.preventDefault();
          }}>
          <form className="flex min-h-0 flex-1 flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <DrawerHeader>
              <DrawerTitle>{isEdit ? 'Редагувати анонс' : 'Створити анонс'}</DrawerTitle>
            </DrawerHeader>

            <DrawerBody className="gap-6">
              <Controller
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Input
                    {...field}
                    autoFocus
                    placeholder={`Анонс ігор VTG ${dayjs(new Date()).format('DD.MM.YYYY')}`}
                    label="Назва"
                    error={form.formState.errors.name?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Було оновлення збірки..."
                    label="Опис (необов'язково)"
                    error={form.formState.errors.description?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="published"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                    <span className="text-sm">Опубліковано</span>
                  </div>
                )}
              />
              {/* <Controller
                control={form.control}
                name="publishedAt"
                render={({ field }) => (
                  <DateInput
                    {...field}
                    label="Дата публікації (опційно)"
                    error={form.formState.errors.publishedAt?.message}
                  />
                )}
              /> */}

              <div className="border-t border-neutral-700 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Ігри</span>
                  <Button type="button" size="sm" variant="secondary" onClick={() => append({ ...defaultGame })}>
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Додати гру
                  </Button>
                </div>
                {form.formState.errors.games?.message && (
                  <p className="text-sm text-destructive mb-2">{form.formState.errors.games.message}</p>
                )}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-6">
                      {fields.map((field, index) => (
                        <SortableGameItem
                          key={field.id}
                          id={field.id}
                          index={index}
                          form={form}
                          missionOptions={missionOptions}
                          sideOptions={sideOptions}
                          userOptions={userOptions}
                          getVersionOptionsForMission={getVersionOptionsForMission}
                          getMissionVersion={getMissionVersion}
                          getSquadOptionsForSide={getSquadOptionsForSide}
                          fetchMissionVersions={fetchMissionVersions}
                          onRemove={() => remove(index)}
                          canRemove={fields.length > 1}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </DrawerBody>

            <DrawerFooter className="border-t border-white/10 pt-4 sm:flex-row sm:justify-between">
              <Button variant="outline" type="button" onClick={() => state.modal.close()}>
                Скасувати
              </Button>
              <Button type="submit" disabled={state.loader.isLoading}>
                {state?.modal?.payload?.weekend ? 'Зберегти' : 'Створити'}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      <Dialog open={state.modal.isOpen && state.modal?.payload?.mode === 'delete'} onOpenChange={state.modal.switch}>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Видалити анонс{' '}
              {state.modal?.payload?.weekend?.name ? (
                <span className="text-green-500">{state.modal.payload.weekend.name}</span>
              ) : (
                <span className="text-muted-foreground">(без назви)</span>
              )}
              ?
            </DialogTitle>
          </DialogHeader>

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => state.modal.close()}>
              Скасувати
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                state.deleteWeekend(state.modal?.payload?.weekend?.id ?? '', onDeleteSuccess);
              }}>
              Видалити
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

export { ManageWeekendModal };
