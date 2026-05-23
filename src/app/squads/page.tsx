'use client';

import { LoaderIcon } from 'lucide-react';

import { FC, useCallback, useEffect, useState } from 'react';

import { observer } from 'mobx-react-lite';

import { Layout } from '@/widgets/layout';

import { SquadListingCard } from '@/entities/squad/ui/squad-listing-card';

import { model } from './model';
import { SideType, Squad, SquadJoinRequest } from '@/shared/sdk/types';
import { cn } from '@/shared/utils/cn';
import { session } from '@/entities/session/model';
import { api } from '@/shared/sdk';

const NoSquadsInformer: FC<{
  type: SideType;
}> = ({ type }) => (
  <div
    className={cn('rounded-md border py-2 text-xs px-3', {
      'text-blue-100/80 border-blue-500/40 bg-blue-500/5': type === SideType.BLUE,
      'text-red-100/80 border-red-500/40 bg-red-500/5': type === SideType.RED,
    })}>
    Наразі немає загонів, закріплених за {type === SideType.BLUE ? 'BLUFOR' : 'OPFOR'}.
  </div>
);

const SquadsPage = observer(() => {
  const [joinRequests, setJoinRequests] = useState<SquadJoinRequest[]>([]);

  useEffect(() => {
    void model.squads.init();
  }, []);

  const currentUserId = session.user?.user?.id;
  const canRequestToJoin = Boolean(session.isAuthorized && session.user?.user && !session.user.user.squad);

  useEffect(() => {
    if (!canRequestToJoin) {
      setJoinRequests([]);
      return;
    }

    const loadJoinRequests = async () => {
      try {
        const { data } = await api.squadJoinRequests();
        setJoinRequests(data);
      } catch (error) {
        console.error(error);
      }
    };

    void loadJoinRequests();
  }, [canRequestToJoin]);

  const getPendingRequestForSquad = useCallback(
    (squad: Squad) =>
      joinRequests.find(request => request.squadId === squad.id && request.status === 'PENDING') ??
      squad.joinRequests?.find(
        request => request.userId === currentUserId && request.status === 'PENDING',
      ) ??
      null,
    [currentUserId, joinRequests],
  );

  const handleJoinRequestCreated = useCallback((request: SquadJoinRequest) => {
    setJoinRequests(current => [...current.filter(item => item.id !== request.id), request]);
  }, []);

  const isInitialLoading = model.squads.pagination.preloader.isLoading && model.squads.pagination.data.length === 0;
  const blueSquads = model.squads.blueSquads;
  const redSquads = model.squads.redSquads;
  const unassignedSquads = model.squads.unassignedSquads;

  return (
    <Layout showHero className="w-full mx-auto">
      <div className="container mx-auto mt-6 flex w-full flex-col gap-6 px-4">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">Загони проєкту</h1>
          <p className="max-w-2xl text-sm text-zinc-300">
            Сторони <span className="font-semibold text-blue-400">BLUFOR</span> та{' '}
            <span className="font-semibold text-red-400">OPFOR</span> протистоять одна одній. Незалежні загони мають
            менший пріоритет займання слотів перед початком гри.
          </p>
        </header>

        <div className="paper relative overflow-hidden rounded-xl border px-4 py-5 shadow-xl">
          <div className="pointer-events-none absolute -left-20 -top-32 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 -bottom-40 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />

          {isInitialLoading ? (
            <div className="relative flex min-h-[200px] items-center justify-center py-12">
              <LoaderIcon className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
          ) : (
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-stretch">
              {/* BLUFOR side */}
              <section className="flex w-full flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-1 rounded-full bg-blue-500/70 shadow-[0_0_18px_rgba(59,130,246,0.8)]" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-300/80">
                      Сторона
                    </span>
                    <span className="text-xl font-semibold text-blue-200 drop-shadow-[0_0_12px_rgba(37,99,235,0.75)]">
                      BLUFOR
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {blueSquads.length === 0 && <NoSquadsInformer type={SideType.BLUE} />}
                  {blueSquads.map(squad => (
                    <SquadListingCard
                      key={squad.id}
                      squad={squad}
                      pendingJoinRequest={getPendingRequestForSquad(squad)}
                      onJoinRequestCreated={handleJoinRequestCreated}
                    />
                  ))}
                </div>
              </section>

              {/* VS divider */}
              <div className="my-2 flex items-center justify-center lg:my-0 lg:px-6">
                <div className="relative flex flex-col items-center justify-center gap-2">
                  <span className="hidden h-24 w-px bg-linear-to-b from-blue-400/50 via-zinc-500/60 to-red-400/70 lg:block" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-black/70 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-200 shadow-[0_0_30px_rgba(0,0,0,0.85)]">
                    <span className="absolute inset-[2px] rounded-full bg-linear-to-br from-blue-500/20 to-red-500/25" />
                    <span className="relative">VS</span>
                  </div>
                  <span className="hidden h-24 w-px bg-linear-to-b from-red-400/70 to-blue-400/50 lg:block" />
                </div>
              </div>

              {/* OPFOR side */}
              <section className="flex w-full flex-col gap-3">
                <div className="flex items-center justify-end gap-2">
                  <div className="flex flex-col text-right">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-300/80">
                      Сторона
                    </span>
                    <span className="text-xl font-semibold text-red-200 drop-shadow-[0_0_12px_rgba(220,38,38,0.8)]">
                      OPFOR
                    </span>
                  </div>
                  <span className="h-7 w-1 rounded-full bg-red-500/70 shadow-[0_0_18px_rgba(239,68,68,0.9)]" />
                </div>

                <div className="flex flex-col gap-3">
                  {redSquads.length === 0 && <NoSquadsInformer type={SideType.RED} />}
                  {redSquads.map(squad => (
                    <SquadListingCard
                      key={squad.id}
                      squad={squad}
                      align="right"
                      pendingJoinRequest={getPendingRequestForSquad(squad)}
                      onJoinRequestCreated={handleJoinRequestCreated}
                    />
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Independent squads */}
        {!isInitialLoading && unassignedSquads.length > 0 && (
          <section className="mb-4 mt-1 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-linear-to-r from-transparent via-zinc-500/60 to-transparent" />
              <div className="rounded-full border border-amber-400/35 bg-amber-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.55)]">
                Незалежні загони
              </div>
              <span className="h-px flex-1 bg-linear-to-r from-transparent via-zinc-500/60 to-transparent" />
            </div>
            <div className="paper flex flex-wrap gap-3 rounded-xl border p-4 shadow-lg">
              {unassignedSquads.map(squad => (
                <div key={squad.id} className="w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.5rem)]">
                  <SquadListingCard
                    squad={squad}
                    pendingJoinRequest={getPendingRequestForSquad(squad)}
                    onJoinRequestCreated={handleJoinRequestCreated}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
});

export default SquadsPage;
