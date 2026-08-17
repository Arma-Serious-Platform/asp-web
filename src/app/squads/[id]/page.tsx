'use client';

import { UserNicknameText } from '@/entities/user/ui/user-text';
import { session } from '@/entities/session/session.state';
import { SquadModel } from '@/entities/squad/squad.model';
import { SpecializationBadges } from '@/entities/specialization/ui/specialization-badges';
import { ChangeSocials } from '@/features/user/change-socials';
import { RequestToJoinSquadButton } from '@/app/squads/ui/request-to-join';
import { ROUTES } from '@/shared/config/routes';
import { squadsApi } from '@/shared/sdk';
import { SideType, SquadJoinRequest, SquadRole, User } from '@/shared/sdk/types';
import { Avatar } from '@/shared/ui/organisms/avatar';
import { Button } from '@/shared/ui/atoms/button';
import { cn } from '@/shared/utils/cn';
import { Layout } from '@/widgets/layout';
import { ActivityIcon, ArrowLeftIcon, LoaderIcon, ShieldIcon, UsersRoundIcon } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { MessageContent } from '@/entities/comment/lexical-message';
import { observer } from 'mobx-react-lite';
const sideAppearance = (sideType?: SideType) => {
  if (sideType === SideType.RED) {
    return { label: 'OPFOR', badge: 'bg-red-500/20 text-red-300 border-red-500/40', dot: 'bg-red-500' };
  }
  if (sideType === SideType.BLUE) {
    return { label: 'BLUFOR', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40', dot: 'bg-blue-500' };
  }
  return { label: 'Незалежний', badge: 'bg-amber-500/15 text-amber-200 border-amber-400/35', dot: 'bg-amber-400' };
};

const SquadRoleBadge = ({ label }: { label: string }) => (
  <span className="rounded-full border border-white/10 bg-black/50 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
    {label}
  </span>
);

export default observer(function SquadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const squadId = params?.id as string;

  const [squad, setSquad] = useState<SquadModel | null>(null);
  const [joinRequests, setJoinRequests] = useState<SquadJoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadSquad = useCallback(async () => {
    if (!squadId) return;

    setIsLoading(true);
    setNotFound(false);

    try {
      const { data } = await squadsApi.findSquadById(squadId);
      setSquad(new SquadModel(data));
    } catch (error) {
      console.error(error);
      setSquad(null);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [squadId]);

  useEffect(() => {
    void loadSquad();
  }, [loadSquad]);

  const canRequestToJoin = Boolean(session.isAuthorized && session.user?.data && !session.user?.data.squad);

  useEffect(() => {
    if (!canRequestToJoin) {
      setJoinRequests([]);
      return;
    }

    const loadJoinRequests = async () => {
      try {
        const { data } = await squadsApi.mySquadJoinRequests();
        setJoinRequests(data);
      } catch (error) {
        console.error(error);
      }
    };

    void loadJoinRequests();
  }, [canRequestToJoin]);

  const squadData = squad?.data;
  const sideType = squadData?.side?.type;
  const appearance = sideAppearance(sideType);
  const currentUserId = session.user?.data?.id;
  const subleaders = squad?.subleaders ?? [];
  const specializationStats = Array.from(
    (squadData?.members ?? [])
      .flatMap(member => (member.specializations ?? []) as { id: string; name: string; color?: string | null; icon?: { url: string } | null }[])
      .reduce((stats, specialization) => {
        const current = stats.get(specialization.id);

        stats.set(specialization.id, {
          id: specialization.id,
          name: specialization.name,
          color: specialization.color,
          icon: specialization.icon,
          count: (current?.count ?? 0) + 1,
        });

        return stats;
      }, new Map<string, { id: string; name: string; color?: string | null; icon?: { url: string } | null; count: number }>())
      .values(),
  ).sort((first, second) => first.name.localeCompare(second.name, 'uk'));
  const pendingJoinRequest = squadData
    ? (joinRequests.find(request => request.squadId === squadData.id && request.status === 'PENDING') ??
      squadData.joinRequests?.find(request => request.userId === currentUserId && request.status === 'PENDING') ??
      null)
    : null;

  return (
    <Layout className="w-full">
      <div className="container mx-auto mt-6 flex w-full flex-col gap-6 px-4 pb-10">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2 text-zinc-300" onClick={() => router.push(ROUTES.squads)}>
            <ArrowLeftIcon className="size-4" />
            До списку загонів
          </Button>
        </div>

        {isLoading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-white/10 bg-black/30">
            <LoaderIcon className="size-8 animate-spin text-zinc-400" />
          </div>
        ) : notFound || !squadData ? (
          <div className="paper flex flex-col items-center gap-4 rounded-xl border px-6 py-12 text-center">
            <p className="text-lg text-zinc-300">Загін не знайдено або недоступний.</p>
            <Button variant="outline" onClick={() => router.push(ROUTES.squads)}>
              Повернутися до загонів
            </Button>
          </div>
        ) : (
          <>
            <div className="paper relative overflow-hidden rounded-xl border px-5 py-6 shadow-xl sm:px-8 sm:py-8">
              <div className="pointer-events-none absolute -right-24 top-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="relative flex flex-col gap-6">
                <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
                  <div className="flex min-w-0 flex-col items-center gap-3">
                    <div className="w-full max-w-[260px] overflow-hidden rounded-2xl border border-white/10 bg-black/50 shadow-lg">
                      <Image
                        src={squadData.logo?.url || '/images/avatar.jpg'}
                        alt={squadData.name}
                        width={260}
                        height={260}
                        className="aspect-square w-full object-cover"
                        unoptimized={!squadData.logo?.url?.startsWith('https')}
                      />
                    </div>
                    {squadData.tag && (
                      <div className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-center text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
                        {squadData.tag}
                      </div>
                    )}
                    {specializationStats.length > 0 && (
                      <div className="flex w-full max-w-[260px] flex-wrap justify-center gap-1.5">
                        {specializationStats.map(stat => (
                          <span
                            key={stat.id}
                            className="inline-flex min-w-0 items-center justify-center gap-1 rounded-full border bg-black/35 px-2 py-0.5 text-xs font-semibold"
                            style={{ borderColor: stat.color || '#84cc16', color: stat.color || '#84cc16' }}>
                            {stat.icon?.url ? (
                              <Image
                                src={stat.icon.url}
                                alt=""
                                width={14}
                                height={14}
                                className="size-3.5 shrink-0 rounded-full object-cover"
                                unoptimized={!stat.icon.url.startsWith('https')}
                              />
                            ) : (
                              <span
                                className="size-1.5 shrink-0 rounded-full"
                                style={{ backgroundColor: stat.color || '#84cc16' }}
                                aria-hidden
                              />
                            )}
                            <span className="truncate">
                              {stat.name}: {stat.count}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-5">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
                            appearance.badge,
                          )}>
                          <span className={cn('size-1.5 rounded-full', appearance.dot)} />
                          {appearance.label}
                          {squadData.side?.name ? (
                            <span className="font-normal normal-case text-zinc-400">· {squadData.side.name}</span>
                          ) : null}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2.5 py-0.5 text-xs text-zinc-400">
                          <UsersRoundIcon className="size-3.5" />
                          Учасників: {squadData._count?.members ?? squadData.members?.length ?? 0}
                        </span>
                        {typeof squadData.activeCount === 'number' ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2.5 py-0.5 text-xs text-zinc-400">
                            <ActivityIcon className="size-3.5 text-lime-400" />
                            Активних: {squadData.activeCount}
                          </span>
                        ) : null}
                        <span
                          className={cn(
                            'inline-flex rounded-full border px-2.5 py-0.5 text-xs',
                            squadData.recruiting
                              ? 'border-lime-500/40 bg-lime-500/10 text-lime-200'
                              : 'border-zinc-600/60 bg-zinc-800/60 text-zinc-400',
                          )}>
                          {squadData.recruiting ? 'Набір відкрито' : 'Набір закрито'}
                        </span>
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{squadData.name}</h1>
                        {squadData.description ? (
                          <div className="mt-3 max-w-3xl rounded-lg border border-white/10 bg-black/25 p-4 text-sm leading-relaxed text-zinc-300">
                            <MessageContent message={squadData.description} />
                          </div>
                        ) : (
                          <div className="mt-3 max-w-3xl rounded-lg border border-white/10 bg-black/25 p-4 text-sm text-zinc-500">
                            Опис загону не додано.
                          </div>
                        )}
                      </div>
                    </div>

                    <RequestToJoinSquadButton
                      squad={squadData}
                      pendingRequest={pendingJoinRequest}
                      onRequestCreated={request =>
                        setJoinRequests(current => [...current.filter(item => item.id !== request.id), request])
                      }
                      className="w-full sm:w-fit"
                    />

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-white/10 bg-black/25 p-4">
                        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                          <ShieldIcon className="size-4 text-amber-400/90" />
                          Командир
                        </div>
                        <div className="flex items-center gap-3">
                          <Avatar
                            size="md"
                            toProfileId={squadData.leader?.nickname}
                            src={squadData.leader?.avatar?.url ?? undefined}
                            alt={squadData.leader?.nickname ?? ''}
                          />
                          <div className="min-w-0">
                            <div className="text-base font-semibold text-zinc-100">
                              {squadData.leader ? (
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                  <UserNicknameText user={{ ...squadData.leader, squad: squadData } as User} />
                                  <SquadRoleBadge label="Лідер" />
                                </div>
                              ) : (
                                <span className="text-zinc-500">—</span>
                              )}
                            </div>
                            <SpecializationBadges
                              specializations={squadData.leader?.specializations}
                              className="mt-1"
                              compact
                            />
                          </div>
                        </div>
                      </div>

                      {subleaders.length > 0 && (
                        <div className="rounded-lg border border-white/10 bg-black/25 p-4">
                          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            <ShieldIcon className="size-4 text-lime-400/90" />
                            Заступники
                          </div>
                          <div className="flex flex-col gap-2">
                            {subleaders.map(subleader => (
                              <div key={subleader.id} className="flex items-center gap-3">
                                <Avatar
                                  size="sm"
                                  toProfileId={subleader.nickname}
                                  src={subleader.avatar?.url ?? undefined}
                                  alt={subleader.nickname}
                                />
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                  <UserNicknameText user={{ ...subleader, squadData } as User} />
                                  <SquadRoleBadge label={SquadModel.roleLabels[subleader.squadRole ?? SquadRole.MEMBER]} />
                                  <SpecializationBadges specializations={subleader.specializations} compact />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <ChangeSocials
                  socials={squadData}
                  readonly
                  className="min-w-0 overflow-hidden border-t border-white/10 pt-4"
                  linksClassName="w-full min-w-0 max-w-full flex-nowrap overflow-x-auto pb-1"
                  onChange={() => undefined}
                />
              </div>
            </div>

            <section className="paper rounded-xl border px-4 py-5 shadow-lg sm:px-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-100">
                <UsersRoundIcon className="size-5 text-zinc-400" />
                Учасники
              </h2>
              {(() => {
                const members = (squad?.membersSortedByRole ?? []).filter(
                  member => member.id !== squadData?.leader?.id && member.squadRole !== SquadRole.SUBLEADER,
                );

                if (!members.length) {
                  return <p className="text-sm text-zinc-500">Інших учасників немає.</p>;
                }

                return (
                  <ul className="flex flex-col divide-y divide-white/10">
                    {members.map(member => (
                      <li key={member.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <Avatar
                          size="sm"
                          toProfileId={member.nickname}
                          src={member.avatar?.url ?? undefined}
                          alt={member.nickname}
                        />
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                          <UserNicknameText user={{ ...member, squad: squadData } as User} />
                          <SquadRoleBadge label={SquadModel.roleLabels[member.squadRole ?? SquadRole.MEMBER]} />
                          <SpecializationBadges specializations={member.specializations} compact />
                        </div>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </section>
          </>
        )}
      </div>
    </Layout>
  );
});
