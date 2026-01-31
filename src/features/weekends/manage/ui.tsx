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
import { Input, NumericInput } from '@/shared/ui/atoms/input';
import { Select } from '@/shared/ui/atoms/select';
import { CreateWeekendDto, CreateGameDto, Weekend } from '@/shared/sdk/types';
import { api } from '@/shared/sdk';
import { Mission, MissionVersion, Side, User } from '@/shared/sdk/types';
import { Controller, Resolver, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Switch } from '@/shared/ui/atoms/switch';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon } from 'lucide-react';

const defaultGame: CreateGameDto = {
  name: '',
  date: '',
  position: 0,
  missionId: '',
  missionVersionId: '',
  attackSideId: '',
  defenseSideId: '',
  adminId: null,
};

const gameSchema = yup.object().shape({
  name: yup.string().required("Назва є обов'язковою"),
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
  description: yup.string().required("Опис є обов'язковим"),
  published: yup.boolean(),
  publishedAt: yup.string().nullable(),
  games: yup.array().of(gameSchema).min(1, 'Додайте щонайменше одну гру'),
});

type GameFormItem = CreateGameDto & { id?: string };

type WeekendFormValues = {
  name: string;
  description: string;
  published: boolean;
  publishedAt: string;
  games: GameFormItem[];
};

const ManageWeekendModal: FC<
  PropsWithChildren<{
    model?: ManageWeekendModel;
    onCreateSuccess?: (weekend: Weekend) => void;
    onUpdateSuccess?: (weekend: Weekend) => void;
    onDeleteSuccess?: (weekend: Weekend) => void;
  }>
> = observer(({ model = manageWeekendModel, children, onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [sides, setSides] = useState<Side[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'games',
  });

  const fetchOptions = useCallback(async () => {
    try {
      const [missionsRes, sidesRes, usersRes] = await Promise.all([
        api.findMissions({ take: 200 }),
        api.findSides({ take: 200 }),
        api.findUsers({ take: 200 }),
      ]);
      setMissions(
        (missionsRes.data as { data?: Mission[] })?.data ?? (Array.isArray(missionsRes.data) ? missionsRes.data : []),
      );
      setSides((sidesRes.data as { data?: Side[] })?.data ?? (Array.isArray(sidesRes.data) ? sidesRes.data : []));
      setUsers((usersRes.data as { data?: User[] })?.data ?? (Array.isArray(usersRes.data) ? usersRes.data : []));
    } catch {
      setMissions([]);
      setSides([]);
      setUsers([]);
    }
  }, []);

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
        const toUpdate = data.games.filter(g => g.id);
        const toCreate = data.games.filter(g => !g.id);

        for (const g of toDelete) {
          await api.deleteGame(weekendId, g.id);
        }
        for (const g of toUpdate) {
          if (!g.id) continue;
          await api.updateGame(weekendId, g.id, {
            name: g.name,
            date: g.date,
            position: g.position,
            missionId: g.missionId,
            missionVersionId: g.missionVersionId,
            attackSideId: g.attackSideId,
            defenseSideId: g.defenseSideId,
            adminId: g.adminId ?? null,
          });
        }
        for (const g of toCreate) {
          await api.createGame(weekendId, {
            name: g.name,
            date: g.date,
            position: g.position,
            missionId: g.missionId,
            missionVersionId: g.missionVersionId,
            attackSideId: g.attackSideId,
            defenseSideId: g.defenseSideId,
            adminId: g.adminId ?? null,
          });
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
        games: data.games.map(g => ({
          name: g.name,
          date: g.date,
          position: g.position,
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
      fetchOptions();
      if (model.modal.payload?.weekend) {
        const w = model.modal.payload.weekend;
        const games: GameFormItem[] = (w.games ?? []).length
          ? (w.games ?? []).map(g => ({
              id: g.id,
              name: g.name,
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
  }, [model.modal.isOpen, model.modal.payload?.weekend, fetchOptions]);

  const missionOptions = missions.map(m => ({ label: m.name, value: m.id }));
  const sideOptions = sides.map(s => ({ label: s.name, value: s.id }));
  const userOptions = users.map(u => ({ label: u.nickname, value: u.id }));

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
                  <Input {...field} label="Опис" error={form.formState.errors.description?.message} />
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
                  <Input
                    {...field}
                    type="datetime-local"
                    label="Дата публікації (необов'язково)"
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
                <div className="flex flex-col gap-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="rounded-lg border border-neutral-700 p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Гра {index + 1}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 1}>
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Controller
                          control={form.control}
                          name={`games.${index}.name`}
                          render={({ field: f }) => (
                            <Input
                              {...f}
                              label="Назва дня"
                              placeholder="П'ятниця 1-а"
                              error={form.formState.errors.games?.[index]?.name?.message}
                            />
                          )}
                        />
                        <Controller
                          control={form.control}
                          name={`games.${index}.date`}
                          render={({ field: f }) => (
                            <Input
                              {...f}
                              type="datetime-local"
                              label="Дата"
                              error={form.formState.errors.games?.[index]?.date?.message}
                            />
                          )}
                        />
                        <Controller
                          control={form.control}
                          name={`games.${index}.position`}
                          render={({ field: f }) => (
                            <NumericInput
                              {...f}
                              label="Позиція"
                              min={0}
                              error={form.formState.errors.games?.[index]?.position?.message}
                            />
                          )}
                        />
                        <Controller
                          control={form.control}
                          name={`games.${index}.missionId`}
                          render={({ field: f }) => (
                            <Select
                              label="Місія"
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
                            const missionId = form.watch(`games.${index}.missionId`);
                            const versionOptions = getVersionOptionsForMission(missionId ?? '');
                            return (
                              <Select
                                label="Версія місії"
                                options={versionOptions}
                                value={f.value || null}
                                onChange={v => f.onChange(v ?? '')}
                                error={form.formState.errors.games?.[index]?.missionVersionId?.message}
                              />
                            );
                          }}
                        />

                        <Controller
                          control={form.control}
                          name={`games.${index}.adminId`}
                          render={({ field: f }) => (
                            <Select
                              label="Адмін гри (необов'язково)"
                              options={[{ label: '— Не обрано', value: '' }, ...userOptions]}
                              value={f.value || ''}
                              onChange={v => f.onChange(v === '' ? null : v)}
                              error={form.formState.errors.games?.[index]?.adminId?.message}
                            />
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
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
