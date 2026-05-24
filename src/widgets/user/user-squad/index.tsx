import { ROUTES } from '@/shared/config/routes';
import { SquadRole, User } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Link } from '@/shared/ui/atoms/link';
import Image from 'next/image';
import { FC, useCallback, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { session } from '@/entities/session/model';
import { api } from '@/shared/sdk';
import { InviteToSquadModal } from '@/features/squads/invite-to-squad/ui';
import { inviteToSquadModel } from '@/features/squads/invite-to-squad/model';
import { View } from '@/features/view';
import { SquadInviteList } from '@/features/squads/accept-or-reject-invite/ui';
import { acceptOrRejectInviteModel } from '@/features/squads/accept-or-reject-invite/model';
import { Avatar } from '@/shared/ui/organisms/avatar';
import { UserNicknameText } from '@/entities/user/ui/user-text';
import { KickFromSquadModal } from '@/features/squads/kick-from-squad/ui';
import { kickFromSquadModel } from '@/features/squads/kick-from-squad/model';
import { LeaveFromSquadModal } from '@/features/squads/leave-from-squad/ui';
import { leaveFromSquadModel } from '@/features/squads/leave-from-squad/model';
import { UpdateMySquadForm } from '@/features/squads/update-my-squad/ui';
import { SquadJoinRequestsModel } from '@/features/squads/join-requests/model';
import { SquadJoinRequestList } from '@/features/squads/join-requests/ui';
import { cn } from '@/shared/utils/cn';
import { SQUAD_MEMBER_ROLE_OPTIONS, SQUAD_ROLE_LABELS, sortSquadMembersByRole } from '@/entities/squad/lib';
import { Select } from '@/shared/ui/atoms/select';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from '@/shared/ui/organisms/dialog';

type SquadProfileSubtab = 'members' | 'settings' | 'requests';

export const UserSquad: FC<{
  user: User | null;
  onSquadChanged?: () => void | Promise<void>;
}> = observer(({ user, onSquadChanged }) => {
  const [subtab, setSubtab] = useState<SquadProfileSubtab>('members');
  const [changingRoleUserId, setChangingRoleUserId] = useState<string | null>(null);
  const [leadershipTransferCandidate, setLeadershipTransferCandidate] = useState<User | null>(null);
  const [isTransferringLeadership, setIsTransferringLeadership] = useState(false);
  const joinRequestsModel = useMemo(() => new SquadJoinRequestsModel(), []);

  const refreshSquadState = useCallback(async () => {
    await session.fetchMe();
    await onSquadChanged?.();
  }, [onSquadChanged]);
  if (!user) return null;

  const squad = user.squad;
  const hasPendingInvites = (user.squadInvites ?? []).some(invite => invite.status === 'PENDING');
  const isLeader = user.id === squad?.leader?.id;
  const isSubleader = user.squadRole === SquadRole.SUBLEADER;
  const canManageSquadMembers = isLeader || isSubleader;
  const roleOptions = isLeader
    ? SQUAD_MEMBER_ROLE_OPTIONS
    : SQUAD_MEMBER_ROLE_OPTIONS.filter(option => option.value !== SquadRole.SUBLEADER);

  const canChangeRoleForMember = useCallback(
    (member: User) => {
      if (!squad || !canManageSquadMembers) return false;
      if (member.id === user.id || member.id === squad.leader?.id) return false;
      if (isSubleader && member.squadRole === SquadRole.SUBLEADER) return false;

      return true;
    },
    [canManageSquadMembers, isSubleader, squad, user.id],
  );

  const handleChangeMemberRole = useCallback(
    async (member: User, role: SquadRole) => {
      try {
        setChangingRoleUserId(member.id);
        await api.updateSquadMemberRole({ userId: member.id, role });
        toast.success('Роль учасника оновлено');
        await refreshSquadState();
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || 'Не вдалося оновити роль учасника';
        toast.error(errorMessage);
      } finally {
        setChangingRoleUserId(null);
      }
    },
    [refreshSquadState],
  );

  const handleTransferLeadership = useCallback(async () => {
    if (!leadershipTransferCandidate) return;

    try {
      setIsTransferringLeadership(true);
      await api.transferSquadLeadership(leadershipTransferCandidate.id);
      toast.success('Лідерство передано');
      setLeadershipTransferCandidate(null);
      await refreshSquadState();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Не вдалося передати лідерство';
      toast.error(errorMessage);
    } finally {
      setIsTransferringLeadership(false);
    }
  }, [leadershipTransferCandidate, refreshSquadState]);

  if (!squad)
    return (
      <div className="flex flex-col gap-2 justify-center">
        Ви одинак.
        <br />
        Якщо бажаєте приєднатися до загону, оберіть загін зі списку та подайте заявку.
        <Link href={ROUTES.squads} className="w-fit mx-auto">
          <Button>Загони проекту</Button>
        </Link>
        <View.Condition if={hasPendingInvites}>
          <SquadInviteList
            invitations={user.squadInvites || []}
            model={acceptOrRejectInviteModel}
            onAccept={refreshSquadState}
            onReject={refreshSquadState}
          />
        </View.Condition>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/60 p-4 shadow-md">
      <Dialog
        open={Boolean(leadershipTransferCandidate)}
        onOpenChange={open => !open && setLeadershipTransferCandidate(null)}>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Передати лідерство?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-zinc-400">
            Ви передасте лідерство загону користувачу{' '}
            <span className="font-semibold text-zinc-200">{leadershipTransferCandidate?.nickname}</span>. Після цього ви
            втратите права лідера.
          </p>

          <div className="mt-4 flex justify-between gap-2">
            <Button
              variant="outline"
              disabled={isTransferringLeadership}
              onClick={() => setLeadershipTransferCandidate(null)}>
              Скасувати
            </Button>
            <Button variant="destructive" disabled={isTransferringLeadership} onClick={handleTransferLeadership}>
              Передати лідерство
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex gap-4">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-black/70">
          <Image
            src={squad.logo?.url || '/images/logo.webp'}
            alt={squad.name}
            width={128}
            height={128}
            className="h-32 w-32 object-cover"
            unoptimized={!squad.logo?.url?.startsWith('https')}
          />
        </div>

        <div className="flex flex-1 flex-col justify-between gap-2">
          <div className="flex flex-col gap-1">
            <div className="text-xl font-semibold text-white">{squad.name}</div>
            {squad.tag && (
              <div className="inline-flex w-fit items-center rounded-full border border-white/15 bg-black/60 px-3 py-0.5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-200">
                {squad.tag}
              </div>
            )}
            <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
              <span>Активних: {squad.activeCount ?? 0}</span>
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5',
                  squad.recruiting
                    ? 'border-lime-500/40 bg-lime-500/10 text-lime-200'
                    : 'border-zinc-600/60 bg-zinc-800/60 text-zinc-400',
                )}>
                {squad.recruiting ? 'Набір відкрито' : 'Набір закрито'}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {canManageSquadMembers && (
              <>
                <Button
                  size="sm"
                  className="w-fit"
                  onClick={() => {
                    inviteToSquadModel.visibility.open({ squad });
                  }}>
                  Запросити учасника
                </Button>
                <InviteToSquadModal
                  model={inviteToSquadModel}
                  onInviteSuccess={() => {
                    void refreshSquadState();
                  }}
                />
              </>
            )}
            <Button
              size="sm"
              variant="destructive"
              className="w-fit"
              onClick={() => {
                leaveFromSquadModel.visibility.open({
                  squad,
                  isLeader: user.id === squad.leader?.id,
                });
              }}>
              Покинути загін
            </Button>
          </div>
        </div>
      </div>

      <KickFromSquadModal
        model={kickFromSquadModel}
        onKickSuccess={() => {
          void refreshSquadState();
        }}
      />

      <LeaveFromSquadModal model={leaveFromSquadModel} onLeaveSuccess={refreshSquadState} />

      {isLeader && (
        <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
          {[
            { id: 'members' as const, label: 'Склад' },
            { id: 'settings' as const, label: 'Налаштування' },
            { id: 'requests' as const, label: 'Заявки' },
          ].map(tab => (
            <Button
              key={tab.id}
              type="button"
              size="sm"
              variant={subtab === tab.id ? 'default' : 'secondary'}
              onClick={() => setSubtab(tab.id)}>
              {tab.label}
            </Button>
          ))}
        </div>
      )}

      <div className="mt-2 flex flex-col gap-2">
        {(!isLeader || subtab === 'members') && (
          <>
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Склад загону</span>
            {Array.isArray(squad.members) && squad.members.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {[
                  ...squad.members.filter(member => member.id === squad.leader?.id),
                  ...sortSquadMembersByRole(squad.members.filter(member => member.id !== squad.leader?.id)),
                ].map(member => (
                  <li
                    key={member.id}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/40 p-2 hover:bg-black/60 transition-colors">
                    <Avatar src={member.avatar?.url} alt={member.nickname || member.id} size="sm" />
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <UserNicknameText
                        user={member}
                        tag={squad.tag}
                        sideType={squad.side?.type}
                        className="text-sm text-zinc-200"
                        link={true}
                      />
                      <span className="rounded-full border border-white/10 bg-black/50 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                        {member.id === squad.leader?.id
                          ? 'Лідер'
                          : SQUAD_ROLE_LABELS[member.squadRole ?? SquadRole.MEMBER]}
                      </span>

                      {member.id === user.id && (
                        <span className="text-[10px] uppercase tracking-[0.16em] text-primary whitespace-nowrap">
                          (ви)
                        </span>
                      )}

                      {canChangeRoleForMember(member) && (
                        <div className="ml-auto w-40">
                          <Select
                            value={member.squadRole ?? SquadRole.MEMBER}
                            onChange={value => value && handleChangeMemberRole(member, value as SquadRole)}
                            options={roleOptions}
                            disabled={changingRoleUserId === member.id}
                          />
                        </div>
                      )}

                      {isLeader && member.squadRole === SquadRole.SUBLEADER && member.id !== user.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          className={cn(!canChangeRoleForMember(member) && 'ml-auto')}
                          disabled={isTransferringLeadership}
                          onClick={() => setLeadershipTransferCandidate(member)}>
                          Передати лідерство
                        </Button>
                      )}

                      {isLeader && member.id !== user.id && member.id !== squad.leader?.id && (
                        <Button
                          className={cn(!canChangeRoleForMember(member) && 'ml-auto')}
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            kickFromSquadModel.visibility.open({ user: member });
                          }}>
                          Вилучити
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-xs text-zinc-400">Інформація про учасників загону недоступна.</span>
            )}
          </>
        )}

        {isLeader && subtab === 'settings' && <UpdateMySquadForm squad={squad} onUpdated={refreshSquadState} />}

        {isLeader && subtab === 'requests' && (
          <SquadJoinRequestList model={joinRequestsModel} onChanged={refreshSquadState} />
        )}
      </div>
    </div>
  );
});
