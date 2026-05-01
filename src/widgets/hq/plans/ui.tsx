'use client';

import { session } from '@/entities/session/model';
import { ROUTES } from '@/shared/config/routes';
import { env } from '@/shared/config/env';
import { api } from '@/shared/sdk';
import {
  Game,
  HeadquartersComment,
  HeadquartersGamePlan,
  HeadquartersSlot,
  MissionCommentMessage,
  Side,
  SideType,
  Squad,
  User,
  UserRole,
  Weekend,
} from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Input, NumericInput } from '@/shared/ui/atoms/input';
import { Avatar } from '@/shared/ui/organisms/avatar';
import { Select } from '@/shared/ui/atoms/select';
import { cn } from '@/shared/utils/cn';
import { UserNicknameText } from '@/entities/user/ui/user-text';
import { MissionImagePanel } from '@/entities/mission/mission-image-panel/ui';
import { MissionDetails } from '@/entities/mission/mission-details/ui';
import { MessageContent } from '@/entities/comment/lexical-message';
import { MessageEditor } from '@/features/chat/editor';
import { getTokensFromLocalStorage } from '@/shared/utils/session';
import dayjs from 'dayjs';
import { ChevronDownIcon, ChevronUpIcon, LoaderIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

type HqPlansProps = {
  activePlanId?: string;
};

const normalizeSlotCount = (value: number | null | undefined) => (typeof value === 'number' ? value : 0);

export function HqPlans({ activePlanId }: HqPlansProps) {
  const router = useRouter();
  const currentUser = session.user.user;
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<HeadquartersGamePlan[]>([]);
  const [usersById, setUsersById] = useState<Record<string, User>>({});
  const [squadsById, setSquadsById] = useState<Record<string, Squad>>({});
  const [gamesById, setGamesById] = useState<Record<string, Game>>({});
  const [sidesById, setSidesById] = useState<Record<string, Side>>({});
  const [isSlotsOpen, setIsSlotsOpen] = useState(true);
  const [comments, setComments] = useState<HeadquartersComment[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isCommentSending, setIsCommentSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const hasAccess = Boolean(
    currentUser?.squad && [SideType.BLUE, SideType.RED].includes(currentUser?.squad?.side?.type as SideType),
  );

  const currentSide = currentUser?.squad?.side?.type;
  const currentSquad = currentUser?.squad;
  const isAdmin = [UserRole.OWNER, UserRole.TECH_ADMIN].includes(currentUser?.role as UserRole);

  const selectedPlan = useMemo(() => plans.find(plan => plan.id === activePlanId) ?? null, [activePlanId, plans]);
  const selectedCommander = selectedPlan?.gameCommanderId ? usersById[selectedPlan.gameCommanderId] : null;
  const isCommander = Boolean(currentUser?.id && selectedPlan?.gameCommanderId === currentUser.id);
  const canEditCommanderFields = isCommander;

  useEffect(() => {
    if (!hasAccess) {
      router.replace(ROUTES.home);
    }
  }, [hasAccess, router]);

  useEffect(() => {
    if (!hasAccess) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const [weekendsRes, usersRes, squadsRes, sidesRes] = await Promise.all([
          api.findWeekends({ take: 100, skip: 0 }),
          api.findUsers({ take: 1000, skip: 0 }),
          api.findSquads({ take: 1000, skip: 0 }),
          api.findSides({ take: 1000, skip: 0 }),
        ]);

        const users = usersRes.data.data ?? [];
        const squads = squadsRes.data.data ?? [];
        const sides = sidesRes.data.data ?? [];
        setUsersById(Object.fromEntries(users.map(user => [user.id, user])));
        setSquadsById(Object.fromEntries(squads.map(squad => [squad.id, squad])));
        setSidesById(Object.fromEntries(sides.map(side => [side.id, side])));

        const weekends = weekendsRes.data.data ?? [];
        const games = weekends.flatMap((weekend: Weekend) => weekend.games ?? []);
        setGamesById(Object.fromEntries(games.map(game => [game.id, game])));
        const plansByGame = await Promise.allSettled(games.map(game => api.findHeadquartersPlansByGame(game.id)));
        const loadedPlans = plansByGame.flatMap(result =>
          result.status === 'fulfilled' ? (result.value.data ?? []) : ([] as HeadquartersGamePlan[]),
        );

        const filtered = loadedPlans
          .filter(plan => plan.side?.type === currentSide)
          .sort((a, b) => dayjs(a.game?.date).valueOf() - dayjs(b.game?.date).valueOf());

        setPlans(filtered);

        if (!activePlanId && filtered[0]?.id) {
          router.replace(`/hq/plans/${filtered[0].id}`);
        }
      } catch (error) {
        console.error(error);
        toast.error('Не вдалося завантажити плани штабу');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [activePlanId, currentSide, hasAccess, router]);

  const replacePlan = (nextPlan: HeadquartersGamePlan) => {
    setPlans(prev => prev.map(item => (item.id === nextPlan.id ? nextPlan : item)));
  };

  const replaceSlot = (slot: HeadquartersSlot) => {
    if (!selectedPlan) return;
    replacePlan({
      ...selectedPlan,
      slots: selectedPlan.slots.map(item => (item.id === slot.id ? slot : item)),
    });
  };

  const updateSlotField = async (slotId: string, dto: Parameters<typeof api.updateHeadquartersSlot>[1]) => {
    try {
      const { data } = await api.updateHeadquartersSlot(slotId, dto);
      replaceSlot(data);
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося оновити слот');
    }
  };

  const updatePlanUrl = async (value: string) => {
    if (!selectedPlan) return;
    try {
      const { data } = await api.updateHeadquartersPlan(selectedPlan.id, { planUrl: value || null });
      replacePlan(data);
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося оновити посилання на план');
    }
  };

  const squadOptions = useMemo(
    () =>
      Object.values(squadsById)
        .filter(squad => squad.side?.type === currentSide)
        .map(squad => ({
          value: squad.id,
          label: squad.tag,
        })),
    [currentSide, squadsById],
  );

  const syncAssignedSquads = async (slot: HeadquartersSlot, nextSquadIds: string[]) => {
    const currentSquadIds = slot.assignedSquads.map(squad => squad.id);
    const toAssign = nextSquadIds.filter(id => !currentSquadIds.includes(id));
    const toUnassign = currentSquadIds.filter(id => !nextSquadIds.includes(id));

    try {
      let latestSlot = slot;

      for (const squadId of toAssign) {
        const { data } = await api.assignHeadquartersSlotSquad(slot.id, { squadId });
        latestSlot = data;
      }

      for (const squadId of toUnassign) {
        const { data } = await api.unassignHeadquartersSlotSquad(slot.id, { squadId });
        latestSlot = data;
      }

      replaceSlot(latestSlot);
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося оновити бронювання');
    }
  };

  const totalSlots = useMemo(
    () => selectedPlan?.slots.reduce((sum, slot) => sum + normalizeSlotCount(slot.slotCount), 0) ?? 0,
    [selectedPlan],
  );

  const totalOccupied = totalSlots;
  const selectedGame = selectedPlan?.gameId ? gamesById[selectedPlan.gameId] : undefined;
  const attackSide = selectedGame?.attackSideId ? sidesById[selectedGame.attackSideId] : undefined;
  const defenseSide = selectedGame?.defenseSideId ? sidesById[selectedGame.defenseSideId] : undefined;

  const sideColorClass = (sideType?: SideType) => {
    if (sideType === SideType.BLUE) return 'text-blue-400';
    if (sideType === SideType.RED) return 'text-red-400';
    return 'text-zinc-300';
  };

  const loadComments = async (gamePlanId: string) => {
    setIsCommentsLoading(true);
    try {
      const { data } = await api.findHeadquartersComments(gamePlanId, { take: 100, skip: 0 });
      setComments(data.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося завантажити коментарі');
    } finally {
      setIsCommentsLoading(false);
    }
  };

  useEffect(() => {
    const gamePlanId = selectedPlan?.id;
    if (!gamePlanId) {
      setComments([]);
      return;
    }

    void loadComments(gamePlanId);
  }, [selectedPlan?.id]);

  useEffect(() => {
    const gamePlanId = selectedPlan?.id;
    if (!gamePlanId) {
      return;
    }

    const token = getTokensFromLocalStorage()?.token;
    const apiBaseUrl = env.apiUrl?.replace(/\/api\/?$/, '');
    if (!token || !apiBaseUrl) {
      return;
    }

    const socket =
      socketRef.current ??
      io(`${apiBaseUrl}/headquarters`, {
        auth: { token },
        transports: ['websocket'],
      });

    socketRef.current = socket;

    const handleGamePlanUpdated = (payload: HeadquartersGamePlan) => {
      if (!payload?.id || payload.id !== gamePlanId) return;
      replacePlan(payload);
    };

    const handleCommanderChanged = (payload: HeadquartersGamePlan) => {
      if (!payload?.id || payload.id !== gamePlanId) return;
      replacePlan(payload);
    };

    const handleSlotUpdated = (payload: HeadquartersSlot) => {
      if (!payload?.id) return;
      replaceSlot(payload);
    };

    const handleCommentCreated = (payload: HeadquartersComment) => {
      if (!payload?.id) return;
      setComments(prev => (prev.some(item => item.id === payload.id) ? prev : [payload, ...prev]));
    };

    const handleCommentUpdated = (payload: HeadquartersComment) => {
      if (!payload?.id) return;
      setComments(prev => prev.map(item => (item.id === payload.id ? payload : item)));
    };

    const handleCommentDeleted = (payload: { id: string }) => {
      if (!payload?.id) return;
      setComments(prev => prev.filter(item => item.id !== payload.id));
    };

    const joinRoom = () => {
      socket.emit('join_game_plan', { gamePlanId }, (response?: { success?: boolean; error?: string }) => {
        if (response?.error) {
          console.error('Failed to join headquarters game plan room:', response.error);
        }
      });
    };

    socket.on('connect', joinRoom);
    socket.on('game_plan_updated', handleGamePlanUpdated);
    socket.on('commander_changed', handleCommanderChanged);
    socket.on('slot_updated', handleSlotUpdated);
    socket.on('comment_created', handleCommentCreated);
    socket.on('comment_updated', handleCommentUpdated);
    socket.on('comment_deleted', handleCommentDeleted);
    joinRoom();

    return () => {
      socket.emit('leave_game_plan', { gamePlanId });
      socket.off('connect', joinRoom);
      socket.off('game_plan_updated', handleGamePlanUpdated);
      socket.off('commander_changed', handleCommanderChanged);
      socket.off('slot_updated', handleSlotUpdated);
      socket.off('comment_created', handleCommentCreated);
      socket.off('comment_updated', handleCommentUpdated);
      socket.off('comment_deleted', handleCommentDeleted);
    };
  }, [selectedPlan?.id]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  if (!hasAccess) return null;

  return (
    <div className="container mx-auto my-6 flex flex-col gap-4 px-4">
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <h1 className="mr-4 text-lg font-semibold text-zinc-100">Штаб</h1>
        <Link href="/hq/plans">
          <Button size="sm">Плани</Button>
        </Link>
      </div>

      <div className="grid min-h-[460px] grid-cols-1 gap-3 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="max-h-[calc(100vh-220px)] overflow-y-auto rounded-lg border border-white/10 bg-black/40 p-2">
          <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Список планів</div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-zinc-500">
              <LoaderIcon className="size-4 animate-spin" />
            </div>
          ) : plans.length === 0 ? (
            <div className="px-2 py-2 text-sm text-zinc-500">Плани не знайдено</div>
          ) : (
            <div className="space-y-1">
              {plans.map(plan => (
                <Link key={plan.id} href={`/hq/plans/${plan.id}`} className="block">
                  <div
                    className={cn(
                      'rounded-md border border-transparent px-3 py-2 transition-colors',
                      activePlanId === plan.id ? 'border-primary/40 bg-primary/15' : 'hover:bg-white/5',
                    )}>
                    <div className="relative mb-2 aspect-video w-full overflow-hidden rounded-md border border-white/10">
                      <Image
                        src={gamesById[plan.gameId]?.mission?.image?.url || '/images/avatar.jpg'}
                        alt={gamesById[plan.gameId]?.mission?.name || 'mission image'}
                        fill
                        className="object-cover"
                        unoptimized={!gamesById[plan.gameId]?.mission?.image?.url?.startsWith('https')}
                      />
                    </div>
                    <div className="truncate text-sm font-semibold text-zinc-100">
                      {plan.game?.mission?.name ?? `Гра #${plan.game?.position ?? '-'}`}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {dayjs(plan.game?.date).isValid()
                        ? dayjs(plan.game?.date).format('DD.MM.YYYY HH:mm')
                        : 'Без дати'}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span
                        className={cn(
                          'font-semibold',
                          sideColorClass(sidesById[gamesById[plan.gameId]?.attackSideId || '']?.type),
                        )}>
                        {gamesById[plan.gameId]?.missionVersion?.attackSideName ??
                          sidesById[gamesById[plan.gameId]?.attackSideId || '']?.name ??
                          '—'}
                      </span>
                      <span className="text-zinc-500">vs</span>
                      <span
                        className={cn(
                          'font-semibold',
                          sideColorClass(sidesById[gamesById[plan.gameId]?.defenseSideId || '']?.type),
                        )}>
                        {gamesById[plan.gameId]?.missionVersion?.defenseSideName ??
                          sidesById[gamesById[plan.gameId]?.defenseSideId || '']?.name ??
                          '—'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </aside>

        <section className="rounded-lg border border-white/10 bg-black/40 p-4">
          {!selectedPlan ? (
            <div className="py-10 text-center text-zinc-300 text-lg font-bold h-full flex items-center justify-center">
              Оберіть план
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Деталі гри</div>
                {selectedGame ? (
                  <div className="flex flex-col gap-3">
                    <div className="text-sm text-zinc-300">
                      Гра #{(selectedGame.position ?? selectedPlan.game?.position ?? 0) + 1}
                    </div>
                    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                      <MissionImagePanel game={selectedGame} />
                      <div className="lg:w-3/5">
                        <MissionDetails game={selectedGame} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500">Деталі гри недоступні</div>
                )}
              </div>

              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Командир</div>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedCommander ? (
                    <div className="flex items-center gap-2">
                      <Avatar
                        size="sm"
                        toProfileId={selectedCommander.id}
                        src={selectedCommander.avatar?.url ?? undefined}
                        alt={selectedCommander.nickname}
                      />
                      <span className="text-sm">
                        <UserNicknameText user={selectedCommander} />
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-zinc-200">Не призначено</span>
                  )}
                  {!selectedPlan.gameCommanderId && (
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          const { data } = await api.assignHeadquartersCommander(selectedPlan.id);
                          replacePlan(data);
                        } catch (error) {
                          console.error(error);
                          toast.error('Не вдалося призначити командира');
                        }
                      }}>
                      Призначити себе
                    </Button>
                  )}
                  {selectedPlan.gameCommanderId && (isCommander || isAdmin) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          const { data } = await api.unassignHeadquartersCommander(selectedPlan.id);
                          replacePlan(data);
                        } catch (error) {
                          console.error(error);
                          toast.error('Не вдалося зняти командира');
                        }
                      }}>
                      Зняти командира
                    </Button>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Посилання на план | (
                  <a
                    className="text-xs tracking-normal underline"
                    href="https://arma-plan-maker.com"
                    target="_blank"
                    rel="noopener noreferrer">
                    Arma Plan Maker
                  </a>
                  )
                </div>
                <Input
                  value={selectedPlan.planUrl ?? ''}
                  disabled={!canEditCommanderFields}
                  placeholder="https://..."
                  onChange={event => replacePlan({ ...selectedPlan, planUrl: event.target.value })}
                  onBlur={event => {
                    if (canEditCommanderFields) {
                      void updatePlanUrl(event.target.value.trim());
                    }
                  }}
                />
              </div>

              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <button
                  type="button"
                  className="mb-2 flex w-full cursor-pointer items-center justify-between rounded-md px-1 py-1 transition-colors hover:bg-white/5"
                  onClick={() => setIsSlotsOpen(prev => !prev)}>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Слоти</div>
                  <div className="text-xs text-zinc-400">
                    Всього: {totalSlots} · Зайнято: {totalOccupied} · Вільно: {Math.max(totalSlots - totalOccupied, 0)}
                  </div>
                  {isSlotsOpen ? (
                    <ChevronUpIcon className="size-4 text-zinc-400" />
                  ) : (
                    <ChevronDownIcon className="size-4 text-zinc-400" />
                  )}
                </button>
                {isSlotsOpen && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px] border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-zinc-400">
                          <th className="px-2 py-2">Відділення</th>
                          <th className="px-2 py-2">Типологія</th>
                          <th className="px-2 py-2">Техніка, озброєння</th>
                          <th className="px-2 py-2">Слоти</th>
                          <th className="px-2 py-2">Бронювання</th>
                          <th className="px-2 py-2">Бажаючі</th>
                          <th className="px-2 py-2">Старт</th>
                          <th className="px-2 py-2">Коментар</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPlan.slots.map(slot => {
                          const isWantedByMySquad = Boolean(
                            currentSquad && slot.wantedSquads.some(squad => squad.id === currentSquad.id),
                          );
                          return (
                            <tr key={slot.id} className="border-b border-white/5 align-top">
                              <td className="px-2 py-2 text-zinc-100">{slot.slotNumber}</td>
                              <td className="px-2 py-2">
                                <Input
                                  value={slot.name ?? ''}
                                  disabled={!canEditCommanderFields}
                                  onChange={event => replaceSlot({ ...slot, name: event.target.value })}
                                  onBlur={event =>
                                    canEditCommanderFields &&
                                    void updateSlotField(slot.id, { name: event.target.value || null })
                                  }
                                />
                              </td>
                              <td className="px-2 py-2">
                                <Input
                                  value={slot.weaponry ?? ''}
                                  disabled={!canEditCommanderFields}
                                  onChange={event => replaceSlot({ ...slot, weaponry: event.target.value })}
                                  onBlur={event =>
                                    canEditCommanderFields &&
                                    void updateSlotField(slot.id, { weaponry: event.target.value || null })
                                  }
                                />
                              </td>
                              <td className="px-2 py-2">
                                <NumericInput
                                  value={String(slot.slotCount ?? 0)}
                                  disabled={!canEditCommanderFields}
                                  onChange={event => {
                                    const value = event.target.value;
                                    replaceSlot({ ...slot, slotCount: Number(value) || 0 });
                                  }}
                                  onBlur={event => {
                                    if (canEditCommanderFields) {
                                      const value = Number(event.target.value);
                                      void updateSlotField(slot.id, {
                                        slotCount: Number.isFinite(value) ? value : null,
                                      });
                                    }
                                  }}
                                />
                              </td>
                              <td className="px-2 py-2">
                                {canEditCommanderFields ? (
                                  <Select
                                    multiple
                                    localSearch
                                    placeholder="Оберіть загони"
                                    options={squadOptions}
                                    value={slot.assignedSquads.map(squad => squad.id)}
                                    onChange={value => {
                                      void syncAssignedSquads(slot, value);
                                    }}
                                  />
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {slot.assignedSquads.map(squad => (
                                      <div
                                        key={squad.id}
                                        className="flex items-center gap-1 rounded-md border border-white/10 bg-black/30 px-2 py-1">
                                        <Image
                                          src={squadsById[squad.id]?.logo?.url || '/images/avatar.jpg'}
                                          width={16}
                                          height={16}
                                          alt={squad.tag}
                                          className="size-4 rounded-full object-cover"
                                          unoptimized={!squadsById[squad.id]?.logo?.url?.startsWith('https')}
                                        />
                                        <span className="text-xs text-zinc-200">{squad.tag}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="px-2 py-2">
                                <div className="flex flex-wrap gap-2">
                                  {slot.wantedSquads.map(squad => (
                                    <div
                                      key={squad.id}
                                      className="flex items-center gap-1 rounded-md border border-white/10 bg-black/30 px-2 py-1">
                                      <Image
                                        src={squadsById[squad.id]?.logo?.url || '/images/avatar.jpg'}
                                        width={16}
                                        height={16}
                                        alt={squad.tag}
                                        className="size-4 rounded-full object-cover"
                                        unoptimized={!squadsById[squad.id]?.logo?.url?.startsWith('https')}
                                      />
                                      <span className="text-xs text-zinc-200">{squad.tag}</span>
                                    </div>
                                  ))}
                                </div>
                                {currentSquad && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-2"
                                    onClick={async () => {
                                      try {
                                        const { data } = isWantedByMySquad
                                          ? await api.unassignHeadquartersSlotWantedSquad(slot.id)
                                          : await api.assignHeadquartersSlotWantedSquad(slot.id);
                                        replaceSlot(data);
                                      } catch (error) {
                                        console.error(error);
                                        toast.error('Не вдалося змінити список бажаючих');
                                      }
                                    }}>
                                    {isWantedByMySquad ? 'Більше не хочемо' : 'Хочемо цей слот'}
                                  </Button>
                                )}
                              </td>
                              <td className="px-2 py-2">
                                <Input
                                  value={slot.spawnPoint ?? ''}
                                  disabled={!canEditCommanderFields}
                                  onChange={event => replaceSlot({ ...slot, spawnPoint: event.target.value })}
                                  onBlur={event =>
                                    canEditCommanderFields &&
                                    void updateSlotField(slot.id, { spawnPoint: event.target.value || null })
                                  }
                                />
                              </td>
                              <td className="px-2 py-2">
                                <Input
                                  value={slot.comment ?? ''}
                                  disabled={!canEditCommanderFields}
                                  onChange={event => replaceSlot({ ...slot, comment: event.target.value })}
                                  onBlur={event =>
                                    canEditCommanderFields &&
                                    void updateSlotField(slot.id, { comment: event.target.value || null })
                                  }
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Коментарі</div>

                {isCommentsLoading ? (
                  <div className="flex items-center justify-center py-6 text-zinc-500">
                    <LoaderIcon className="size-4 animate-spin" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="mb-3 text-sm text-zinc-500">Ще немає коментарів</div>
                ) : (
                  <ul className="mb-3 flex flex-col gap-2">
                    {comments.map(comment => (
                      <li key={comment.id} className="rounded-md border border-white/10 bg-black/30 p-2">
                        <div className="mb-1 flex items-center gap-2">
                          <Avatar
                            size="sm"
                            toProfileId={comment.user?.id}
                            src={comment.user?.avatar?.url ?? undefined}
                            alt={comment.user?.nickname ?? ''}
                          />
                          {comment.user ? (
                            <UserNicknameText user={comment.user as User} />
                          ) : (
                            <span className="text-sm text-zinc-300">Користувач</span>
                          )}
                          <span className="text-xs text-zinc-500">{dayjs(comment.createdAt).format('DD.MM.YYYY HH:mm')}</span>
                        </div>
                        <MessageContent message={comment.message as MissionCommentMessage} />
                      </li>
                    ))}
                  </ul>
                )}

                <MessageEditor
                  placeholder="Написати коментар..."
                  maxCharacters={500}
                  disabled={isCommentSending}
                  onSubmit={async ({ lexicalState }) => {
                    if (!selectedPlan?.id) return;
                    setIsCommentSending(true);
                    try {
                      const { data } = await api.createHeadquartersComment(selectedPlan.id, {
                        message: lexicalState as MissionCommentMessage,
                      });
                      setComments(prev => (prev.some(item => item.id === data.id) ? prev : [data, ...prev]));
                    } catch (error) {
                      console.error(error);
                      toast.error('Не вдалося додати коментар');
                    } finally {
                      setIsCommentSending(false);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
