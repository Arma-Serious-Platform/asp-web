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
import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { manageWeekendModel, ManageWeekendModel } from './model';
import { DateInput, Input } from '@/shared/ui/atoms/input';
import { Select } from '@/shared/ui/atoms/select';
import { CreateWeekendDto, CreateGameDto, Weekend, UserStatus, UserRole } from '@/shared/sdk/types';
import { api } from '@/shared/sdk';
import { Mission, MissionVersion, Side, User } from '@/shared/sdk/types';
import { Controller, Resolver, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Switch } from '@/shared/ui/atoms/switch';
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

const defaultGame: CreateGameDto = {
  date: '',
  position: 0,
  missionId: '',
  missionVersionId: '',
  attackSideId: '',
  defenseSideId: '',
  adminId: null,
};

const gameSchema = yup.object().shape({
  date: yup.string().required("Дата є обов'язковою"),
  position: yup.number().required().min(0),
  missionId: yup.string().required("Місія є обов'язковою"),
  missionVersionId: yup.string().required("Версія місії є обов'язковою"),
  attackSideId: yup.string().required("Сторона атаки є обов'язковою"),
  defenseSideId: yup.string().required("Сторона оборони є обов'язковою"),
  adminId: yup.string().nullable(),
});

const schema = yup.object().shape({
  name: yup.string().required("Назва є обов'язковою"),
  description: yup.string().optional(),
  published: yup.boolean(),
  publishedAt: yup.string().nullable(),
  games: yup.array().of(gameSchema).min(1, 'Додайте щонайменше одну гру'),
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
  fetchMissionVersions: (missionId: string) => void;
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
  fetchMissionVersions,
  onRemove,
  canRemove,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-neutral-700 p-3 space-y-3">
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
      <div className="flex flex-col gap-4">
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
                onChange={v => {
                  f.onChange(v ?? '');
                  form.setValue(`games.${index}.missionVersionId`, '');
                  if (v) fetchMissionVersions(v);
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
                label="Сторона атаки"
                options={sideOptions}
                value={f.value || null}
                onChange={v => f.onChange(v ?? '')}
                error={form.formState.errors.games?.[index]?.attackSideId?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name={`games.${index}.defenseSideId`}
            render={({ field: f }) => (
              <Select
                label="Сторона оборони"
                options={sideOptions}
                value={f.value || null}
                onChange={v => f.onChange(v ?? '')}
                error={form.formState.errors.games?.[index]?.defenseSideId?.message}
              />
            )}
          />
        </div>
        <Controller
          control={form.control}
          name={`games.${index}.adminId`}
          render={({ field: f }) => (
            <Select
              label="Ігровий адміністратор (опційно)"
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
    model?: ManageWeekendModel;
    onCreateSuccess?: (weekend: Weekend) => void;
    onUpdateSuccess?: (weekend: Weekend) => void;
    onDeleteSuccess?: (weekend: Weekend) => void;
  }>
> = observer(({ model = manageWeekendModel, children, onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) => {
  const [missionVersionsCache, setMissionVersionsCache] = useState<Record<string, MissionVersion[]>>({});

  const form = useForm<WeekendFormValues>({
    resolver: yupResolver(schema) as Resolver<WeekendFormValues>,
    defaultValues: {
      name: '',
      description: '',
      published: false,
      publishedAt: '',
      games: [{ ...defaultGame }],
    },
  });

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
    if (!missionId) return;
    try {
      const { data } = await api.findMissionById(missionId);
      const versions = data?.missionVersions ?? [];
      setMissionVersionsCache(prev => ({ ...prev, [missionId]: versions }));
    } catch {
      setMissionVersionsCache(prev => ({ ...prev, [missionId]: [] }));
    }
  }, []);

  const isEdit = Boolean(model.modal.payload?.weekend?.id);

  const onSubmit = async (data: WeekendFormValues) => {
    const weekendId = model.modal.payload?.weekend?.id;

    if (isEdit && weekendId) {
      try {
        model.loader.start();
        await api.updateWeekend(weekendId, {
          name: data.name,
          description: data.description,
          published: data.published,
          publishedAt: data.publishedAt || null,
        });

        const originalGames = model.modal.payload?.weekend?.games ?? [];
        const currentIds = data.games.filter(g => g.id).map(g => g.id as string);
        const toDelete = originalGames.filter(g => !currentIds.includes(g.id));
        
        // Process games in order to maintain correct positions
        // Position is based on the index in the data.games array (which reflects drag-and-drop order)
        for (let index = 0; index < data.games.length; index++) {
          const g = data.games[index];
          
          if (g.id) {
            // Update existing game
            await api.updateGame(weekendId, g.id, {
              date: g.date,
              position: index,
              missionId: g.missionId,
              missionVersionId: g.missionVersionId,
              attackSideId: g.attackSideId,
              defenseSideId: g.defenseSideId,
              adminId: g.adminId ?? null,
            });
          } else {
            // Create new game
            await api.createGame(weekendId, {
              date: g.date,
              position: index,
              missionId: g.missionId,
              missionVersionId: g.missionVersionId,
              attackSideId: g.attackSideId,
              defenseSideId: g.defenseSideId,
              adminId: g.adminId ?? null,
            });
          }
        }
        
        // Delete removed games
        for (const g of toDelete) {
          await api.deleteGame(weekendId, g.id);
        }

        toast.success('Анонс успішно оновлений');
        model.modal.close();
        onUpdateSuccess?.(await api.findWeekendById(weekendId).then(r => r.data));
      } catch {
        toast.error('Не вдалося оновити анонс');
      } finally {
        model.loader.stop();
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
        })),
        published: data.published,
        publishedAt: data.publishedAt || null,
      };
      model.createWeekend(createDto, onCreateSuccess);
    }
  };

  useEffect(() => {
    if (model.modal.isOpen) {
      model.init();
      if (model.modal.payload?.weekend) {
        const w = model.modal.payload.weekend;
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
          name: '',
          description: '',
          published: false,
          publishedAt: '',
          games: [{ ...defaultGame }],
        });
      }
    } else {
      form.reset({ name: '', description: '', published: false, publishedAt: '', games: [{ ...defaultGame }] });
      model.modal.clearPayload();
    }
  }, [model.modal.isOpen, model.modal.payload?.weekend]);

  const missionOptions = model.missions.options;
  const sideOptions = model.sides.options;
  const userOptions = model.users.options;

  const getVersionOptionsForMission = (missionId: string) =>
    (missionVersionsCache[missionId] ?? []).map(v => ({ label: v.version, value: v.id }));

  return (
    <>
      <Dialog open={model.modal.isOpen && model.modal?.payload?.mode !== 'delete'} onOpenChange={model.modal.switch}>
        <DialogOverlay />
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Редагувати анонс' : 'Створити анонс'}</DialogTitle>
          </DialogHeader>

          <form className="flex flex-col gap-2" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <Controller
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Input {...field} autoFocus label="Назва" error={form.formState.errors.name?.message} />
                )}
              />
              <Controller
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Input {...field} label="Опис (необов'язково)" error={form.formState.errors.description?.message} />
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
              <Controller
                control={form.control}
                name="publishedAt"
                render={({ field }) => (
                  <DateInput
                    {...field}
                    label="Дата публікації (опційно)"
                    error={form.formState.errors.publishedAt?.message}
                  />
                )}
              />

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
                    <div className="flex flex-col gap-4">
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
                          fetchMissionVersions={fetchMissionVersions}
                          onRemove={() => remove(index)}
                          canRemove={fields.length > 1}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" type="button" onClick={() => model.modal.close()}>
                Скасувати
              </Button>
              <Button type="submit" disabled={model.loader.isLoading}>
                {model?.modal?.payload?.weekend ? 'Зберегти' : 'Створити'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={model.modal.isOpen && model.modal?.payload?.mode === 'delete'} onOpenChange={model.modal.switch}>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Видалити анонс{' '}
              {model.modal?.payload?.weekend?.name ? (
                <span className="text-green-500">{model.modal.payload.weekend.name}</span>
              ) : (
                <span className="text-muted-foreground">(без назви)</span>
              )}
              ?
            </DialogTitle>
          </DialogHeader>

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => model.modal.close()}>
              Скасувати
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                model.deleteWeekend(model.modal?.payload?.weekend?.id ?? '', onDeleteSuccess);
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
