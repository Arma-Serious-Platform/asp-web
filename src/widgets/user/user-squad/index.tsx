import { ROUTES } from '@/shared/config/routes';
import { User } from '@/shared/sdk/types';
import { Button } from '@/shared/ui/atoms/button';
import { Link } from '@/shared/ui/atoms/link';
import Image from 'next/image';
import { FC } from 'react';
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

export const UserSquad: FC<{
  user: User | null;
}> = ({ user }) => {
  if (!user) return null;

  const squad = user.squad;

  if (!squad)
    return (
      <div className="flex flex-col gap-2 justify-center">
        Ви одинак.
        <br />
        Якщо бажаєте приєднатися до загону, оберіть загін зі списку та поспілкуйтеся з командиром.
        <Link href={ROUTES.squads} className="w-fit mx-auto">
          <Button>Загони проекту</Button>
        </Link>
        <View.Condition if={user.squadInvites?.length > 0}>
          <SquadInviteList
            invitations={user.squadInvites || []}
            model={acceptOrRejectInviteModel}
            onAccept={invitation => {
              // Optionally refresh the user data or show success message
              // The user data should be refreshed to reflect the new squad membership
            }}
            onReject={invitation => {
              // Optionally refresh the user data
            }}
          />
        </View.Condition>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/60 p-4 shadow-md">
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
          </div>

          <div className="flex gap-2">
            {user.id === squad.leader?.id && (
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
                    // Optionally refresh the user data or show success message
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
          // Optionally refresh the user data or show success message
        }}
      />

      <LeaveFromSquadModal
        model={leaveFromSquadModel}
        onLeaveSuccess={() => {
          // Optionally refresh the user data or show success message
        }}
      />

      <div className="mt-2 flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Склад загону</span>
        {Array.isArray(squad.members) && squad.members.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {squad.members.map(member => (
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
                  {member.id === user.id && (
                    <span className="text-[10px] uppercase tracking-[0.16em] text-primary whitespace-nowrap">(ви)</span>
                  )}

                  {squad?.leader?.id === user.id && member.id !== user.id && (
                    <Button
                      className="ml-auto"
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
      </div>
    </div>
  );
};
